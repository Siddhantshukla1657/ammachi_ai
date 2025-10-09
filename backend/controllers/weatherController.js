const axios = require("axios");

/**
 * Utility: Standard API Error Response
 */
const handleError = (res, error, fallbackMessage) => {
  console.error("OpenWeather API error:", error.message);

  if (error.response) {
    console.error("Error Response:", error.response.data);
    return res.status(error.response.status).json({
      error: "Weather API Error",
      details: error.response.data,
    });
  }

  return res.status(500).json({
    error: fallbackMessage,
    message: error.message,
  });
};

/**
 * Utility: Validate coordinates
 */
const validateCoords = (req, res) => {
  const { lat, lon } = req.query;
  if (!lat || !lon) {
    res.status(400).json({
      error: "Missing required parameters",
      message: "Latitude (lat) and longitude (lon) are required",
    });
    return null;
  }
  return { lat, lon };
};

/**
 * 🌤 Get current weather data
 */
exports.getCurrentWeather = async (req, res) => {
  const coords = validateCoords(req, res);
  if (!coords) return;

  try {
    const response = await axios.get("https://api.openweathermap.org/data/2.5/weather", {
      params: {
        ...coords,
        appid: process.env.OPENWEATHER_API_KEY,
        units: "metric",
      },
    });
    res.json(response.data);
  } catch (error) {
    handleError(res, error, "Failed to fetch current weather data");
  }
};

/**
 * ⏳ Get 48-hour forecast (3-hour steps)
 */
exports.getHourlyForecast = async (req, res) => {
  const coords = validateCoords(req, res);
  if (!coords) return;

  try {
    const response = await axios.get("https://api.openweathermap.org/data/2.5/forecast", {
      params: {
        ...coords,
        appid: process.env.OPENWEATHER_API_KEY,
        units: "metric",
        cnt: 24, // 24 timestamps → 72 hrs
      },
    });
    
    // Debug logging
    console.log(`Hourly forecast API call for lat:${coords.lat}, lon:${coords.lon}`);
    console.log(`Requested 24 entries, got ${response.data.list ? response.data.list.length : 0} entries`);
    
    res.json(response.data);
  } catch (error) {
    handleError(res, error, "Failed to fetch hourly forecast data");
  }
};

/**
 * 📅 Get daily forecast (5 days)
 */
exports.getDailyForecast = async (req, res) => {
  const coords = validateCoords(req, res);
  if (!coords) return;

  try {
    // Using 5 day forecast API instead of One Call API which requires paid subscription
    const response = await axios.get("https://api.openweathermap.org/data/2.5/forecast", {
      params: {
        ...coords,
        appid: process.env.OPENWEATHER_API_KEY,
        units: "metric",
        cnt: 40, // Full 5 days forecast
      },
    });
    
    // Group forecasts by day
    const dailyForecasts = {};
    response.data.list.forEach(forecast => {
      const date = new Date(forecast.dt * 1000).toLocaleDateString();
      if (!dailyForecasts[date]) {
        dailyForecasts[date] = [];
      }
      dailyForecasts[date].push(forecast);
    });
    
    // Format response
    const formattedResponse = {
      city: response.data.city,
      count: Object.keys(dailyForecasts).length,
      list: Object.entries(dailyForecasts).map(([date, forecasts]) => {
        // Calculate average values for the day
        const temps = forecasts.map(f => f.main.temp);
        const avgTemp = temps.reduce((a, b) => a + b, 0) / temps.length;
        
        // Use the noon forecast or the middle one as representative
        const midIndex = Math.floor(forecasts.length / 2);
        const representativeForecast = forecasts[midIndex];
        
        return {
          date,
          dt: new Date(date).getTime() / 1000,
          temp: avgTemp,
          weather: representativeForecast.weather[0],
          details: {
            humidity: representativeForecast.main.humidity,
            pressure: representativeForecast.main.pressure,
            wind_speed: representativeForecast.wind.speed,
            clouds: representativeForecast.clouds.all
          },
          hourly: forecasts
        };
      })
    };
    
    res.json(formattedResponse);
  } catch (error) {
    handleError(res, error, "Failed to fetch daily forecast data");
  }
};

/**
 * ⏮ Get air pollution data (as an alternative to historical data which requires paid subscription)
 */
exports.getHistoricalWeather = async (req, res) => {
  const coords = validateCoords(req, res);
  if (!coords) return;

  try {
    // Using air pollution API as a free alternative to historical data
    const currentResponse = await axios.get("https://api.openweathermap.org/data/2.5/air_pollution", {
      params: {
        ...coords,
        appid: process.env.OPENWEATHER_API_KEY,
      },
    });
    
    // Get forecast air pollution data
    const forecastResponse = await axios.get("https://api.openweathermap.org/data/2.5/air_pollution/forecast", {
      params: {
        ...coords,
        appid: process.env.OPENWEATHER_API_KEY,
      },
    });
    
    // Combine current and forecast data
    const allData = [
      ...currentResponse.data.list,
      ...forecastResponse.data.list
    ];
    
    // Sort by date
    allData.sort((a, b) => a.dt - b.dt);
    
    // Group by day
    const dailyData = {};
    allData.forEach(item => {
      const date = new Date(item.dt * 1000).toLocaleDateString();
      if (!dailyData[date]) {
        dailyData[date] = [];
      }
      dailyData[date].push(item);
    });
    
    // Format response to mimic historical data
    const formattedData = Object.entries(dailyData).map(([date, items]) => {
      return {
        date,
        dt: items[0].dt,
        main: items[0].main,
        components: items[0].components,
        data: items.map(item => ({
          dt: item.dt,
          aqi: item.main.aqi,
          components: item.components,
          // Add weather-like properties for compatibility
          temp: null,
          humidity: null,
          weather: [{
            main: getAqiDescription(item.main.aqi),
            description: getAqiDetailedDescription(item.main.aqi)
          }]
        }))
      };
    });
    
    res.json({
      count: formattedData.length,
      data: formattedData,
    });
  } catch (error) {
    handleError(res, error, "Failed to fetch historical weather data");
  }
};

/**
 * Helper function to get AQI description
 */
function getAqiDescription(aqi) {
  const descriptions = [
    "Good",
    "Fair",
    "Moderate",
    "Poor",
    "Very Poor"
  ];
  return descriptions[aqi - 1] || "Unknown";
}

/**
 * Helper function to get detailed AQI description
 */
function getAqiDetailedDescription(aqi) {
  const descriptions = [
    "Air quality is considered satisfactory, and air pollution poses little or no risk",
    "Air quality is acceptable; however, for some pollutants there may be a moderate health concern",
    "Members of sensitive groups may experience health effects",
    "Everyone may begin to experience health effects",
    "Health warnings of emergency conditions. The entire population is more likely to be affected"
  ];
  return descriptions[aqi - 1] || "Unknown air quality";
}

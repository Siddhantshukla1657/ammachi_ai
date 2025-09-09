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
        cnt: 16, // 16 timestamps → 48 hrs
      },
    });
    res.json(response.data);
  } catch (error) {
    handleError(res, error, "Failed to fetch hourly forecast data");
  }
};

/**
 * 📅 Get daily forecast (7 days)
 */
exports.getDailyForecast = async (req, res) => {
  const coords = validateCoords(req, res);
  if (!coords) return;

  try {
    const response = await axios.get("https://api.openweathermap.org/data/3.0/onecall", {
      params: {
        ...coords,
        appid: process.env.OPENWEATHER_API_KEY,
        units: "metric",
        exclude: "minutely,alerts",
      },
    });
    res.json(response.data);
  } catch (error) {
    handleError(res, error, "Failed to fetch daily forecast data");
  }
};

/**
 * ⏮ Get historical weather (last 7 days)
 */
exports.getHistoricalWeather = async (req, res) => {
  const coords = validateCoords(req, res);
  if (!coords) return;

  try {
    const now = Math.floor(Date.now() / 1000);
    const oneDay = 86400;

    // Make parallel requests for each of the last 7 days
    const requests = Array.from({ length: 7 }, (_, i) => {
      const timestamp = now - (i + 1) * oneDay;
      return axios.get("https://api.openweathermap.org/data/3.0/onecall/timemachine", {
        params: {
          ...coords,
          dt: timestamp,
          appid: process.env.OPENWEATHER_API_KEY,
          units: "metric",
        },
      });
    });

    const responses = await Promise.all(requests);
    const historicalData = responses.map((r) => r.data);

    res.json({
      count: historicalData.length,
      data: historicalData,
    });
  } catch (error) {
    handleError(res, error, "Failed to fetch historical weather data");
  }
};

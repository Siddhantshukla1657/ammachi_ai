const axios = require('axios');

/**
 * Weather Controller
 * Handles all weather-related API requests to OpenWeather API
 */

/**
 * Get current weather data for a location
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getCurrentWeather = async (req, res) => {
  try {
    const { lat, lon } = req.query;
    
    if (!lat || !lon) {
      return res.status(400).json({ 
        error: 'Missing required parameters', 
        message: 'Latitude (lat) and longitude (lon) are required' 
      });
    }

    console.log('Fetching current weather with API key:', process.env.OPENWEATHER_API_KEY);
    
    const response = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
      params: {
        lat,
        lon,
        appid: process.env.OPENWEATHER_API_KEY, // Using API key from environment variable
        units: 'metric' // Use metric units by default
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('OpenWeather API error:', error.message);
    
    // Provide more detailed error information
    if (error.response) {
      console.error('Error response data:', error.response.data);
      console.error('Error response status:', error.response.status);
      
      // Return the actual error from the API
      return res.status(error.response.status).json({
        error: 'Weather API Error',
        details: error.response.data
      });
    }
    
    res.status(error.response?.status || 500).json({ 
      error: 'Failed to fetch current weather data',
      message: error.response?.data?.message || error.message 
    });
  }
};

/**
 * Get hourly forecast for the next 48 hours
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getHourlyForecast = async (req, res) => {
  try {
    const { lat, lon } = req.query;
    
    if (!lat || !lon) {
      return res.status(400).json({ 
        error: 'Missing required parameters', 
        message: 'Latitude (lat) and longitude (lon) are required' 
      });
    }

    const response = await axios.get('https://api.openweathermap.org/data/2.5/forecast', {
      params: {
        lat,
        lon,
        appid: process.env.OPENWEATHER_API_KEY, // Using API key from environment variable
        units: 'metric',
        cnt: 16 // Get 16 timestamps (48 hours with 3-hour steps)
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('OpenWeather API error:', error.message);
    res.status(error.response?.status || 500).json({ 
      error: 'Failed to fetch hourly forecast data',
      message: error.response?.data?.message || error.message 
    });
  }
};

/**
 * Get daily forecast for the next 7 days
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getDailyForecast = async (req, res) => {
  try {
    const { lat, lon } = req.query;
    
    if (!lat || !lon) {
      return res.status(400).json({ 
        error: 'Missing required parameters', 
        message: 'Latitude (lat) and longitude (lon) are required' 
      });
    }

    // OpenWeather One Call API provides daily forecasts
    const response = await axios.get('https://api.openweathermap.org/data/3.0/onecall', {
      params: {
        lat,
        lon,
        appid: process.env.OPENWEATHER_API_KEY, // Using API key from environment variable
        units: 'metric',
        exclude: 'minutely,alerts' // Exclude unnecessary data
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('OpenWeather API error:', error.message);
    res.status(error.response?.status || 500).json({ 
      error: 'Failed to fetch daily forecast data',
      message: error.response?.data?.message || error.message 
    });
  }
};

/**
 * Get historical weather data for the last 7 days
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getHistoricalWeather = async (req, res) => {
  try {
    const { lat, lon } = req.query;
    
    if (!lat || !lon) {
      return res.status(400).json({ 
        error: 'Missing required parameters', 
        message: 'Latitude (lat) and longitude (lon) are required' 
      });
    }

    // Calculate timestamps for the last 7 days
    const now = Math.floor(Date.now() / 1000); // Current time in seconds
    const oneDay = 86400; // Seconds in a day
    
    // Collect data for the last 7 days
    const historicalData = [];
    
    // Make parallel requests for each day
    const requests = [];
    for (let i = 1; i <= 7; i++) {
      const timestamp = now - (oneDay * i);
      requests.push(
        axios.get(`https://api.openweathermap.org/data/3.0/onecall/timemachine`, {
          params: {
            lat,
            lon,
            dt: timestamp,
            appid: process.env.OPENWEATHER_API_KEY, // Using API key from environment variable
            units: 'metric'
          }
        })
      );
    }
    
    const responses = await Promise.all(requests);
    responses.forEach(response => {
      historicalData.push(response.data);
    });

    res.json({
      count: historicalData.length,
      data: historicalData
    });
  } catch (error) {
    console.error('OpenWeather API error:', error.message);
    res.status(error.response?.status || 500).json({ 
      error: 'Failed to fetch historical weather data',
      message: error.response?.data?.message || error.message 
    });
  }
};
const express = require('express');
const router = express.Router();
const weatherController = require('../controllers/weatherController');

/**
 * @route   GET /api/weather/current
 * @desc    Get current weather data for a location
 * @access  Public
 * @query   lat - Latitude
 * @query   lon - Longitude
 */
router.get('/current', weatherController.getCurrentWeather);

/**
 * @route   GET /api/weather/hourly
 * @desc    Get hourly forecast for the next 48 hours
 * @access  Public
 * @query   lat - Latitude
 * @query   lon - Longitude
 */
router.get('/hourly', weatherController.getHourlyForecast);

/**
 * @route   GET /api/weather/daily
 * @desc    Get daily forecast for the next 7 days
 * @access  Public
 * @query   lat - Latitude
 * @query   lon - Longitude
 */
router.get('/daily', weatherController.getDailyForecast);

/**
 * @route   GET /api/weather/historical
 * @desc    Get historical weather data for the last 7 days
 * @access  Public
 * @query   lat - Latitude
 * @query   lon - Longitude
 */
router.get('/historical', weatherController.getHistoricalWeather);

module.exports = router;
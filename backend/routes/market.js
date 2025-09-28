const express = require('express');
const router = express.Router();
const marketController = require('../controllers/marketController');

/**
 * @route   GET /api/market/prices
 * @desc    Get market prices for commodities
 * @access  Public
 * @query   commodity - Filter by commodity name
 * @query   state - Filter by state (default: Kerala)
 * @query   district - Filter by district
 * @query   market - Filter by market name
 * @query   variety - Filter by variety
 * @query   grade - Filter by grade
 * @query   limit - Number of results to return (default: 10)
 * @query   offset - Offset for pagination (default: 0)
 * @query   format - Output format (json, xml, csv) (default: json)
 */
router.get('/prices', marketController.getMarketPrices);

/**
 * @route   GET /api/market/test-key
 * @desc    Test if MARKET_API_KEY is properly configured
 * @access  Public
 */
router.get('/test-key', marketController.testApiKey);

/**
 * @route   GET /api/market/commodities
 * @desc    Get list of available commodities
 * @access  Public
 */
router.get('/commodities', marketController.getCommodities);

/**
 * @route   GET /api/market/markets
 * @desc    Get list of available markets
 * @access  Public
 * @query   state - Filter by state
 * @query   district - Filter by district
 */
router.get('/markets', marketController.getMarkets);

/**
 * @route   GET /api/market/districts
 * @desc    Get list of available districts
 * @access  Public
 * @query   state - Filter by state
 */
router.get('/districts', marketController.getDistricts);

module.exports = router;
const express = require('express');
const router = express.Router();
const FarmerController = require('../controllers/farmerController');

// Authentication routes
router.post('/register', FarmerController.register);
router.post('/login', FarmerController.login);

// Dashboard data routes
router.get('/dashboard/:userId', FarmerController.getDashboardData);
router.get('/crop-health/:userId', FarmerController.getCropHealthData);
router.post('/crop-health', FarmerController.saveCropHealthData);

module.exports = router;

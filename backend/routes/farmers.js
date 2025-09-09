const express = require('express');
const router = express.Router();
const FarmerController = require('../controllers/farmerController');

router.post('/register', FarmerController.register);
router.post('/login', FarmerController.login);

module.exports = router;

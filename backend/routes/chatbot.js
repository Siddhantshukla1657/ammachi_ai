const express = require('express');
const router = express.Router();
const { chatWithBot } = require('../controllers/dialogflowController');

router.post('/chat', chatWithBot);

module.exports = router;

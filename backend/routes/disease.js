const express = require('express');
const multer = require('multer');
const router = express.Router();
const diseaseController = require('../controllers/diseaseController');

const upload = multer({ dest: 'uploads/' });

router.post('/disease', upload.single('image'), diseaseController.detectDisease);

module.exports = router;
const express = require('express');
const multer = require('multer');
const router = express.Router();
const diseaseController = require('../controllers/diseaseController');

const upload = multer({ dest: 'uploads/' });

router.post('/disease', upload.single('image'), diseaseController.detectDisease);

module.exports = router;


server.js

const express = require('express');
const app = express();

app.use(express.json());
app.use('/api', require('./routes/disease'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

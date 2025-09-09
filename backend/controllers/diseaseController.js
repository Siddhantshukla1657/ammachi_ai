const axios = require('axios');
const fs = require('fs');

exports.detectDisease = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Image file is required' });
    }

    // Read uploaded image file as base64
    const imageBuffer = fs.readFileSync(req.file.path);
    const imageBase64 = imageBuffer.toString('base64');

    const requestBody = {
      images: [imageBase64],
      modifiers: ['crops_simple'],
      plant_details: ['common_names', 'url', 'description', 'disease']
    };

    // Make POST request to Plant.id API with Api-Key header
    const response = await axios.post('https://plant.id/api/v3/identify', requestBody, {
      headers: {
        'Content-Type': 'application/json',
        'Api-Key': process.env.PLANT_ID_KEY
      }
    });

    res.json(response.data);

  } catch (error) {
    console.error('Plant.id API error:', error.message);
    res.status(500).json({ error: 'Failed to identify plant disease' });
  }
};

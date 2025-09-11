const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// Test the disease detection endpoint with file upload
async function testDiseaseDetection() {
  try {
    console.log('🧪 Testing disease detection endpoint...');
    
    // Create a test image file path
    const testImagePath = path.join(__dirname, 'testapis', 'test-image.jpg');
    
    // Check if test image exists, if not create a simple test
    if (!fs.existsSync(testImagePath)) {
      console.log('📷 No test image found, please add a test image at:', testImagePath);
      console.log('For now, testing with directory creation only...');
      
      // Test if uploads directory gets created
      const uploadsDir = path.join(__dirname, 'uploads');
      console.log('📁 Checking uploads directory:', uploadsDir);
      
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
        console.log('✅ Created uploads directory');
      } else {
        console.log('✅ Uploads directory already exists');
      }
      
      return;
    }
    
    // Create form data
    const form = new FormData();
    form.append('image', fs.createReadStream(testImagePath));
    
    // Make request to disease detection endpoint
    const response = await axios.post('http://localhost:5000/api/disease/detect', form, {
      headers: {
        ...form.getHeaders(),
      },
      timeout: 30000
    });
    
    console.log('✅ Disease detection response:', response.status);
    console.log('📊 Response data:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('❌ Disease detection test failed:', {
      message: error.message,
      response: error.response ? {
        status: error.response.status,
        data: error.response.data
      } : 'No response'
    });
  }
}

// Test uploads directory creation
function testUploadsDirectory() {
  console.log('🗂️ Testing uploads directory creation...');
  
  const uploadsDir = path.join(__dirname, 'uploads');
  console.log('📁 Uploads directory path:', uploadsDir);
  
  try {
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
      console.log('✅ Successfully created uploads directory');
    } else {
      console.log('✅ Uploads directory already exists');
    }
    
    // Test write permissions
    const testFile = path.join(uploadsDir, 'test-write.txt');
    fs.writeFileSync(testFile, 'test content');
    fs.unlinkSync(testFile);
    console.log('✅ Write permissions verified');
    
  } catch (error) {
    console.error('❌ Uploads directory test failed:', error.message);
  }
}

// Run tests
console.log('🚀 Starting disease detection tests...\n');
testUploadsDirectory();
console.log('');
testDiseaseDetection();
const axios = require('axios');
require('dotenv').config(); // Add dotenv configuration

// Test coordinates (Bangalore, India)
const lat = 12.9716;
const lon = 77.5946;

// Function to test current weather endpoint
async function testCurrentWeather() {
  try {
    console.log('Testing Current Weather API...');
    const response = await axios.get('http://localhost:5000/api/weather/current', {
      params: {
        lat,
        lon
      }
    });
    
    console.log('✅ Current Weather API Response:');
    console.log('City:', response.data.name);
    console.log('Weather:', response.data.weather[0].main, '-', response.data.weather[0].description);
    console.log('Temperature:', response.data.main.temp, '°C');
    console.log('Humidity:', response.data.main.humidity, '%');
    console.log('Wind Speed:', response.data.wind.speed, 'm/s');
    console.log('\n');
    return true;
  } catch (error) {
    console.error('❌ Current Weather API Error:', error.message);
    if (error.response) {
      console.error('Error Status:', error.response.status);
      console.error('Error Data:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error details:', error);
    }
    console.log('\n');
    return false;
  }
}

// Function to test hourly forecast endpoint
async function testHourlyForecast() {
  try {
    console.log('Testing Hourly Forecast API...');
    const response = await axios.get('http://localhost:5000/api/weather/hourly', {
      params: {
        lat,
        lon
      }
    });
    
    console.log('✅ Hourly Forecast API Response:');
    console.log('City:', response.data.city.name);
    console.log('Number of timestamps:', response.data.list.length);
    console.log('First forecast timestamp:', new Date(response.data.list[0].dt * 1000).toLocaleString());
    console.log('Weather:', response.data.list[0].weather[0].main, '-', response.data.list[0].weather[0].description);
    console.log('Temperature:', response.data.list[0].main.temp, '°C');
    console.log('\n');
    return true;
  } catch (error) {
    console.error('❌ Hourly Forecast API Error:', error.message);
    if (error.response) {
      console.error('Error Status:', error.response.status);
      console.error('Error Data:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error details:', error);
    }
    console.log('\n');
    return false;
  }
}

// Function to test daily forecast endpoint
async function testDailyForecast() {
  try {
    console.log('Testing Daily Forecast API...');
    const response = await axios.get('http://localhost:5000/api/weather/daily', {
      params: {
        lat,
        lon
      }
    });
    
    console.log('✅ Daily Forecast API Response:');
    console.log('City:', response.data.city.name);
    console.log('Number of days in forecast:', response.data.count);
    
    if (response.data.list && response.data.list.length > 0) {
      const firstDay = response.data.list[0];
      console.log('First day forecast date:', firstDay.date);
      console.log('Weather:', firstDay.weather.main, '-', firstDay.weather.description);
      console.log('Temperature:', firstDay.temp, '°C');
      console.log('Details:', JSON.stringify(firstDay.details));
    }
    console.log('\n');
    return true;
  } catch (error) {
    console.error('❌ Daily Forecast API Error:', error.message);
    if (error.response) {
      console.error('Error Status:', error.response.status);
      console.error('Error Data:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error details:', error);
    }
    console.log('\n');
    return false;
  }
}

// Function to test historical weather endpoint
async function testHistoricalWeather() {
  try {
    console.log('Testing Historical Weather API...');
    
    const response = await axios.get('http://localhost:5000/api/weather/historical', {
      params: {
        lat,
        lon
      }
    });
    
    console.log('✅ Historical Weather API Response (Air Pollution Data):');
    console.log('Number of days:', response.data.count);
    console.log('First day date:', new Date(response.data.data[0].dt * 1000).toLocaleString());
    console.log('Air Quality Index:', response.data.data[0].main.aqi);
    console.log('Air Quality:', response.data.data[0].data[0].weather[0].main, '-', response.data.data[0].data[0].weather[0].description);
    console.log('CO:', response.data.data[0].components.co);
    console.log('NO2:', response.data.data[0].components.no2);
    console.log('O3:', response.data.data[0].components.o3);
    console.log('PM2.5:', response.data.data[0].components.pm2_5);
    console.log('\n');
    return true;
  } catch (error) {
    console.error('❌ Historical Weather API Error:', error.message);
    if (error.response) {
      console.error('Error Status:', error.response.status);
      console.error('Error Data:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error details:', error);
    }
    console.log('\n');
    return false;
  }
}

// Run all tests
async function runAllTests() {
  console.log('='.repeat(50));
  console.log('OPENWEATHER API TEST (FREE TIER)');
  console.log('API Key:', process.env.OPENWEATHER_API_KEY ? '****' + process.env.OPENWEATHER_API_KEY.slice(-4) : 'Not set'); // Mask the API key, only show last 4 chars
  console.log('Location: Latitude', lat, 'Longitude', lon);
  console.log('='.repeat(50));
  console.log('\n');
  
  let results = {
    currentWeather: await testCurrentWeather(),
    hourlyForecast: await testHourlyForecast(),
    dailyForecast: await testDailyForecast(),
    historicalWeather: await testHistoricalWeather()
  };
  
  console.log('='.repeat(50));
  console.log('TEST RESULTS SUMMARY');
  console.log('='.repeat(50));
  console.log('Current Weather API:', results.currentWeather ? '✅ PASS' : '❌ FAIL');
  console.log('Hourly Forecast API:', results.hourlyForecast ? '✅ PASS' : '❌ FAIL');
  console.log('Daily Forecast API:', results.dailyForecast ? '✅ PASS' : '❌ FAIL');
  console.log('Historical Weather API:', results.historicalWeather ? '✅ PASS' : '❌ FAIL');
  console.log('\n');
  
  const allPassed = Object.values(results).every(result => result === true);
  console.log(allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED');
}

// Execute tests
runAllTests();
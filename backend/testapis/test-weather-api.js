const axios = require('axios');
require('dotenv').config(); // Add dotenv configuration

// Test coordinates (Bangalore, India)
const lat = 12.9716;
const lon = 77.5946;

// Function to test current weather endpoint
async function testCurrentWeather() {
  try {
    console.log('Testing Current Weather API...');
    const response = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
      params: {
        lat,
        lon,
        appid: process.env.OPENWEATHER_API_KEY, // Using API key from environment variable
        units: 'metric'
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
      console.error('Error Data:', error.response.data);
    }
    console.log('\n');
    return false;
  }
}

// Function to test hourly forecast endpoint
async function testHourlyForecast() {
  try {
    console.log('Testing Hourly Forecast API...');
    const response = await axios.get('https://api.openweathermap.org/data/2.5/forecast', {
      params: {
        lat,
        lon,
        appid: process.env.OPENWEATHER_API_KEY, // Using API key from environment variable
        units: 'metric',
        cnt: 16
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
      console.error('Error Data:', error.response.data);
    }
    console.log('\n');
    return false;
  }
}

// Function to test daily forecast endpoint
async function testDailyForecast() {
  try {
    console.log('Testing Daily Forecast API...');
    // Using 5 day forecast API instead of One Call API which requires paid subscription
    const response = await axios.get('https://api.openweathermap.org/data/2.5/forecast', {
      params: {
        lat,
        lon,
        appid: process.env.OPENWEATHER_API_KEY, // Using API key from environment variable
        units: 'metric',
        cnt: 40 // Full 5 days forecast
      }
    });
    
    console.log('✅ Daily Forecast API Response:');
    console.log('City:', response.data.city.name);
    console.log('Number of timestamps:', response.data.list.length);
    
    // Group forecasts by day
    const dailyForecasts = {};
    response.data.list.forEach(forecast => {
      const date = new Date(forecast.dt * 1000).toLocaleDateString();
      if (!dailyForecasts[date]) {
        dailyForecasts[date] = [];
      }
      dailyForecasts[date].push(forecast);
    });
    
    console.log('Number of days in forecast:', Object.keys(dailyForecasts).length);
    const firstDay = Object.keys(dailyForecasts)[0];
    console.log('First day forecast date:', firstDay);
    console.log('Weather:', dailyForecasts[firstDay][0].weather[0].main, '-', dailyForecasts[firstDay][0].weather[0].description);
    console.log('Temperature:', dailyForecasts[firstDay][0].main.temp, '°C');
    console.log('\n');
    return true;
  } catch (error) {
    console.error('❌ Daily Forecast API Error:', error.message);
    if (error.response) {
      console.error('Error Data:', error.response.data);
    }
    console.log('\n');
    return false;
  }
}

// Function to test air pollution endpoint (as an alternative to historical data which requires paid subscription)
async function testAirPollution() {
  try {
    console.log('Testing Air Pollution API...');
    
    const response = await axios.get('https://api.openweathermap.org/data/2.5/air_pollution', {
      params: {
        lat,
        lon,
        appid: process.env.OPENWEATHER_API_KEY // Using API key from environment variable
      }
    });
    
    console.log('✅ Air Pollution API Response:');
    console.log('Date:', new Date(response.data.list[0].dt * 1000).toLocaleString());
    console.log('Air Quality Index:', response.data.list[0].main.aqi);
    console.log('CO:', response.data.list[0].components.co);
    console.log('NO2:', response.data.list[0].components.no2);
    console.log('O3:', response.data.list[0].components.o3);
    console.log('PM2.5:', response.data.list[0].components.pm2_5);
    console.log('\n');
    return true;
  } catch (error) {
    console.error('❌ Historical Weather API Error:', error.message);
    if (error.response) {
      console.error('Error Data:', error.response.data);
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
    airPollution: await testAirPollution()
  };
  
  console.log('='.repeat(50));
  console.log('TEST RESULTS SUMMARY');
  console.log('='.repeat(50));
  console.log('Current Weather API:', results.currentWeather ? '✅ PASS' : '❌ FAIL');
  console.log('Hourly Forecast API:', results.hourlyForecast ? '✅ PASS' : '❌ FAIL');
  console.log('Daily Forecast API (5-day):', results.dailyForecast ? '✅ PASS' : '❌ FAIL');
  console.log('Air Pollution API:', results.airPollution ? '✅ PASS' : '❌ FAIL');
  console.log('\n');
  
  const allPassed = Object.values(results).every(result => result === true);
  console.log(allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED');
}

// Execute tests
runAllTests();
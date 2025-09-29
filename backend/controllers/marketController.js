const axios = require('axios');

// Constants
const MARKET_API_BASE_URL = 'https://api.data.gov.in/resource';
const MARKET_RESOURCE_ID = '35985678-0d79-46b4-9ed6-6f13308a1d24';

/**
 * Utility: Standard API Error Response with fallback data
 */
const handleError = (res, error, fallbackMessage) => {
  console.error('Market API error:', error.message);
  console.error('Error stack:', error.stack);

  // Check if it's an API key issue or network issue
  if (error.response && (error.response.status === 403 || error.response.status === 401)) {
    console.warn('API key not authorized or invalid, returning mock data');
    return res.json({
      success: true,
      message: 'Using demo data - API key not configured',
      data: getMockMarketData(),
      demo: true
    });
  }

  if (error.response) {
    console.error('Error Response:', error.response.data);
    console.error('Error Status:', error.response.status);
    console.error('Error Headers:', error.response.headers);
    return res.status(error.response.status).json({
      error: 'Market API Error',
      details: error.response.data,
      status: error.response.status,
      message: error.message
    });
  }
  
  if (error.request) {
    console.error('No response received:', error.request);
    return res.status(500).json({
      error: 'No response from Market API',
      message: 'The market data API did not respond. Please check your network connection.',
      details: error.message
    });
  }

  return res.status(500).json({
    error: fallbackMessage,
    message: error.message,
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
  });
};

/**
 * Get mock market data for demonstration
 */
const getMockMarketData = () => [
  // Coconut (7 days)
  { variety: 'Coconut', market: 'Ernakulam', grade: 'Premium', min_price: 30, max_price: 38, modal_price: 34, arrival_date: new Date(Date.now() - 6*24*60*60*1000).toISOString(), district: 'Ernakulam', commodity: 'Coconut', state: 'Kerala' },
  { variety: 'Coconut', market: 'Ernakulam', grade: 'Premium', min_price: 31, max_price: 39, modal_price: 36, arrival_date: new Date(Date.now() - 5*24*60*60*1000).toISOString(), district: 'Ernakulam', commodity: 'Coconut', state: 'Kerala' },
  { variety: 'Coconut', market: 'Ernakulam', grade: 'Premium', min_price: 32, max_price: 40, modal_price: 37, arrival_date: new Date(Date.now() - 4*24*60*60*1000).toISOString(), district: 'Ernakulam', commodity: 'Coconut', state: 'Kerala' },
  { variety: 'Coconut', market: 'Ernakulam', grade: 'Premium', min_price: 30, max_price: 38, modal_price: 35, arrival_date: new Date(Date.now() - 3*24*60*60*1000).toISOString(), district: 'Ernakulam', commodity: 'Coconut', state: 'Kerala' },
  { variety: 'Coconut', market: 'Ernakulam', grade: 'Premium', min_price: 29, max_price: 37, modal_price: 33, arrival_date: new Date(Date.now() - 2*24*60*60*1000).toISOString(), district: 'Ernakulam', commodity: 'Coconut', state: 'Kerala' },
  { variety: 'Coconut', market: 'Ernakulam', grade: 'Premium', min_price: 33, max_price: 41, modal_price: 38, arrival_date: new Date(Date.now() - 1*24*60*60*1000).toISOString(), district: 'Ernakulam', commodity: 'Coconut', state: 'Kerala' },
  { variety: 'Coconut', market: 'Ernakulam', grade: 'Premium', min_price: 32, max_price: 40, modal_price: 36, arrival_date: new Date().toISOString(), district: 'Ernakulam', commodity: 'Coconut', state: 'Kerala' },
  // Rice (7 days)
  { variety: 'Basmati', market: 'Ernakulam', grade: 'Grade A', min_price: 2200, max_price: 2500, modal_price: 2400, arrival_date: new Date(Date.now() - 6*24*60*60*1000).toISOString(), district: 'Ernakulam', commodity: 'Rice', state: 'Kerala' },
  { variety: 'Basmati', market: 'Ernakulam', grade: 'Grade A', min_price: 2220, max_price: 2520, modal_price: 2420, arrival_date: new Date(Date.now() - 5*24*60*60*1000).toISOString(), district: 'Ernakulam', commodity: 'Rice', state: 'Kerala' },
  { variety: 'Basmati', market: 'Ernakulam', grade: 'Grade A', min_price: 2230, max_price: 2530, modal_price: 2430, arrival_date: new Date(Date.now() - 4*24*60*60*1000).toISOString(), district: 'Ernakulam', commodity: 'Rice', state: 'Kerala' },
  { variety: 'Basmati', market: 'Ernakulam', grade: 'Grade A', min_price: 2210, max_price: 2510, modal_price: 2410, arrival_date: new Date(Date.now() - 3*24*60*60*1000).toISOString(), district: 'Ernakulam', commodity: 'Rice', state: 'Kerala' },
  { variety: 'Basmati', market: 'Ernakulam', grade: 'Grade A', min_price: 2240, max_price: 2540, modal_price: 2440, arrival_date: new Date(Date.now() - 2*24*60*60*1000).toISOString(), district: 'Ernakulam', commodity: 'Rice', state: 'Kerala' },
  { variety: 'Basmati', market: 'Ernakulam', grade: 'Grade A', min_price: 2260, max_price: 2560, modal_price: 2460, arrival_date: new Date(Date.now() - 1*24*60*60*1000).toISOString(), district: 'Ernakulam', commodity: 'Rice', state: 'Kerala' },
  { variety: 'Basmati', market: 'Ernakulam', grade: 'Grade A', min_price: 2280, max_price: 2580, modal_price: 2480, arrival_date: new Date().toISOString(), district: 'Ernakulam', commodity: 'Rice', state: 'Kerala' },
  // Pepper (7 days)
  { variety: 'Black Pepper', market: 'Ernakulam', grade: 'Grade A', min_price: 480, max_price: 540, modal_price: 500, arrival_date: new Date(Date.now() - 6*24*60*60*1000).toISOString(), district: 'Ernakulam', commodity: 'Pepper', state: 'Kerala' },
  { variety: 'Black Pepper', market: 'Ernakulam', grade: 'Grade A', min_price: 490, max_price: 550, modal_price: 510, arrival_date: new Date(Date.now() - 5*24*60*60*1000).toISOString(), district: 'Ernakulam', commodity: 'Pepper', state: 'Kerala' },
  { variety: 'Black Pepper', market: 'Ernakulam', grade: 'Grade A', min_price: 500, max_price: 560, modal_price: 520, arrival_date: new Date(Date.now() - 4*24*60*60*1000).toISOString(), district: 'Ernakulam', commodity: 'Pepper', state: 'Kerala' },
  { variety: 'Black Pepper', market: 'Ernakulam', grade: 'Grade A', min_price: 495, max_price: 555, modal_price: 515, arrival_date: new Date(Date.now() - 3*24*60*60*1000).toISOString(), district: 'Ernakulam', commodity: 'Pepper', state: 'Kerala' },
  { variety: 'Black Pepper', market: 'Ernakulam', grade: 'Grade A', min_price: 510, max_price: 570, modal_price: 530, arrival_date: new Date(Date.now() - 2*24*60*60*1000).toISOString(), district: 'Ernakulam', commodity: 'Pepper', state: 'Kerala' },
  { variety: 'Black Pepper', market: 'Ernakulam', grade: 'Grade A', min_price: 520, max_price: 580, modal_price: 540, arrival_date: new Date(Date.now() - 1*24*60*60*1000).toISOString(), district: 'Ernakulam', commodity: 'Pepper', state: 'Kerala' },
  { variety: 'Black Pepper', market: 'Ernakulam', grade: 'Grade A', min_price: 530, max_price: 590, modal_price: 550, arrival_date: new Date().toISOString(), district: 'Ernakulam', commodity: 'Pepper', state: 'Kerala' }
];

/**
 * Get mock markets data
 */
const getMockMarkets = () => {
  return ['Ernakulam', 'Kochi', 'Thrissur', 'Alappuzha', 'Kozhikode', 'Kollam'];
};

/**
 * Utility: Build API URL with proper filters
 */
const buildApiUrl = (filters = {}, options = {}) => {
  const { limit = 100, offset = 0, format = 'json' } = options;
  
  let url = `${MARKET_API_BASE_URL}/${MARKET_RESOURCE_ID}`;
  const params = new URLSearchParams();
  
  // Add API key from environment variables
  const apiKey = process.env.MARKET_API_KEY;
  if (apiKey) {
    params.append('api-key', apiKey);
  }
  params.append('format', format);
  params.append('limit', limit.toString());
  params.append('offset', offset.toString());
  
  // Add filters
  Object.entries(filters).forEach(([key, value]) => {
    if (value) {
      params.append(`filters[${key}]`, value);
    }
  });
  
  const finalUrl = `${url}?${params.toString()}`;
  console.log('Built API URL:', finalUrl);
  return finalUrl;
};

/*
 * 🛒 Get market prices for commodities
 * Input: state, market, commodity
 * Output: variety, market, grade, min_price, max_price, modal_price
 */
exports.getMarketPrices = async (req, res) => {
  try {
    const { commodity, state, market } = req.query;
    
    console.log('🔍 Market prices request received:', { commodity, state, market });
    
    // Check if API key is available
    const apiKey = process.env.MARKET_API_KEY;
    if (!apiKey) {
      console.warn('MARKET_API_KEY not found, returning mock data');
      const mockData = getMockMarketData().filter(item => 
        (!commodity || item.commodity.toLowerCase().includes(commodity.toLowerCase())) &&
        (!state || item.state === state) &&
        (!market || item.market === market)
      );
      
      return res.json({
        success: true,
        message: 'Demo data - MARKET_API_KEY not configured',
        count: mockData.length,
        data: mockData,
        query_params: { state, market, commodity },
        demo: true
      });
    }
    
    // Validate required parameters
    if (!state || !market || !commodity) {
      return res.status(400).json({
        error: 'Missing required parameters',
        required: ['state', 'market', 'commodity'],
        provided: { state: !!state, market: !!market, commodity: !!commodity }
      });
    }
    
    // Build filter parameters for the correct dataset structure
    // Note: Dataset uses capitalized field names
    const filters = {
      'State': state,
      'Market': market,
      'Commodity': commodity
    };
    
    // Build API URL
    const apiUrl = buildApiUrl(filters, { limit: 100, offset: 0 });
    
    console.log('📡 Making API request to:', apiUrl);
    console.log('🔑 Using API key:', apiKey ? 'YES' : 'NO');
    
    const response = await axios.get(apiUrl, {
      headers: {
        'X-API-Key': apiKey, // Also send as header for compatibility
        'Accept': 'application/json',
        'User-Agent': 'Ammachi-AI-Backend/1.0'
      },
      timeout: 15000 // Increase timeout to 15 seconds
    });
    
    console.log('✅ Market API response received, status:', response.status);
    
    // Process the response to extract the required fields
    const records = response.data?.records || [];
    
    if (records.length === 0) {
      // Return mock data when no records found
      console.warn('No records found from API, returning mock data');
      const mockData = getMockMarketData().filter(item => 
        item.commodity.toLowerCase().includes(commodity.toLowerCase()) &&
        item.state === state &&
        item.market === market
      );
      
      return res.json({
        success: true,
        message: 'Demo data - No records found from API',
        count: mockData.length,
        data: mockData,
        query_params: { state, market, commodity },
        demo: true
      });
    }
    
    // Map the response to the required output format
    // Note: Dataset uses capitalized field names
    const processedData = records.map(record => ({
      variety: record.Variety || 'Not specified',
      market: record.Market || market,
      grade: record.Grade || 'Not specified',
      min_price: parseFloat(record.Min_Price) || 0,
      max_price: parseFloat(record.Max_Price) || 0,
      modal_price: parseFloat(record.Modal_Price) || 0,
      arrival_date: record.Arrival_Date || null,
      district: record.District || null,
      commodity: record.Commodity || commodity,
      commodity_code: record.Commodity_Code || null,
      state: record.State || state
    }));
    
    console.log('📦 Processed market data, count:', processedData.length);
    
    res.json({
      success: true,
      count: processedData.length,
      data: processedData,
      query_params: { state, market, commodity },
      api_response_count: records.length
    });
    
  } catch (error) {
    console.error('❌ Market API error:', error.message);
    
    // Check if it's an API key issue or network issue
    if (error.response && (error.response.status === 403 || error.response.status === 401)) {
      console.warn('API key not authorized or invalid, returning mock data');
      return res.json({
        success: true,
        message: 'Using demo data - API key configured but not authorized',
        data: getMockMarketData(),
        demo: true
      });
    }

    if (error.response) {
      console.error('Error Response:', error.response.data);
      console.error('Error Status:', error.response.status);
      console.error('Error Headers:', error.response.headers);
      return res.status(error.response.status).json({
        error: 'Market API Error',
        details: error.response.data,
        status: error.response.status
      });
    }
    
    // Return mock data when API fails
    console.warn('Market API failed, returning mock data');
    const { commodity, state, market } = req.query; // Get query parameters
    const mockData = getMockMarketData().filter(item => 
      (!commodity || item.commodity.toLowerCase().includes(commodity.toLowerCase())) &&
      (!state || item.state === state) &&
      (!market || item.market === market)
    );
    
    return res.json({
      success: true,
      message: 'Demo data - Market API unavailable',
      count: mockData.length,
      data: mockData,
      query_params: { state, market, commodity },
      demo: true
    });
  }
};

/**
 * 📊 Get available commodities list
 */
exports.getCommodities = async (req, res) => {
  try {
    const { state } = req.query;
    
    // Build filters if state is provided
    const filters = {};
    if (state) {
      filters['State'] = state;
    }
    
    // Build API URL
    const apiUrl = buildApiUrl(filters, { limit: 1000, offset: 0 });
    
    const response = await axios.get(apiUrl, {
      headers: {
        'X-API-Key': process.env.MARKET_API_KEY,
        'Accept': 'application/json',
        'User-Agent': 'Ammachi-AI-Backend/1.0'
      },
      timeout: 10000
    });
    
    // Extract unique commodity names
    const records = response.data?.records || [];
    const commodities = [...new Set(records.map(record => record.Commodity))]
      .filter(Boolean)
      .sort();
    
    res.json({
      success: true,
      count: commodities.length,
      data: commodities,
      query_params: { state: state || 'all' }
    });
  } catch (error) {
    handleError(res, error, 'Failed to fetch commodities list');
  }
};

/**
 * 🏦 Get available markets list
 */
exports.getMarkets = async (req, res) => {
  try {
    const { state, district } = req.query;
    
    // Check if API key is available
    if (!process.env.MARKET_API_KEY) {
      console.warn('MARKET_API_KEY not found, returning mock markets');
      return res.json({
        success: true,
        message: 'Demo data - MARKET_API_KEY not configured',
        count: getMockMarkets().length,
        data: getMockMarkets(),
        query_params: { state: state || 'all', district: district || 'all' },
        demo: true
      });
    }
    
    // Build filter parameters
    const filters = {};
    if (state) filters['State'] = state;
    if (district) filters['District'] = district;
    
    // Build API URL
    const apiUrl = buildApiUrl(filters, { limit: 1000, offset: 0 });
    
    console.log('Fetching markets with URL:', apiUrl);
    
    const response = await axios.get(apiUrl, {
      headers: {
        'X-API-Key': process.env.MARKET_API_KEY,
        'Accept': 'application/json',
        'User-Agent': 'Ammachi-AI-Backend/1.0'
      },
      timeout: 10000
    });
    
    // Extract unique market names
    const records = response.data?.records || [];
    const markets = [...new Set(records.map(record => record.Market))]
      .filter(Boolean)
      .sort();
    
    res.json({
      success: true,
      count: markets.length,
      data: markets,
      query_params: { state: state || 'all', district: district || 'all' }
    });
  } catch (error) {
    console.error('Error in getMarkets:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error setting up request:', error.message);
    }
    
    // Return mock data when API fails
    console.warn('Market API failed, returning mock data');
    const { state, district } = req.query; // Get query parameters
    const mockMarkets = getMockMarkets();
    return res.json({
      success: true,
      message: 'Demo data - Market API unavailable',
      count: mockMarkets.length,
      data: mockMarkets.filter(market => 
        (!district || market.includes(district)) || district === 'Ernakulam'
      ),
      query_params: { state: state || 'all', district: district || 'all' },
      demo: true
    });
  }
};

/**
 * 🗺️ Get available districts list
 */
exports.getDistricts = async (req, res) => {
  try {
    const { state } = req.query;
    
    // Build filter parameters
    const filters = {};
    if (state) filters['State'] = state;
    
    // Build API URL
    const apiUrl = buildApiUrl(filters, { limit: 1000, offset: 0 });
    
    const response = await axios.get(apiUrl, {
      headers: {
        'X-API-Key': process.env.MARKET_API_KEY,
        'Accept': 'application/json',
        'User-Agent': 'Ammachi-AI-Backend/1.0'
      },
      timeout: 10000
    });
    
    // Extract unique district names
    const records = response.data?.records || [];
    const districts = [...new Set(records.map(record => record.District))]
      .filter(Boolean)
      .sort();
    
    res.json({
      success: true,
      count: districts.length,
      data: districts,
      query_params: { state: state || 'all' }
    });
  } catch (error) {
    handleError(res, error, 'Failed to fetch districts list');
  }
};

/**
 * Test endpoint to check if MARKET_API_KEY is properly configured
 */
exports.testApiKey = async (req, res) => {
  try {
    const apiKey = process.env.MARKET_API_KEY;
    
    if (!apiKey) {
      return res.status(400).json({
        success: false,
        error: 'MARKET_API_KEY not found in environment variables',
        env_vars: Object.keys(process.env).filter(key => key.includes('MARKET') || key.includes('API'))
      });
    }
    
    // Check if it's the expected key
    const isExpectedKey = apiKey === '579b464db66ec23bdd0000016dd62f530d18433f6be27af179222bc2';
    
    res.json({
      success: true,
      message: 'MARKET_API_KEY is properly configured',
      key_present: !!apiKey,
      key_length: apiKey.length,
      is_expected_key: isExpectedKey,
      sample: apiKey.substring(0, 10) + '...' + apiKey.substring(apiKey.length - 10)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

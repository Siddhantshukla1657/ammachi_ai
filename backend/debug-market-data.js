const axios = require('axios');
require('dotenv').config();

const MARKET_API_KEY = process.env.MARKET_API_KEY;
const BASE_URL = 'https://api.data.gov.in/resource/35985678-0d79-46b4-9ed6-6f13308a1d24';

// Debug function to explore available data
const exploreMarketData = async () => {
  console.log('🔍 Exploring Market Data - Finding Valid Combinations\n');
  
  if (!MARKET_API_KEY) {
    console.log('❌ MARKET_API_KEY not found. Please add it to your .env file');
    return;
  }

  // Step 1: Get all Kerala data without specific filters
  console.log('Step 1: Fetching Kerala market data...');
  try {
    const allKeralaUrl = `${BASE_URL}?api-key=${MARKET_API_KEY}&format=json&limit=50&filters[state]=Kerala`;
    
    const response = await axios.get(allKeralaUrl, {
      headers: {
        'X-API-Key': MARKET_API_KEY,
        'Accept': 'application/json',
        'User-Agent': 'Ammachi-AI-Debug/1.0'
      },
      timeout: 15000
    });

    const records = response.data?.records || [];
    console.log(`✅ Found ${records.length} records for Kerala\n`);

    if (records.length === 0) {
      console.log('❌ No records found for Kerala. Let\'s try without state filter...\n');
      
      // Try without state filter
      const generalUrl = `${BASE_URL}?api-key=${MARKET_API_KEY}&format=json&limit=50`;
      const generalResponse = await axios.get(generalUrl, {
        headers: {
          'X-API-Key': MARKET_API_KEY,
          'Accept': 'application/json',
          'User-Agent': 'Ammachi-AI-Debug/1.0'
        },
        timeout: 15000
      });

      const generalRecords = generalResponse.data?.records || [];
      console.log(`📊 Found ${generalRecords.length} total records in dataset\n`);

      if (generalRecords.length > 0) {
        console.log('📋 Sample record structure:');
        console.log(JSON.stringify(generalRecords[0], null, 2));
        console.log('\n📍 Available states:');
        const states = [...new Set(generalRecords.map(r => r.state))].filter(Boolean);
        states.slice(0, 10).forEach(state => console.log(`  - ${state}`));
        if (states.length > 10) console.log(`  ... and ${states.length - 10} more`);
        
        // Check if Kerala exists with different spelling
        const keralaVariants = states.filter(state => 
          state.toLowerCase().includes('kerala') || 
          state.toLowerCase().includes('kerela')
        );
        
        if (keralaVariants.length > 0) {
          console.log('\n🎯 Found Kerala variants:', keralaVariants);
        }
      }
      return;
    }

    // Analyze Kerala data
    console.log('📊 Analyzing Kerala data...\n');

    // Extract unique values
    const markets = [...new Set(records.map(r => r.market))].filter(Boolean).sort();
    const commodities = [...new Set(records.map(r => r.commodity))].filter(Boolean).sort();
    const districts = [...new Set(records.map(r => r.district))].filter(Boolean).sort();

    console.log('🏪 Available Markets in Kerala:');
    markets.slice(0, 20).forEach(market => console.log(`  - ${market}`));
    if (markets.length > 20) console.log(`  ... and ${markets.length - 20} more`);

    console.log('\n🌾 Available Commodities in Kerala:');
    commodities.slice(0, 20).forEach(commodity => console.log(`  - ${commodity}`));
    if (commodities.length > 20) console.log(`  ... and ${commodities.length - 20} more`);

    console.log('\n🗺️ Available Districts in Kerala:');
    districts.forEach(district => console.log(`  - ${district}`));

    // Look for your specific search terms
    console.log('\n🔍 Searching for your terms...');
    
    // Search for markets similar to "vadakarapathy"
    const marketMatches = markets.filter(market => 
      market.toLowerCase().includes('vadak') || 
      market.toLowerCase().includes('karap') ||
      market.toLowerCase().includes('pathy') ||
      market.toLowerCase().includes('vadakarapathy')
    );
    
    if (marketMatches.length > 0) {
      console.log('✅ Found similar markets:', marketMatches);
    } else {
      console.log('❌ No markets found similar to "vadakarapathy"');
      console.log('💡 Suggestion: Try these popular Kerala markets:');
      markets.slice(0, 5).forEach(market => console.log(`  - ${market}`));
    }

    // Search for commodities similar to "Brinjal"
    const commodityMatches = commodities.filter(commodity => 
      commodity.toLowerCase().includes('brinjal') ||
      commodity.toLowerCase().includes('eggplant') ||
      commodity.toLowerCase().includes('aubergine')
    );

    if (commodityMatches.length > 0) {
      console.log('✅ Found Brinjal commodities:', commodityMatches);
    } else {
      console.log('❌ No commodities found similar to "Brinjal"');
      console.log('💡 Suggestion: Try these popular Kerala commodities:');
      commodities.slice(0, 5).forEach(commodity => console.log(`  - ${commodity}`));
    }

    // Test a few working combinations
    console.log('\n🧪 Testing working combinations...');
    
    const testCombinations = [
      { market: markets[0], commodity: commodities[0] },
      { market: markets[1], commodity: commodities[1] },
      { market: markets[0], commodity: commodities[2] }
    ];

    for (let i = 0; i < Math.min(3, testCombinations.length); i++) {
      const combo = testCombinations[i];
      if (combo.market && combo.commodity) {
        console.log(`\n🔸 Testing: ${combo.market} + ${combo.commodity}`);
        await testCombination(combo.market, combo.commodity);
      }
    }

  } catch (error) {
    console.error('❌ Error exploring data:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    }
  }
};

// Test a specific market/commodity combination
const testCombination = async (market, commodity) => {
  try {
    const testUrl = `http://localhost:5000/api/market/prices?state=Kerala&market=${encodeURIComponent(market)}&commodity=${encodeURIComponent(commodity)}`;
    
    const response = await axios.get(testUrl, {
      timeout: 10000
    });

    if (response.data.success && response.data.count > 0) {
      console.log(`  ✅ SUCCESS! Found ${response.data.count} records`);
      console.log(`  💰 Sample prices:`, response.data.data[0]);
    } else {
      console.log(`  ❌ No data found for this combination`);
    }
    
  } catch (error) {
    console.log(`  ❌ Error testing combination:`, error.message);
  }
};

// Test case-sensitive variations
const testCaseVariations = async () => {
  console.log('\n🔤 Testing case-sensitive variations...\n');
  
  const variations = [
    { state: 'Kerala', market: 'vadakarapathy', commodity: 'Brinjal' },
    { state: 'KERALA', market: 'vadakarapathy', commodity: 'Brinjal' },
    { state: 'Kerala', market: 'Vadakarapathy', commodity: 'Brinjal' },
    { state: 'Kerala', market: 'VADAKARAPATHY', commodity: 'Brinjal' },
    { state: 'Kerala', market: 'vadakarapathy', commodity: 'brinjal' },
    { state: 'Kerala', market: 'vadakarapathy', commodity: 'BRINJAL' }
  ];

  for (const variation of variations) {
    try {
      const testUrl = `http://localhost:5000/api/market/prices?state=${variation.state}&market=${variation.market}&commodity=${variation.commodity}`;
      console.log(`Testing: ${variation.state} / ${variation.market} / ${variation.commodity}`);
      
      const response = await axios.get(testUrl, { timeout: 10000 });
      
      if (response.data.count > 0) {
        console.log(`  ✅ SUCCESS! Found ${response.data.count} records`);
        break;
      } else {
        console.log(`  ❌ No data found`);
      }
    } catch (error) {
      console.log(`  ❌ Error:`, error.message);
    }
  }
};

// Main execution
const runDebug = async () => {
  console.log('🚀 Market Data Debug Tool\n');
  console.log('This tool will help you find the correct parameter values for the API.\n');
  console.log('='.repeat(60) + '\n');
  
  await exploreMarketData();
  await testCaseVariations();
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ Debug completed!');
  console.log('\n💡 Tips:');
  console.log('- Use exact spelling and case as shown in the results above');
  console.log('- Try popular markets like Ernakulam, Kozhikode, Thiruvananthapuram');
  console.log('- Try common commodities like Rice, Coconut, Pepper');
  console.log('- The data may not be available for all market/commodity combinations');
};

runDebug().catch(console.error);

# Market Price API - Postman Testing Guide

## 📋 Overview
This document provides Postman URLs and testing instructions for the Market Price API integration with data.gov.in.

### 🎯 API Focus
- **Input:** State, Market, Commodity
- **Output:** Variety, Market, Grade, Min Price, Max Price, Modal Price

---

## 🚀 Postman Collection URLs

### 1. Get Market Prices (Main Endpoint)

**URL:** 
```
GET http://localhost:5000/api/market/prices?state=Kerala&market=Ernakulam&commodity=Rice
```

**Parameters:**
- `state` (required): Kerala
- `market` (required): Ernakulam, Kozhikode, Thiruvananthapuram, etc.
- `commodity` (required): Rice, Coconut, Pepper, Cardamom, etc.

**Expected Response:**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "variety": "Common",
      "market": "Ernakulam",
      "grade": "FAQ",
      "min_price": 2800,
      "max_price": 3200,
      "modal_price": 3000,
      "arrival_date": "2024-01-15",
      "district": "Ernakulam",
      "commodity_code": "110"
    }
  ],
  "query_params": {
    "state": "Kerala",
    "market": "Ernakulam", 
    "commodity": "Rice"
  },
  "api_response_count": 5
}
```

### 2. Get Available Commodities

**URL:**
```
GET http://localhost:5000/api/market/commodities?state=Kerala
```

**Parameters:**
- `state` (optional): Filter by state

**Expected Response:**
```json
{
  "success": true,
  "count": 45,
  "data": [
    "Cardamom",
    "Coconut", 
    "Pepper",
    "Rice",
    "Rubber"
  ],
  "query_params": {
    "state": "Kerala"
  }
}
```

### 3. Get Available Markets

**URL:**
```
GET http://localhost:5000/api/market/markets?state=Kerala&district=Ernakulam
```

**Parameters:**
- `state` (optional): Filter by state
- `district` (optional): Filter by district

**Expected Response:**
```json
{
  "success": true,
  "count": 25,
  "data": [
    "Aluva",
    "Ernakulam",
    "Kakkanad",
    "Perumbavoor"
  ],
  "query_params": {
    "state": "Kerala",
    "district": "Ernakulam"
  }
}
```

### 4. Get Available Districts

**URL:**
```
GET http://localhost:5000/api/market/districts?state=Kerala
```

**Parameters:**
- `state` (optional): Filter by state

**Expected Response:**
```json
{
  "success": true,
  "count": 14,
  "data": [
    "Alappuzha",
    "Ernakulam",
    "Idukki", 
    "Kannur",
    "Kasaragod",
    "Kollam",
    "Kottayam",
    "Kozhikode",
    "Malappuram",
    "Palakkad",
    "Pathanamthitta",
    "Thiruvananthapuram",
    "Thrissur",
    "Wayanad"
  ],
  "query_params": {
    "state": "Kerala"
  }
}
```

---

## 🧪 Testing Instructions

### Prerequisites
1. **API Key:** Get your API key from [data.gov.in](https://api.data.gov.in/)
2. **Environment Setup:** Add `MARKET_API_KEY=your-api-key` to your `.env` file
3. **Backend Server:** Ensure your backend is running on `http://localhost:5000`

### Quick Test Commands

**Using curl:**
```bash
# Test market prices
curl "http://localhost:5000/api/market/prices?state=Kerala&market=Ernakulam&commodity=Rice"

# Test commodities list
curl "http://localhost:5000/api/market/commodities?state=Kerala"

# Test markets list  
curl "http://localhost:5000/api/market/markets?state=Kerala"

# Test districts list
curl "http://localhost:5000/api/market/districts?state=Kerala"
```

**Using Node.js test script:**
```bash
node test-market-api.js
```

---

## 📊 Sample Data Combinations

### Common Kerala Markets and Commodities

| State | District | Market | Commodity | Status |
|-------|----------|---------|-----------|--------|
| Kerala | Ernakulam | Ernakulam | Rice | ✅ Active |
| Kerala | Kozhikode | Kozhikode | Coconut | ✅ Active |
| Kerala | Thiruvananthapuram | Thiruvananthapuram | Pepper | ✅ Active |
| Kerala | Idukki | Munnar | Cardamom | ✅ Active |
| Kerala | Kottayam | Kottayam | Rubber | ✅ Active |
| Kerala | Alappuzha | Alappuzha | Coconut | ✅ Active |
| Kerala | Thrissur | Thrissur | Rice | ✅ Active |

---

## 🐛 Troubleshooting

### Common Issues and Solutions

**1. "Missing required parameters" Error**
```json
{
  "error": "Missing required parameters",
  "required": ["state", "market", "commodity"],
  "provided": {"state": true, "market": false, "commodity": true}
}
```
**Solution:** Ensure all three parameters (state, market, commodity) are provided.

**2. "No market price data found" Response**
```json
{
  "success": true,
  "message": "No market price data found for the specified criteria",
  "count": 0,
  "data": []
}
```
**Solution:** Try different combinations of state/market/commodity. The data might not be available for that specific combination.

**3. API Key Issues**
```json
{
  "error": "Market API Error",
  "details": {
    "message": "Invalid API key"
  }
}
```
**Solution:** 
- Verify your API key is correct
- Check that `MARKET_API_KEY` is set in your `.env` file
- Ensure your API key is active on data.gov.in

**4. Timeout Errors**
- The API has a 10-second timeout
- Data.gov.in API can be slow sometimes
- Try again after a few minutes

---

## 📋 Postman Import Collection (JSON)

You can create a new collection in Postman and add these requests:

```json
{
  "info": {
    "name": "Ammachi AI - Market Price API",
    "description": "Market price data from data.gov.in",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Get Market Prices",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "http://localhost:5000/api/market/prices?state=Kerala&market=Ernakulam&commodity=Rice",
          "protocol": "http",
          "host": ["localhost"],
          "port": "5000",
          "path": ["api", "market", "prices"],
          "query": [
            {"key": "state", "value": "Kerala"},
            {"key": "market", "value": "Ernakulam"},
            {"key": "commodity", "value": "Rice"}
          ]
        }
      }
    },
    {
      "name": "Get Commodities",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "http://localhost:5000/api/market/commodities?state=Kerala",
          "protocol": "http",
          "host": ["localhost"],
          "port": "5000",
          "path": ["api", "market", "commodities"],
          "query": [
            {"key": "state", "value": "Kerala"}
          ]
        }
      }
    },
    {
      "name": "Get Markets",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "http://localhost:5000/api/market/markets?state=Kerala",
          "protocol": "http",
          "host": ["localhost"],
          "port": "5000", 
          "path": ["api", "market", "markets"],
          "query": [
            {"key": "state", "value": "Kerala"}
          ]
        }
      }
    },
    {
      "name": "Get Districts",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "http://localhost:5000/api/market/districts?state=Kerala",
          "protocol": "http",
          "host": ["localhost"],
          "port": "5000",
          "path": ["api", "market", "districts"],
          "query": [
            {"key": "state", "value": "Kerala"}
          ]
        }
      }
    }
  ]
}
```

---

## 🔗 Quick Links

- **Main Endpoint:** `GET /api/market/prices?state=Kerala&market=Ernakulam&commodity=Rice`
- **Data Source:** [data.gov.in Variety-wise Daily Market Prices](https://api.data.gov.in/resource/35985678-0d79-46b4-9ed6-6f13308a1d24)
- **API Documentation:** [data.gov.in API Docs](https://api.data.gov.in/)

---

## ✅ Testing Checklist

- [ ] API key is configured in `.env` file
- [ ] Backend server is running on port 5000  
- [ ] Test with valid Kerala market combinations
- [ ] Verify response structure matches expected format
- [ ] Check error handling for missing parameters
- [ ] Test timeout scenarios
- [ ] Validate price data types (numbers vs strings)

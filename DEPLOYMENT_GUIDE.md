# Ammachi AI Deployment Guide

## Prerequisites
1. A deployed backend server (can be on Render, Heroku, AWS, etc.)
2. Your deployed frontend URL (e.g., https://ammachiai.vercel.app)

## Backend Deployment

### 1. Environment Variables
Make sure your backend `.env` file has the correct configuration:

```
# Firebase Configuration
FIREBASE_PROJECT_ID=amaachiai
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour-private-key-here\n-----END PRIVATE KEY-----"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@amaachiai.iam.gserviceaccount.com
FIREBASE_WEB_API_KEY=AIzaSyBz5bfo2djYxt60UzyvNWQ9sAayGl-xC1s

# MongoDB Configuration
MONGO_URI=mongodb+srv://ammachi_user:LlNSuHPKvGTtMvbC@cluster0.qah2c3s.mongodb.net/ammachi_ai?retryWrites=true&w=majority&appName=Cluster0

# Server Configuration
PORT=5000
NODE_ENV=production
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173,https://ammachiai.vercel.app

# Weather and API Keys
PLANT_ID_KEY=bMAVATb7bJdaJ61G6Upx8WiIVk1HbXNx55nlnHHwRFiviZqfcS
DIALOGFLOW_API_KEY=077659109ad6e2ca1c6d5faf79b2f4cc5b068df8
OPENWEATHER_API_KEY=3f30c645831039ee938726c81b34ee2d
MARKET_API_KEY=579b464db66ec23bdd0000016dd62f530d18433f6be27af179222bc2

# Gemini AI Configuration
API_KEY=AIzaSyCKM6n4lzFVYeiowKk4EB4Fz1R0F_4_Rts
MODEL=gemini-1.5-flash

# Dialogflow Configuration (for deployment)
GOOGLE_APPLICATION_CREDENTIALS_JSON={"type":"service_account","project_id":"amachiai",...}
DIALOGFLOW_PROJECT_ID=amachiai
```

### 2. Deploy Your Backend
Deploy your backend to a hosting service like Render, Heroku, or AWS. Note the deployed URL.

## Frontend Configuration

### 1. Update Environment Variables
Update your frontend `.env.production` file with your deployed backend URL:

```
VITE_BACKEND_URL=https://your-deployed-backend-url.com
```

### 2. Deploy to Vercel
When deploying to Vercel, make sure to set the environment variable in the Vercel dashboard:
- Key: `VITE_BACKEND_URL`
- Value: `https://your-deployed-backend-url.com`

## API Integration Verification

### Market API
The market API has been successfully integrated with the data.gov.in API using the provided API key:
- API Key: `579b464db66ec23bdd0000016dd62f530d18433f6be27af179222bc2`
- Resource: [Variety-wise daily market prices data commodity](https://www.data.gov.in/resource/variety-wise-daily-market-prices-data-commodity)
- Endpoints working:
  - `/api/market/prices` - Returns real market prices
  - `/api/market/markets` - Returns real market list
  - `/api/market/commodities` - Returns real commodity list

### Weather API
The OpenWeatherMap API is properly configured and working:
- Endpoints working:
  - `/api/weather/current` - Returns current weather
  - `/api/weather/hourly` - Returns hourly forecast
  - `/api/weather/daily` - Returns daily forecast

### Chatbot API
The chatbot requires Dialogflow and Gemini credentials to work fully:
- Endpoints available but may show fallback responses without proper credentials

## Troubleshooting

### CORS Issues
If you encounter CORS issues, make sure your backend's `ALLOWED_ORIGINS` includes your frontend URL:
```
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173,https://ammachiai.vercel.app
```

### Authentication Issues
1. Make sure your Firebase configuration is correct in both frontend and backend
2. Ensure your Firebase project has the correct API keys
3. Check that your Firebase service account has the proper permissions

### Database Connection Issues
1. Verify your MongoDB connection string is correct
2. Make sure your MongoDB cluster allows connections from your backend server's IP

### Market API Returning Demo Data
If the market API is still returning demo data:
1. Verify `MARKET_API_KEY` is correctly set in backend environment variables
2. Check that the API key has access to the market data resource
3. Restart the backend server after updating environment variables

## Testing Your Deployment

### Automated Testing
1. Visit your deployed backend URL and navigate to `/health-check.html` to run automated tests
2. Visit your deployed frontend URL and navigate to `/api-test.html` to test frontend-backend connectivity

### Manual Testing
1. Visit your deployed frontend: https://ammachiai.vercel.app
2. Try to register a new account
3. Try to log in with an existing account
4. Test Market Prices page - should show real data, not demo data
5. Test Weather page - should show real weather data
6. Test Chatbot - should respond to messages (may show fallback responses if Dialogflow not configured)

If any of these fail, check the browser console for errors and the backend logs for more information.
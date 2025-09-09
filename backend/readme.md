# Ammachi AI Backend

Backend server for the Ammachi AI application built with Node.js and Express.

## Features

- RESTful API with Express.js
- CORS enabled for cross-origin requests
- File upload support with Multer
- Environment variable configuration
- Health check endpoint
- Error handling middleware

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn

## Installation

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment file:
   ```bash
   cp .env.example .env
   ```
   
4. Update the `.env` file with your configuration values.

## Running the Server

### Development Mode
```bash
npm run dev
```
This will start the server with nodemon for auto-restart on file changes.

### Production Mode
```bash
npm start
```

## API Endpoints

### Health Check
- **GET** `/api/health` - Returns server health status

### Root
- **GET** `/` - Returns basic server information

### Weather API
- **GET** `/api/weather/current` - Get current weather data
  - Query Parameters: `lat` (latitude), `lon` (longitude)
  - Example: `/api/weather/current?lat=12.9716&lon=77.5946`

- **GET** `/api/weather/hourly` - Get hourly forecast for the next 48 hours
  - Query Parameters: `lat` (latitude), `lon` (longitude)
  - Example: `/api/weather/hourly?lat=12.9716&lon=77.5946`

- **GET** `/api/weather/daily` - Get daily forecast for the next 7 days
  - Query Parameters: `lat` (latitude), `lon` (longitude)
  - Example: `/api/weather/daily?lat=12.9716&lon=77.5946`

- **GET** `/api/weather/historical` - Get historical weather data for the last 7 days
  - Query Parameters: `lat` (latitude), `lon` (longitude)
  - Example: `/api/weather/historical?lat=12.9716&lon=77.5946`

## Environment Variables

See `.env.example` for all available environment variables.

Key variables:
- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment mode (development/production)
- `OPENWEATHER_API_KEY` - API key for OpenWeather API (required for weather endpoints)

## Project Structure

```
backend/
├── index.js                      # Main server file
├── package.json                  # Dependencies and scripts
├── .env.example                  # Environment variables template
├── .gitignore                    # Git ignore rules
├── README.md                     # This file
├── controllers/
│   ├── authController.js         # Authentication controller
│   ├── diseaseController.js      # Plant disease detection controller
│   └── weatherController.js      # Weather data controller
├── routes/
│   ├── auth.js                   # Authentication routes
│   ├── disease.js                # Disease detection routes
│   └── weather.js                # Weather API routes
└── middleware/
    └── auth.js                   # Authentication middleware
```

## Dependencies

- **express** - Web framework
- **cors** - Cross-origin resource sharing
- **body-parser** - Request body parsing
- **multer** - File upload handling
- **dotenv** - Environment variable loading
- **axios** - HTTP client

## Development Dependencies

- **nodemon** - Development server with auto-restart

## License

ISC
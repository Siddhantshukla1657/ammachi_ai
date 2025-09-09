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

## Environment Variables

See `.env.example` for all available environment variables.

Key variables:
- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment mode (development/production)

## Project Structure

```
backend/
├── index.js          # Main server file
├── package.json      # Dependencies and scripts
├── .env.example      # Environment variables template
├── .gitignore        # Git ignore rules
└── README.md         # This file
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
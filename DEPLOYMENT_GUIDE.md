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

# Other API keys...
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

## Testing Your Deployment

1. Visit your deployed frontend: https://ammachiai.vercel.app
2. Try to register a new account
3. Try to log in with an existing account
4. Try Google Sign-In

If any of these fail, check the browser console for errors and the backend logs for more information.
# Ammachi AI Deployment Steps

## Changes Made

I've made several key changes to fix the authentication issues with your deployed frontend at https://ammachiai.vercel.app/:

### 1. Frontend Changes

1. **Updated auth.js**:
   - Added a `getBackendUrl()` function that determines the correct backend URL based on environment
   - This allows the frontend to work with both local development and production deployments

2. **Updated SignIn.jsx**:
   - Modified all API calls to use the `getBackendUrl()` function
   - This ensures authentication requests go to the correct backend URL

3. **Updated SignUp.jsx**:
   - Modified API calls to use the `getBackendUrl()` function
   - This ensures registration requests go to the correct backend URL

4. **Added Environment Configuration**:
   - Created `.env` file for development with `VITE_BACKEND_URL=http://localhost:5000`
   - Created `.env.production` file for production (needs to be updated with your actual backend URL)

5. **Updated vite.config.js**:
   - Modified to properly handle environment variables
   - Configured proxy to work with the backend URL from environment variables

### 2. Backend Changes

1. **Updated CORS Configuration**:
   - Added `https://ammachiai.vercel.app` to the allowed origins list
   - This allows your deployed frontend to make requests to your backend

## Next Steps for Deployment

### 1. Deploy Your Backend

You need to deploy your backend to a hosting service like Render, Heroku, or AWS. Once deployed, note the URL of your backend.

### 2. Update Frontend Configuration

1. Update your `frontend/.env.production` file with your deployed backend URL:
   ```
   VITE_BACKEND_URL=https://your-deployed-backend-url.com
   ```

2. When deploying to Vercel, also set this as an environment variable in the Vercel dashboard:
   - Key: `VITE_BACKEND_URL`
   - Value: `https://your-deployed-backend-url.com`

### 3. Test Your Deployment

1. Visit your deployed frontend: https://ammachiai.vercel.app
2. Try to register a new account
3. Try to log in with an existing account
4. Try Google Sign-In

## Troubleshooting

### If Authentication Still Doesn't Work

1. **Check Browser Console**: Look for any error messages in the browser's developer console
2. **Check Backend Logs**: Look at your backend server logs for any error messages
3. **Verify Environment Variables**: Make sure all environment variables are correctly set in both frontend and backend
4. **Check Network Tab**: Look at the network requests to see if they're going to the correct URLs

### Common Issues

1. **CORS Errors**: Make sure your backend's `ALLOWED_ORIGINS` includes your frontend URL
2. **Firebase Configuration**: Make sure your Firebase project ID and API keys are correct in both frontend and backend
3. **Database Connection**: Verify your MongoDB connection string is correct and accessible from your deployed backend

## Testing Locally

Before deploying, you can test these changes locally:

1. Start your backend:
   ```bash
   cd backend
   npm start
   ```

2. Start your frontend:
   ```bash
   cd frontend
   npm run dev
   ```

3. Test registration and login functionality

These changes should resolve the authentication issues you were experiencing with your deployed frontend.
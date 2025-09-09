# 🔐 Authentication System Setup Guide

This guide explains how to set up the Firebase authentication system for email/password and Google OAuth.

## 📋 Prerequisites

1. **Node.js** (v14 or higher)
2. **Firebase Account** with a project
3. **Google Cloud Console** account for OAuth credentials

## 🔧 Step 1: Firebase Setup

### 1.1 Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or use existing
3. Enable **Authentication** service
4. Enable **Email/Password** and **Google** sign-in methods

### 1.2 Generate Service Account Key
1. Go to Project Settings → Service Accounts
2. Click "Generate new private key"
3. Download the JSON file
4. Copy the values to your `.env` file

### 1.3 Replace Firebase Configuration

**In your `.env` file, replace these placeholders:**

```bash
# Firebase Configuration (from service account JSON)
FIREBASE_TYPE=service_account
FIREBASE_PROJECT_ID=your_actual_project_id
FIREBASE_PRIVATE_KEY_ID=your_actual_private_key_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour_actual_private_key_here\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your_project.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your_actual_client_id
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40your_project.iam.gserviceaccount.com
```

## 🔧 Step 2: Google OAuth Setup

### 2.1 Create OAuth Credentials
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your Firebase project
3. Go to **APIs & Services** → **Credentials**
4. Click "Create Credentials" → **OAuth client ID**
5. Choose **Web application**
6. Add authorized redirect URIs:
   - `http://localhost:3000` (for development)
   - `http://localhost:5173` (for Vite/React)
   - Your production URLs

### 2.2 Replace Google OAuth Configuration

**In your `.env` file, replace these:**

```bash
GOOGLE_CLIENT_ID=your_google_oauth_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret
```

## 🔧 Step 3: JWT Configuration

**Generate a secure JWT secret:**

```bash
# Generate a random 64-character string
JWT_SECRET=your_super_secure_jwt_secret_key_here_at_least_64_characters_long
```

## 🔧 Step 4: CORS Configuration

**Update allowed origins for your frontend:**

```bash
# Add your frontend URLs
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173,https://yourdomain.com
```

## 🚀 Available Authentication Endpoints

### Email/Password Auth
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user (see note below)

### Google OAuth
- `POST /api/auth/google` - Google OAuth authentication

### Token Management
- `POST /api/auth/verify-token` - Verify Firebase ID token
- `POST /api/auth/logout` - Logout user

### Protected Routes
- `GET /api/auth/profile` - Get user profile (requires auth)

## 📱 Frontend Integration

### For Email/Password Auth:
1. Use **Firebase Client SDK** on frontend
2. Authenticate user with Firebase
3. Send Firebase ID token to backend
4. Backend verifies token with `/api/auth/verify-token`

### For Google OAuth:
1. Use **Firebase Client SDK** or **Google Sign-In**
2. Get Google ID token
3. Send to backend via `/api/auth/google`
4. Backend handles user creation/login

## 🧪 Testing the Setup

### 1. Start the server:
```bash
npm run dev
```

### 2. Test endpoints:

**Register user:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "displayName": "Test User"
  }'
```

**Google Auth:**
```bash
curl -X POST http://localhost:5000/api/auth/google \
  -H "Content-Type: application/json" \
  -d '{
    "idToken": "your_google_id_token"
  }'
```

## ⚠️ Important Notes

1. **Security**: Never commit your `.env` file to git
2. **Private Key**: The Firebase private key contains sensitive information
3. **CORS**: Update allowed origins for production
4. **Rate Limiting**: Consider adding rate limiting for production
5. **HTTPS**: Always use HTTPS in production

## 🐛 Common Issues

### Firebase Admin SDK Error
- Ensure service account JSON is correctly formatted
- Check if Firebase project has Authentication enabled
- Verify private key format (replace `\n` with actual newlines)

### Google OAuth Error
- Verify GOOGLE_CLIENT_ID matches your OAuth credentials
- Check authorized redirect URIs in Google Cloud Console
- Ensure Google Sign-In is enabled in Firebase Console

### CORS Issues
- Check ALLOWED_ORIGINS matches your frontend URL
- Ensure no trailing slashes in URLs
- Verify frontend is making requests to correct port

## 🔍 Environment Variables Checklist

Copy this checklist to ensure all variables are set:

- [ ] `FIREBASE_PROJECT_ID`
- [ ] `FIREBASE_PRIVATE_KEY_ID`
- [ ] `FIREBASE_PRIVATE_KEY`
- [ ] `FIREBASE_CLIENT_EMAIL`
- [ ] `FIREBASE_CLIENT_ID`
- [ ] `GOOGLE_CLIENT_ID`
- [ ] `GOOGLE_CLIENT_SECRET`
- [ ] `JWT_SECRET` (generate new one)
- [ ] `ALLOWED_ORIGINS` (update for your frontend)

## 🎯 Next Steps

1. Set up your Firebase project
2. Configure Google OAuth credentials
3. Update your `.env` file with actual values
4. Test authentication endpoints
5. Integrate with your frontend application

For questions or issues, check the Firebase documentation or create an issue in the project repository.
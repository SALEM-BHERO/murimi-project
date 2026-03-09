# Murimi App Deployment Guide

## Overview
This guide covers the deployment of the Murimi App, which consists of:
- **Backend API** (Node.js + Express + PostgreSQL)
- **Mobile App** (React Native + Expo)

## Prerequisites
- Node.js >= 18.0.0
- PostgreSQL database
- Cloudinary account (for image storage)
- Expo account (for mobile app deployment)

## Deployment Steps

### 1. Backend Deployment (Render/Heroku)

#### Option A: Render (Recommended)
1. Create a Render account: https://render.com
2. Create a new Web Service
3. Connect your GitHub repository
4. Configure environment variables:
   ```
   NODE_ENV=production
   PORT=10000
   DATABASE_URL=your_production_database_url
   JWT_SECRET=your_secure_jwt_secret
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   GOOGLE_MAPS_API_KEY=your_maps_key
   ```

#### Option B: Heroku
1. Install Heroku CLI
2. Login: `heroku login`
3. Create app: `heroku create murimi-app`
4. Set environment variables:
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set DATABASE_URL=your_database_url
   heroku config:set JWT_SECRET=your_secure_secret
   # ... other variables
   ```
5. Deploy: `git push heroku main`

### 2. Database Setup

#### PostgreSQL on Render
1. Create a new PostgreSQL database on Render
2. Get the connection string
3. Run the schema:
   ```bash
   psql DATABASE_URL < db/schema.sql
   ```

#### Alternative: Supabase
1. Create free account at supabase.com
2. Create new project
3. Use connection string in your backend

### 3. Mobile App Configuration

Update `mobile-app/src/services/api.js` with your deployed backend URL:
```javascript
const API_BASE_URL = 'https://your-backend-url.onrender.com/api';
```

### 4. Mobile App Deployment

#### Expo Go (Development)
1. Update API URL in `api.js`
2. Run: `npm start` in mobile-app directory
3. Scan QR code with Expo Go app

#### Production Build
1. Create Expo account
2. Run: `eas build --platform android`
3. For iOS: `eas build --platform ios`
4. Submit to stores using EAS Submit

## Environment Variables Required

### Backend (.env)
```env
NODE_ENV=production
PORT=10000
DATABASE_URL=your_postgres_url
JWT_SECRET=your_very_secure_secret_key_here
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
GOOGLE_MAPS_API_KEY=your_google_maps_key
```

### Mobile App
Update API_BASE_URL in `src/services/api.js` to point to your deployed backend.

## Testing Deployment

1. Test backend health endpoint: `GET /health`
2. Test user registration and login
3. Test disease detection with sample image
4. Test shop finder functionality
5. Test knowledge articles

## Troubleshooting

### Common Issues:
1. **CORS errors**: Ensure your backend allows requests from your mobile app domain
2. **Database connection**: Verify DATABASE_URL is correct
3. **Image uploads**: Check Cloudinary credentials
4. **Location services**: Ensure proper permissions in mobile app

### Logs:
- Render: View logs in dashboard
- Heroku: `heroku logs --tail`
- Mobile: Use Expo Dev Tools or device logs

## Security Considerations

1. Never commit .env files to version control
2. Use strong JWT secrets
3. Enable HTTPS for all production endpoints
4. Validate and sanitize all inputs
5. Regularly update dependencies
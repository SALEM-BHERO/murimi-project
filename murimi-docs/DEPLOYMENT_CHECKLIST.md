# Murimi App Deployment Checklist

## 🔧 Pre-Deployment Setup

### [ ] Backend Preparation
- [ ] Generate strong JWT secret (32+ characters)
- [ ] Set up Cloudinary account for image storage
- [ ] Get Google Maps API key (optional)
- [ ] Prepare production database (PostgreSQL)
- [ ] Update `.env` with production values

### [ ] Mobile App Preparation
- [ ] Update bundle identifier in `app.json`
- [ ] Prepare app icons and splash screen
- [ ] Update API endpoint in `api.js`
- [ ] Test all app features locally

## ☁️ Backend Deployment

### [ ] Render Deployment (Recommended)
- [ ] Create Render account
- [ ] Create PostgreSQL database
- [ ] Create Web Service for backend
- [ ] Connect GitHub repository
- [ ] Set environment variables:
  - `NODE_ENV=production`
  - `PORT=10000`
  - `DATABASE_URL=your_production_url`
  - `JWT_SECRET=your_strong_secret`
  - `CLOUDINARY_CLOUD_NAME=your_name`
  - `CLOUDINARY_API_KEY=your_key`
  - `CLOUDINARY_API_SECRET=your_secret`
  - `GOOGLE_MAPS_API_KEY=your_key`
- [ ] Run database schema: `psql DATABASE_URL < db/schema.sql`
- [ ] Test health endpoint: `GET /health`

### [ ] Alternative: Heroku Deployment
- [ ] Install Heroku CLI
- [ ] Create Heroku app
- [ ] Set config variables
- [ ] Deploy with git push
- [ ] Provision PostgreSQL addon

## 📱 Mobile App Deployment

### [ ] Expo Configuration
- [ ] Create Expo account
- [ ] Install EAS CLI: `npm install -g eas-cli`
- [ ] Login to Expo: `eas login`
- [ ] Configure project: `eas build:configure`

### [ ] Android Deployment
- [ ] Update `app.json` with correct package name
- [ ] Build APK: `eas build --platform android`
- [ ] Test on physical device
- [ ] Submit to Google Play Store

### [ ] iOS Deployment (Optional)
- [ ] Enroll in Apple Developer Program
- [ ] Update bundle identifier
- [ ] Build IPA: `eas build --platform ios`
- [ ] Submit to App Store

## 🧪 Testing

### [ ] Backend Testing
- [ ] Health check endpoint
- [ ] User registration
- [ ] User login
- [ ] JWT token validation
- [ ] Disease detection endpoint
- [ ] Shop finder functionality
- [ ] Knowledge articles API

### [ ] Mobile App Testing
- [ ] User authentication flow
- [ ] Camera functionality
- [ ] Image upload and detection
- [ ] Location services
- [ ] Shop finder
- [ ] Knowledge browsing
- [ ] Offline functionality

## 🔒 Security Checklist

- [ ] HTTPS enabled for all endpoints
- [ ] Strong JWT secret in production
- [ ] Environment variables not committed to git
- [ ] Input validation and sanitization
- [ ] Rate limiting implemented
- [ ] Database connection secured
- [ ] API keys secured
- [ ] CORS properly configured

## 📊 Monitoring & Maintenance

- [ ] Set up logging
- [ ] Configure error monitoring
- [ ] Set up uptime monitoring
- [ ] Plan for database backups
- [ ] Regular security updates
- [ ] Performance monitoring

## 🚀 Go Live

- [ ] Final testing in production environment
- [ ] Update documentation
- [ ] Prepare user support
- [ ] Monitor initial user feedback
- [ ] Set up analytics

## 🆘 Troubleshooting

Common issues to watch for:
- Database connection failures
- CORS errors
- Image upload issues
- Location permission problems
- API rate limiting
- Memory leaks
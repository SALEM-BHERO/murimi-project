# Murimi App - Deployment Instructions

## 🚀 Quick Start

To deploy the Murimi App, follow these steps:

### 1. Run the Deployment Assistant
Double-click `deploy.bat` to open the interactive deployment assistant.

### 2. Backend Deployment (Choose One)

**Option A: Render (Recommended - Free Tier Available)**
- Go to [render.com](https://render.com)
- Create a new Web Service
- Connect your GitHub repository
- Set environment variables (see below)
- Create PostgreSQL database on Render
- Run: `psql DATABASE_URL < db/schema.sql`

**Option B: Heroku**
```bash
heroku login
heroku create murimi-app
heroku config:set NODE_ENV=production
heroku config:set DATABASE_URL=your_database_url
heroku config:set JWT_SECRET=your_strong_secret
# ... set other environment variables
git push heroku main
```

### 3. Mobile App Deployment

1. Update API URL in `mobile-app/src/services/api.js`
2. Install EAS CLI: `npm install -g eas-cli`
3. Login to Expo: `eas login`
4. Configure: `eas build:configure`
5. Build for Android: `eas build --platform android`

## 🔧 Environment Variables

### Backend (.env)
```env
NODE_ENV=production
PORT=10000
DATABASE_URL=your_production_postgres_url
JWT_SECRET=your_very_strong_secret_key_here
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
GOOGLE_MAPS_API_KEY=your_google_maps_key
```

### Mobile App
Update `API_BASE_URL` in `mobile-app/src/services/api.js` to your deployed backend URL.

## 📋 Required Services

1. **Database**: PostgreSQL (Render/Supabase/Heroku Postgres)
2. **Image Storage**: Cloudinary (free tier available)
3. **Maps**: Google Maps API (optional)
4. **Mobile Deployment**: Expo/EAS (free tier available)

## 🧪 Testing

After deployment, test:
- Backend health endpoint: `GET /health`
- User registration and login
- Disease detection functionality
- Shop finder
- Knowledge articles
- Mobile app connectivity

## 📚 Documentation

- `DEPLOYMENT.md` - Detailed deployment guide
- `DEPLOYMENT_CHECKLIST.md` - Step-by-step checklist
- `deploy.bat` - Interactive deployment assistant

## 🆘 Need Help?

Check the troubleshooting section in `DEPLOYMENT.md` or refer to the deployment checklist for common issues.

## 🔒 Security Notes

- Never commit `.env` files to version control
- Use strong, unique secrets for production
- Enable HTTPS for all production endpoints
- Regularly update dependencies
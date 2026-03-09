@echo off
echo ========================================
echo Murimi App Deployment Assistant
echo ========================================
echo.

:menu
echo What would you like to do?
echo 1. Deploy backend to Render (Recommended)
echo 2. Deploy backend to Heroku
echo 3. Prepare mobile app for deployment
echo 4. Test deployment
echo 5. Exit
echo.
set /p choice=Enter your choice (1-5): 

if "%choice%"=="1" goto render
if "%choice%"=="2" goto heroku
if "%choice%"=="3" goto mobile
if "%choice%"=="4" goto test
if "%choice%"=="5" goto exit
echo Invalid choice. Please try again.
goto menu

:render
echo.
echo ========================================
echo Deploying Backend to Render
echo ========================================
echo.
echo 1. Go to https://render.com and create an account
echo 2. Create a new Web Service
echo 3. Connect your GitHub repository
echo 4. Set these environment variables:
echo    - NODE_ENV=production
echo    - PORT=10000
echo    - DATABASE_URL=your_production_database_url
echo    - JWT_SECRET=your_strong_jwt_secret
echo    - CLOUDINARY_CLOUD_NAME=your_cloud_name
echo    - CLOUDINARY_API_KEY=your_api_key
echo    - CLOUDINARY_API_SECRET=your_api_secret
echo    - GOOGLE_MAPS_API_KEY=your_maps_key
echo.
echo 5. Also create a PostgreSQL database on Render
echo 6. Run the database schema: psql DATABASE_URL ^< db/schema.sql
echo.
pause
goto menu

:heroku
echo.
echo ========================================
echo Deploying Backend to Heroku
echo ========================================
echo.
echo Make sure you have Heroku CLI installed
echo.
echo 1. Login to Heroku: heroku login
echo 2. Create app: heroku create murimi-app
echo 3. Set environment variables:
echo    heroku config:set NODE_ENV=production
echo    heroku config:set DATABASE_URL=your_database_url
echo    heroku config:set JWT_SECRET=your_strong_secret
echo    heroku config:set CLOUDINARY_CLOUD_NAME=your_name
echo    heroku config:set CLOUDINARY_API_KEY=your_key
echo    heroku config:set CLOUDINARY_API_SECRET=your_secret
echo    heroku config:set GOOGLE_MAPS_API_KEY=your_key
echo.
echo 4. Deploy: git push heroku main
echo 5. Run database schema: heroku pg:psql ^< db/schema.sql
echo.
pause
goto menu

:mobile
echo.
echo ========================================
echo Preparing Mobile App for Deployment
echo ========================================
echo.
echo 1. Update the API URL in mobile-app/src/services/api.js
echo    Change API_BASE_URL to your deployed backend URL
echo.
echo 2. Install EAS CLI: npm install -g eas-cli
echo 3. Login to Expo: eas login
echo 4. Configure project: eas build:configure
echo.
echo 5. For Android build:
echo    eas build --platform android
echo.
echo 6. For iOS build:
echo    eas build --platform ios
echo.
pause
goto menu

:test
echo.
echo ========================================
echo Testing Deployment
echo ========================================
echo.
echo Test these endpoints:
echo 1. Health check: GET /health
echo 2. User registration
echo 3. User login
echo 4. Disease detection
echo 5. Shop finder
echo 6. Knowledge articles
echo.
echo Test mobile app features:
echo 1. User authentication
echo 2. Camera functionality
echo 3. Image upload
echo 4. Location services
echo 5. API connectivity
echo.
pause
goto menu

:exit
echo.
echo Deployment assistant closing...
echo Refer to DEPLOYMENT.md and DEPLOYMENT_CHECKLIST.md for detailed instructions
echo.
pause
exit
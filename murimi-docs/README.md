# Murimi App - AI-Powered Crop Management System

Murimi is an innovative mobile application designed to help farmers identify plant diseases and access agricultural resources using AI technology. Built with React Native and Node.js, Murimi empowers farmers with tools to protect their crops and improve yields.

## 🌿 Features

- **AI-Powered Disease Detection**: Upload images of crops to identify diseases with high accuracy
- **User Authentication**: Secure login and registration system
- **Knowledge Base**: Access to articles about crop diseases and treatments
- **Shop Finder**: Locate nearby agrochemical shops
- **Location-Based Services**: GPS integration for accurate shop finding and crop tracking

## 🛠️ Tech Stack

### Frontend (Mobile)
- React Native (Expo)
- React Navigation
- Expo Camera
- Expo Location
- Axios for API requests

### Backend
- Node.js
- Express.js
- PostgreSQL (with PostGIS extension)
- JWT for authentication
- Multer for file uploads
- Sharp for image processing
- Cloudinary for image storage

### AI Integration
- Custom-trained machine learning model for disease detection

## 📦 Installation

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL
- Expo CLI (for mobile development)

### Backend Setup
1. Clone the repository
2. Navigate to the `backend` directory
3. Install dependencies: `npm install`
4. Create a `.env` file based on `.env.example`
5. Set up PostgreSQL database with PostGIS extension
6. Run schema: `psql DATABASE_URL < db/schema.sql`
7. Seed the database (optional): `npm run seed`
8. Start the server: `npm run dev`

### Mobile App Setup
1. Navigate to the `mobile-app` directory
2. Install dependencies: `npm install`
3. Update API endpoint in `src/services/api.js` to match your backend URL
4. Start the app: `npm start`

## 🚀 Deployment

See our detailed deployment guides:
- [Deployment Guide](./DEPLOYMENT.md)
- [Deployment Checklist](./DEPLOYMENT_CHECKLIST.md)
- [README_DEPLOYMENT.md](./README_DEPLOYMENT.md)

## 📁 Project Structure

```
Murimi App/
├── backend/              # Node.js + Express API
│   ├── src/
│   │   ├── controllers/  # Route handlers
│   │   ├── middleware/   # Authentication, error handling
│   │   ├── models/       # Database models
│   │   ├── routes/       # API routes
│   │   ├── services/     # Business logic (AI, images, location)
│   │   └── server.js     # Entry point
├── mobile-app/           # React Native app
│   ├── src/
│   │   ├── context/      # Global state
│   │   ├── screens/      # UI screens
│   │   └── services/     # API and storage services
│   └── App.js            # Entry point
├── db/                   # Database schema
│   └── schema.sql
├── DEPLOYMENT.md         # Deployment guide
├── DEPLOYMENT_CHECKLIST.md # Deployment checklist
├── README.md             # This file
└── README_DEPLOYMENT.md  # Deployment quick start
```

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile

### Disease Detection
- `POST /api/disease/detect` - Detect disease from image
- `GET /api/disease/history` - Get detection history
- `GET /api/disease/info/:id` - Get disease information

### Shops
- `GET /api/shops/nearby` - Find nearby shops
- `GET /api/shops/:id` - Get shop by ID

### Knowledge Base
- `GET /api/knowledge/articles` - Get articles
- `GET /api/knowledge/articles/:id` - Get article by ID
- `GET /api/knowledge/categories` - Get categories

## 🤝 Contributing

We welcome contributions! Please follow these steps:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- [Your Name] - Creator of Murimi App

## 🙏 Acknowledgments

- Farmers who inspired this project
- Open-source community for the amazing tools used in this project
- AI/ML researchers working on agricultural solutions

## 📞 Support

For support, email [your-email@example.com] or open an issue in this repository.
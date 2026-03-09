const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');

dotenv.config();

const authRoutes = require('./routes/auth');
const diseaseRoutes = require('./routes/disease');
const shopsRoutes = require('./routes/shops');
const knowledgeRoutes = require('./routes/knowledge');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve static files
app.use(express.static(path.join(__dirname, '../../web')));
app.use('/uploads', express.static(uploadsDir));

app.use(helmet());
// Configure CORS for production
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*',
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(morgan('dev'));
app.use(express.static('web'));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Murimi backend is healthy' });
});

app.use('/api/auth', authRoutes);
app.use('/api/disease', diseaseRoutes);
app.use('/api/shops', shopsRoutes);
app.use('/api/knowledge', knowledgeRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Murimi backend listening on port ${PORT}`);
});


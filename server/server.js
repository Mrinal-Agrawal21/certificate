require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

const app = express();

const envOrigins = (process.env.CORS_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
const allowedOrigins = envOrigins.length ? envOrigins : [
  "https://sarasniyam-qr-certification-niw9.vercel.app",
  "https://sarasniyam.com",
  "http://localhost:5173"
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

const PORT = process.env.PORT || 5000;

// Connect DB
connectDB(process.env.MONGO_URI || 'mongodb://localhost:27017/certdb');

// Routes
const certRoutes = require('./routes/certificates');
const adminRoutes = require('./routes/admin');
const authRoutes = require('./routes/auth');
app.use('/api/certificate', certRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/auth', authRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.send('Server is healthy');
});

// Serve uploaded QR images static
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

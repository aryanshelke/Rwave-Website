const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables (supports Vercel env, root .env, and server/.env)
dotenv.config();
dotenv.config({ path: path.join(__dirname, '../server/.env') });

const connectDB = require('../server/config/db');
const authRoutes = require('../server/routes/authRoutes');
const productRoutes = require('../server/routes/productRoutes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serverless Middleware: Connect to MongoDB Atlas (reuses cached connection)
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('❌ Serverless Database Connection Error:', err.message);
    return res.status(500).json({
      error: 'Database connection failed',
      details: err.message,
    });
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  const mongoose = require('mongoose');
  res.json({
    status: 'online',
    platform: 'vercel-serverless',
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    host: mongoose.connection.host || null,
    name: mongoose.connection.name || null,
  });
});

module.exports = app;


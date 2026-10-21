import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables (supports Vercel env, root .env, and server/.env)
dotenv.config();
dotenv.config({ path: path.join(__dirname, '../server/.env') });

import connectDB from '../server/config/db.js';
import authRoutes from '../server/routes/authRoutes.js';
import productRoutes from '../server/routes/productRoutes.js';

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serverless Middleware: Connect to MongoDB Atlas (reuses cached connection across warm invocations)
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

// API Routes - mount both with and without '/api' prefix to be resilient to Vercel rewrite rules
app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes);

app.use('/api/products', productRoutes);
app.use('/products', productRoutes);

// Health check endpoint
const healthHandler = async (req, res) => {
  try {
    const conn = await connectDB();
    res.json({
      status: 'online',
      platform: 'vercel-serverless',
      timestamp: new Date().toISOString(),
      database: conn.readyState === 1 ? 'connected' : 'disconnected',
      host: conn.host || null,
      name: conn.name || null,
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      platform: 'vercel-serverless',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: err.message,
    });
  }
};

app.get('/api/health', healthHandler);
app.get('/health', healthHandler);

// Fallback route for root API query
app.get(['/', '/api'], (req, res) => {
  res.json({
    status: 'online',
    message: 'R-Wave Cardio NX API is operational',
  });
});

export default app;

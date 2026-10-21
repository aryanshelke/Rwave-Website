import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);

dotenv.config();
dotenv.config({ path: path.join(__dirname, '../server/.env') });

let app = null;
let initError = null;

function initializeApp() {
  if (app) return app;
  if (initError) throw initError;

  try {
    const connectDB = require('../server/config/db.js');
    const authRoutes = require('../server/routes/authRoutes.js');
    const productRoutes = require('../server/routes/productRoutes.js');

    const expressApp = express();

    // Middlewares
    expressApp.use(cors());
    expressApp.use(express.json());
    expressApp.use(express.urlencoded({ extended: true }));

    // Middleware: Connect to MongoDB Atlas (reuses cached connection across warm starts)
    expressApp.use(async (req, res, next) => {
      try {
        await connectDB();
        next();
      } catch (err) {
        console.error('❌ Serverless Database Connection Error:', err.message);
        return res.status(500).json({
          error: 'Database connection failed',
          message: err.message,
          envConfigured: {
            hasMongoUri: !!process.env.MONGO_URI,
            hasJwtSecret: !!process.env.JWT_SECRET,
            nodeEnv: process.env.NODE_ENV,
          },
        });
      }
    });

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
          env: {
            hasMongoUri: !!process.env.MONGO_URI,
            hasAdminUser: !!process.env.ADMIN_USER,
            hasCloudinary: !!process.env.CLOUDINARY_CLOUD_NAME,
          },
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

    // Mount health check
    expressApp.get('/api/health', healthHandler);
    expressApp.get('/health', healthHandler);

    // Mount Auth routes
    expressApp.use('/api/auth', authRoutes);
    expressApp.use('/auth', authRoutes);

    // Mount Product routes
    expressApp.use('/api/products', productRoutes);
    expressApp.use('/products', productRoutes);

    // Root status route
    expressApp.get(['/', '/api'], (req, res) => {
      res.json({
        status: 'online',
        message: 'R-Wave Cardio NX API is operational',
        timestamp: new Date().toISOString(),
      });
    });

    // Catch-all 404 for debugging routing
    expressApp.use((req, res) => {
      res.status(404).json({
        error: 'Route not found on API server',
        url: req.url,
        originalUrl: req.originalUrl,
        method: req.method,
      });
    });

    // Global error handler
    expressApp.use((err, req, res, next) => {
      console.error('Express Error:', err);
      res.status(500).json({
        error: 'Internal Server Error',
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
      });
    });

    app = expressApp;
    return app;
  } catch (err) {
    initError = {
      message: err.message,
      stack: err.stack,
      name: err.name,
    };
    throw initError;
  }
}

export default async function handler(req, res) {
  try {
    const expressApp = initializeApp();
    return expressApp(req, res);
  } catch (err) {
    console.error('Initialization / Invocation Crash:', err);
    return res.status(500).json({
      error: 'Serverless Function Initialization Failed',
      message: err.message,
      stack: err.stack,
      name: err.name,
    });
  }
}

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import mongoose from 'mongoose';

import { connectDB } from './db.js';
import { Product } from './Product.js';
import { uploadBufferToCloudinary, deleteFromCloudinary } from './cloudinary.js';

dotenv.config();

const app = express();

// Global Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Multer memory upload for serverless
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// Admin Auth Middleware
const verifyAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No authentication token provided.',
    });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'super_secret_rwave_jwt_key_change_in_prod'
    );
    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(403).json({
      success: false,
      message: 'Invalid or expired token.',
    });
  }
};

// Database connector middleware for database-dependent routes
const withDB = async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('❌ Database Connection Error:', err.message);
    return res.status(500).json({
      success: false,
      error: 'Database connection failed',
      details: err.message,
    });
  }
};

// ==========================================
// 1. Diagnostic / Ping Route (No DB required)
// ==========================================
const pingHandler = (req, res) => {
  res.json({
    status: 'ok',
    message: 'pong',
    timestamp: new Date().toISOString(),
    env: {
      hasMongoUri: !!process.env.MONGO_URI,
      hasJwtSecret: !!process.env.JWT_SECRET,
      hasAdminUser: !!process.env.ADMIN_USER,
      hasAdminPass: !!process.env.ADMIN_PASS,
      hasCloudinary: !!process.env.CLOUDINARY_CLOUD_NAME,
      nodeVersion: process.version,
    },
  });
};

app.get('/api/ping', pingHandler);
app.get('/ping', pingHandler);

// ==========================================
// 2. Health Check Route
// ==========================================
const healthHandler = async (req, res) => {
  try {
    await connectDB();
    res.json({
      status: 'online',
      platform: 'vercel-serverless',
      timestamp: new Date().toISOString(),
      database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      host: mongoose.connection.host || null,
      name: mongoose.connection.name || null,
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

// ==========================================
// 3. Auth Routes
// ==========================================
const loginHandler = (req, res) => {
  const { username, password } = req.body;

  const validUser = process.env.ADMIN_USER || 'admin';
  const validPass = process.env.ADMIN_PASS || 'rwave_admin_2026';
  const jwtSecret = process.env.JWT_SECRET || 'super_secret_rwave_jwt_key_change_in_prod';

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: 'Username and password are required.',
    });
  }

  if (username !== validUser || password !== validPass) {
    return res.status(401).json({
      success: false,
      message: 'Invalid administrative credentials.',
    });
  }

  const token = jwt.sign(
    { username, role: 'admin' },
    jwtSecret,
    { expiresIn: '24h' }
  );

  return res.json({
    success: true,
    message: 'Authentication successful.',
    token,
    user: { username, role: 'admin' },
  });
};

app.post('/api/auth/login', loginHandler);
app.post('/auth/login', loginHandler);

// ==========================================
// 4. Product Routes (Public & Admin)
// ==========================================

// GET /api/products
const getProductsHandler = async (req, res) => {
  try {
    const filter = {};
    if (req.query.category) {
      filter.category = req.query.category;
    }

    const products = await Product.find(filter)
      .sort({ displayOrder: 1, createdAt: -1 })
      .lean();

    res.json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve products.',
      error: error.message,
    });
  }
};

app.get('/api/products', withDB, getProductsHandler);
app.get('/products', withDB, getProductsHandler);

// GET /api/products/:id
const getSingleProductHandler = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.',
      });
    }
    res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve product.',
      error: error.message,
    });
  }
};

app.get('/api/products/:id', withDB, getSingleProductHandler);
app.get('/products/:id', withDB, getSingleProductHandler);

// POST /api/products (Protected)
const createProductHandler = async (req, res) => {
  try {
    const { name, category, description, specs, imageUrl, inStock, displayOrder } = req.body;

    let finalImageUrl = imageUrl;
    let finalCloudinaryId = null;

    if (req.file) {
      const uploadResult = await uploadBufferToCloudinary(req.file.buffer);
      finalImageUrl = uploadResult.secure_url;
      finalCloudinaryId = uploadResult.public_id;
    }

    if (!finalImageUrl) {
      return res.status(400).json({
        success: false,
        message: 'Product image is required (either upload a file or provide imageUrl).',
      });
    }

    let parsedSpecs = [];
    if (specs) {
      if (Array.isArray(specs)) {
        parsedSpecs = specs;
      } else if (typeof specs === 'string') {
        parsedSpecs = specs
          .split(/•|,|\n/)
          .map((s) => s.trim())
          .filter(Boolean);
      }
    }

    const product = new Product({
      name: name ? name.trim() : '',
      category,
      description: description ? description.trim() : '',
      specs: parsedSpecs,
      imageUrl: finalImageUrl,
      cloudinaryPublicId: finalCloudinaryId,
      inStock: inStock !== undefined ? inStock === true || inStock === 'true' : true,
      displayOrder: displayOrder !== undefined ? Number(displayOrder) : 0,
    });

    const savedProduct = await product.save();

    res.status(201).json({
      success: true,
      message: 'Product created successfully.',
      data: savedProduct,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to create product.',
      error: error.message,
    });
  }
};

app.post('/api/products', withDB, verifyAdmin, upload.single('image'), createProductHandler);
app.post('/products', withDB, verifyAdmin, upload.single('image'), createProductHandler);

// PUT /api/products/:id (Protected)
const updateProductHandler = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.',
      });
    }

    const { name, category, description, specs, imageUrl, inStock, displayOrder } = req.body;

    if (name !== undefined) product.name = name.trim();
    if (category !== undefined) product.category = category;
    if (description !== undefined) product.description = description.trim();

    if (specs !== undefined) {
      if (Array.isArray(specs)) {
        product.specs = specs;
      } else if (typeof specs === 'string') {
        product.specs = specs
          .split(/•|,|\n/)
          .map((s) => s.trim())
          .filter(Boolean);
      }
    }

    if (req.file) {
      if (product.cloudinaryPublicId) {
        await deleteFromCloudinary(product.cloudinaryPublicId);
      }
      const uploadResult = await uploadBufferToCloudinary(req.file.buffer);
      product.imageUrl = uploadResult.secure_url;
      product.cloudinaryPublicId = uploadResult.public_id;
    } else if (imageUrl !== undefined && imageUrl.trim() && imageUrl.trim() !== product.imageUrl) {
      if (product.cloudinaryPublicId) {
        await deleteFromCloudinary(product.cloudinaryPublicId);
        product.cloudinaryPublicId = null;
      }
      product.imageUrl = imageUrl.trim();
    }

    if (inStock !== undefined) {
      product.inStock = inStock === true || inStock === 'true';
    }

    if (displayOrder !== undefined) {
      product.displayOrder = Number(displayOrder);
    }

    const updatedProduct = await product.save();

    res.json({
      success: true,
      message: 'Product updated successfully.',
      data: updatedProduct,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to update product.',
      error: error.message,
    });
  }
};

app.put('/api/products/:id', withDB, verifyAdmin, upload.single('image'), updateProductHandler);
app.put('/products/:id', withDB, verifyAdmin, upload.single('image'), updateProductHandler);

// DELETE /api/products/:id (Protected)
const deleteProductHandler = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.',
      });
    }

    if (product.cloudinaryPublicId) {
      await deleteFromCloudinary(product.cloudinaryPublicId);
    }

    await Product.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Product deleted successfully.',
      data: { id: req.params.id },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete product.',
      error: error.message,
    });
  }
};

app.delete('/api/products/:id', withDB, verifyAdmin, deleteProductHandler);
app.delete('/products/:id', withDB, verifyAdmin, deleteProductHandler);

// Root fallback status
app.get(['/', '/api'], (req, res) => {
  res.json({
    status: 'online',
    message: 'R-Wave Cardio NX API is operational',
    timestamp: new Date().toISOString(),
  });
});

export default app;

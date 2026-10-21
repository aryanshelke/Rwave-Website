const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables before any other imports (supports root and server/ directory)
dotenv.config();
dotenv.config({ path: path.join(__dirname, '.env') });

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const seedDatabase = require('./seed');

const app = express();
const PORT = process.env.PORT || 5001;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve local fallback images statically if needed
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  const mongoose = require('mongoose');
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    host: mongoose.connection.host || null,
    name: mongoose.connection.name || null,
  });
});

// Bootstrapping function: Connect to Atlas, run seeder, then listen
const startServer = async () => {
  try {
    // 1. Connect to MongoDB Atlas (exits with troubleshooting hints on failure)
    await connectDB();

    // 2. Run automated Cloudinary-aware seeder
    await seedDatabase();

    // 3. Start listening for incoming requests
    app.listen(PORT, () => {
      console.log(`🚀 R Wave Backend Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('❌ Fatal error during server startup:', err.message);
    process.exit(1);
  }
};

startServer();

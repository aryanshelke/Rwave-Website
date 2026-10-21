const mongoose = require('mongoose');

let cachedConnection = null;

const connectDB = async () => {
  // 1. Return cached connection if already connected (vital for serverless warm starts)
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (cachedConnection) {
    return cachedConnection;
  }

  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    const errorMsg = '❌ MONGO_URI is missing from environment variables.';
    console.error(errorMsg);
    if (!process.env.VERCEL) {
      process.exit(1);
    }
    throw new Error(errorMsg);
  }

  try {
    const conn = await mongoose.connect(mongoUri, {
      dbName: 'rwave_cardio_nx',
      serverSelectionTimeoutMS: 10000,
    });

    cachedConnection = conn;
    console.log(`🔌 Connected to MongoDB Atlas: ${conn.connection.host} (DB: ${conn.connection.name})`);

    // Event listeners for disconnects
    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB Atlas disconnected. Attempting reconnection...');
    });

    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB Atlas runtime connection error:', err.message);
    });

    // Graceful shutdown on SIGINT / SIGTERM (for non-serverless Node processes)
    if (!process.env.VERCEL) {
      process.on('SIGINT', async () => {
        await mongoose.connection.close();
        console.log('🛑 MongoDB Atlas connection closed via app termination (SIGINT).');
        process.exit(0);
      });

      process.on('SIGTERM', async () => {
        await mongoose.connection.close();
        console.log('🛑 MongoDB Atlas connection closed via app termination (SIGTERM).');
        process.exit(0);
      });
    }

    return conn;
  } catch (error) {
    console.error('❌ MongoDB Atlas Connection Failed:', error.message);
    console.error('----------------------------------------------------');
    console.error('🔍 TROUBLESHOOTING HINTS:');
    console.error('1. Check that MONGO_URI contains the correct username & password.');
    console.error('2. Ensure Network Access in MongoDB Atlas whitelist includes 0.0.0.0/0.');
    console.error('3. Verify that database user has readWrite permissions on rwave_cardio_nx.');
    console.error('----------------------------------------------------');
    if (!process.env.VERCEL) {
      process.exit(1);
    }
    throw error;
  }
};

module.exports = connectDB;


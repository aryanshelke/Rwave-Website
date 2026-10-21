import mongoose from 'mongoose';
import dns from 'dns';

// Configure reliable DNS servers for MongoDB Atlas SRV resolution
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch {
  // Gracefully fallback to system DNS in environments where setServers is restricted
}

let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error('MONGO_URI is missing from environment variables');
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(uri, {
        dbName: 'rwave_cardio_nx',
        serverSelectionTimeoutMS: 8000,
      })
      .then((m) => m);
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (err) {
    cached.promise = null;
    throw err;
  }
}


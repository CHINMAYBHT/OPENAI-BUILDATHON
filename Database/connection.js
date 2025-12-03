import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables from .env
dotenv.config({ path: '../.env' });

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected Successfully!');
    return true;
  } catch (error) {
    console.error('❌ MongoDB Connection Failed:', error.message);
    return false;
  }
};

export default { connectDB };
// Database/connection.js
// Supabase connection placeholder (no actual DB connection needed)
import supabase from './supabaseClient.js';

export const connectDB = async () => {
  console.log('Supabase client initialized');
  return true;
};

export default { connectDB };
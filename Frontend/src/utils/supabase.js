import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables (VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY). Ensure the `.env` in the `Frontend` folder contains these keys and that you started Vite from that folder.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;

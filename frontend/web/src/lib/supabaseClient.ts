import { createClient } from '@supabase/supabase-js';

// Read Supabase URL and Anon Key from environment variables (using Vite's import.meta.env)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    'Supabase URL or Anon Key is missing. Make sure they are set in your .env file (prefixed with VITE_).',
  );
  // In a real app, you might want to throw an error or handle this state more gracefully
}

// Initialize the Supabase client
// The default storage is localStorage for web
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Optional: Log client status
console.log('Supabase client initialized:', supabase ? 'Success' : 'Failed'); 
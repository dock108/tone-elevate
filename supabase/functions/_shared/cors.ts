// supabase/functions/_shared/cors.ts

// Common CORS headers. Adjust Access-Control-Allow-Origin for production.
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Or your frontend URL like 'http://localhost:5173' or your production domain
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}; 
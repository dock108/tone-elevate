import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts'; // Assuming you have a shared CORS setup

// --- OpenAI Client Setup ---
// Note: Deno runtime doesn't have direct npm compatibility like Node.
// Using a simple fetch wrapper or a Deno-compatible OpenAI library is needed.
// This example uses fetch. Ensure OPENAI_API_KEY is set in Supabase Function secrets.
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions"; // Example URL

interface RefineRequestBody {
  originalMessage: string;
  userFollowUp: string;
  tone: string;
  context: string;
  // history?: { request: string; response: string }[]; // Optional history if needed
}

serve(async (req) => {
  // 1. Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 2. Create Supabase client with Auth context
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '' // Use service role for checking premium status
    );

    // Get auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error("Missing authorization header");
    }
    
    // Get user from JWT
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(authHeader.replace('Bearer ', ''));
    if (userError || !user) {
        console.error("Auth error:", userError);
        return new Response(JSON.stringify({ error: 'Authentication failed' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 401,
        });
    }

    // 3. Check Premium Status using Service Role Client
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('is_premium')
      .eq('id', user.id)
      .single();

    if (profileError) {
        console.error("Profile fetch error:", profileError);
        // Handle case where profile might not exist (e.g., new user) vs. actual DB error
         if (profileError.code === 'PGRST116') { // row not found
             return new Response(JSON.stringify({ error: 'User profile not found.' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 403, // Forbidden or Not Found, depends on desired UX
            });
         }
         // Otherwise, it's a server error
         return new Response(JSON.stringify({ error: 'Database error checking premium status.' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
        });
    }

    if (!profileData || !profileData.is_premium) {
      console.log(`User ${user.id} is not premium. Denying refinement.`);
      return new Response(JSON.stringify({ error: 'Message refinement requires a Premium subscription.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 403, // Forbidden
      });
    }

    // 4. Parse Input Body
    const body: RefineRequestBody = await req.json();
    const { originalMessage, userFollowUp, tone, context } = body;

    if (!originalMessage || !userFollowUp || !tone || !context) {
      return new Response(JSON.stringify({ error: 'Missing required fields in request body.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }
    
    if (!OPENAI_API_KEY) {
       console.error("OPENAI_API_KEY environment variable not set.");
       return new Response(JSON.stringify({ error: 'Server configuration error: Missing API key.' }), {
           headers: { ...corsHeaders, 'Content-Type': 'application/json' },
           status: 500,
       });
    }

    // 5. Call AI Model (Example using OpenAI Chat Completions)
    // --- Construct the prompt ---
    // This is a crucial part and needs careful crafting based on your desired refinement behavior
    const prompt = `
Original message (Tone: ${tone}, Context: ${context}):
"""
${originalMessage}
"""

User refinement request:
"""
${userFollowUp}
"""

Refine the original message according to the user's request, maintaining the original tone (${tone}) and context (${context}) unless the request specifically asks to change them. Output only the refined message text.
Refined message:
`;

    // --- Make the API call ---
    const aiResponse = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo", // Or your preferred model
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7, // Adjust as needed
        max_tokens: 1024, // Adjust as needed
      }),
    });

    if (!aiResponse.ok) {
      const errorBody = await aiResponse.text();
      console.error("OpenAI API error:", aiResponse.status, errorBody);
      throw new Error(`AI API request failed: ${aiResponse.statusText}`);
    }

    const aiData = await aiResponse.json();
    const refinedMessage = aiData.choices?.[0]?.message?.content?.trim();

    if (!refinedMessage) {
        console.error("No refined message content found in OpenAI response:", aiData);
        throw new Error("Failed to get refined message from AI.");
    }

    // 6. Return Response
    return new Response(JSON.stringify({ refinedMessage: refinedMessage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error("Unhandled error:", error);
    return new Response(JSON.stringify({ error: error.message || 'An unexpected error occurred.' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
}); 
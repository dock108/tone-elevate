    // supabase/functions/tone-suggest/index.ts
    import { serve } from 'https://deno.land/std@0.192.0/http/server.ts';
    import { corsHeaders } from '../_shared/cors.ts'; // Shared CORS headers
    import OpenAI from 'https://deno.land/x/openai@v4.52.7/mod.ts'; // Deno OpenAI lib
    import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

    // --- Configuration ---
    const FREE_SUGGESTION_LIMIT_PER_DAY = 1; // Set the daily limit for free users
    const MAX_INPUT_LENGTH = 5000; // Max characters for user input
    const VALID_CONTEXTS = ["Documentation", "Email", "General Text", "GitHub Comment", "LinkedIn Post", "Teams Chat", "Text Message"];
    const VALID_OUTPUT_FORMATS = ["Raw Text", "Markdown"];

    // Initialize OpenAI client
    const openai = new OpenAI({ apiKey: Deno.env.get('OPENAI_API_KEY') });

    console.log('generate-message (tone-suggest) function deployed!');

    serve(async (req) => {
      // 1. Handle CORS Preflight
      if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
      }

      // --- Initialize Supabase Admin Client ---
      const supabaseAdmin = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
        { auth: { autoRefreshToken: false, persistSession: false } }
      );

      try {
        // 2. Verify User Authentication (JWT) - Attempt, but don't fail if invalid/missing
        const authHeader = req.headers.get('Authorization');
        let userId: string | null = null; // Initialize userId as null

        if (authHeader && authHeader.startsWith('Bearer ')) {
          const token = authHeader.replace('Bearer ', '');
          try {
            const { data, error: userError } = await supabaseAdmin.auth.getUser(token);
            if (!userError && data?.user) {
              userId = data.user.id;
              console.log('Request authenticated for user:', userId);
            } else {
               console.warn('JWT provided but invalid or user not found:', userError?.message || 'No user data');
               // Do not throw PermissionDenied here, allow anonymous access
            }
          } catch (getUserError) {
              console.error('Error during getUser verification:', getUserError);
              // Do not throw, allow anonymous access
          }
        } else {
          console.log('No Authorization header found, proceeding as anonymous.');
        }

        // 3. Parse and Validate Request Body
        const { text, tone, context, outputFormat } = await req.json();
        if (!text || !tone || !context || !outputFormat) {
          throw new Error('Missing required fields: text, tone, context, outputFormat');
        }
        if ([text, tone, context, outputFormat].some(val => typeof val !== 'string')) {
          throw new Error('Invalid input types: all fields must be strings');
        }
        if (!VALID_CONTEXTS.includes(context)) {
            throw new Error(`Invalid context: ${context}. Must be one of: ${VALID_CONTEXTS.join(', ')}`);
        }
         if (!VALID_OUTPUT_FORMATS.includes(outputFormat)) {
            throw new Error(`Invalid outputFormat: ${outputFormat}. Must be one of: ${VALID_OUTPUT_FORMATS.join(', ')}`);
        }
        if (text.length > MAX_INPUT_LENGTH) {
          throw new Error(`Input text exceeds maximum length of ${MAX_INPUT_LENGTH} characters.`);
        }
        console.log(`Processing request: Tone=${tone}, Context=${context}, Format=${outputFormat}, Length=${text.length}, User=${userId ?? 'anonymous'}`);

        // 4. Check User Subscription Status & Rate Limit (ONLY if user is logged in)
        let usageUpdate = {}; // Initialize usage update object

        if (userId) {
          console.log(`Checking status/limit for logged-in user ${userId}...`);
          try {
             const { data: profileData, error: profileError } = await supabaseAdmin
                .from('profiles')
                .select('subscription_status, last_suggestion_at, suggestion_count_today')
                .eq('id', userId)
                .single();

            // If profile exists, check status and limits
            if (profileData) {
                const isPremium = profileData.subscription_status === 'premium' || profileData.subscription_status === 'active';
                if (!isPremium) {
                  console.log(`User ${userId} is FREE. Checking limit (${FREE_SUGGESTION_LIMIT_PER_DAY}/day).`);
                  const now = new Date();
                  const lastUsedDate = profileData.last_suggestion_at ? new Date(profileData.last_suggestion_at) : null;
                  const count = profileData.suggestion_count_today || 0;
                  const isSameDay = lastUsedDate && now.toDateString() === lastUsedDate.toDateString();

                  if (isSameDay && count >= FREE_SUGGESTION_LIMIT_PER_DAY) {
                    console.log(`User ${userId} has reached the daily limit.`);
                    // Return the specific limit error for logged-in free users
                    return new Response(JSON.stringify({ error: `Daily generation limit (${FREE_SUGGESTION_LIMIT_PER_DAY}) reached for free users. Please upgrade for unlimited access.` }), {
                      status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                    });
                  } else {
                    console.log(`User ${userId} is under the limit. Proceeding.`);
                    // Prepare usage update only for logged-in free users under the limit
                    usageUpdate = { last_suggestion_at: now.toISOString(), suggestion_count_today: isSameDay ? count + 1 : 1 };
                  }
                } else {
                   console.log(`User ${userId} is premium. Bypassing limit.`);
                   // No usage update needed for premium, or could log usage differently if desired
                }
            } else {
                 console.warn(`No profile found for logged-in user ${userId}. Proceeding without limit checks.`);
                 // Handle case where profile might not exist yet (e.g., just signed up)
                 // Proceeding, but usage won't be tracked until profile exists.
            }
          } catch (profileLookupError) {
              // Log error fetching profile, but proceed with generation as if anonymous/unlimited for this request
              console.error(`Error checking profile/limit for user ${userId}:`, profileLookupError.message);
              // Don't block generation due to profile check error
          }
        } else {
           console.log('Anonymous user. Skipping profile/limit checks.');
           // No usage update needed for anonymous users
        }

        // 5. Construct Refined OpenAI Prompt for Generation
        const systemPrompt = `You are ToneSmith, an expert communication assistant. Your primary goal is to transform the user's raw input into a complete, polished message that is **structurally and stylistically appropriate** for the specified context. Adhere strictly to the requested tone and output format.

**Crucially, use the specified 'context' to guide the message structure:**
- For contexts like 'Email' or formal 'Documentation', include appropriate greetings/closings if implied or necessary.
- For contexts like 'Teams Chat' or 'Text Message', prioritize brevity and omit formal greetings/closings unless the user's input specifically dictates them.
- For 'GitHub Comment' or 'LinkedIn Post', adapt to the common conventions of those platforms.
- For 'General Text', assume minimal structural additions are needed.

**Output ONLY the final generated message content.** Do not include any extra conversational text, introductions (like "Hey," or "Here is the message:"), explanations, labels, or meta-commentary.`;

        const userPrompt = `Based on the user's raw input below, craft a **complete and contextually suitable** message.

Tone: ${tone}
Context: ${context}
Output Format: ${outputFormat}

Remember to adapt the message structure (greetings, closings, length, etc.) to fit the '${context}'.

User's Raw Input:
          """
          ${text}
          """

          Generated Message:
        `; // Correctly closing the template literal here

        // 6. Call OpenAI API
        console.log('Calling OpenAI API...');
        const completion = await openai.chat.completions.create({
          model: 'gpt-4o',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          max_tokens: 1000, // Increased for potentially longer messages
          temperature: 0.7,
          // No response_format needed, we want raw text/markdown
        });

        const generatedMessage = completion.choices[0]?.message?.content?.trim() ?? null;
        console.log('OpenAI Generated Message (raw):', generatedMessage);

        if (!generatedMessage) {
          throw new Error('AI did not generate a message.');
        }

        // 7. Update Usage Count (if necessary and applicable) AFTER successful AI call
        // Only update if userId is valid and usageUpdate has keys (i.e., logged-in free user under limit)
        if (userId && Object.keys(usageUpdate).length > 0) {
          console.log(`Updating usage count for user ${userId}:`, usageUpdate);
          const { error: updateError } = await supabaseAdmin
            .from('profiles')
            .update(usageUpdate)
            .eq('id', userId);
          if (updateError) console.error(`Failed to update usage count for user ${userId}:`, updateError); // Log error but continue
        }

        console.log('Successfully generated message.');

        // 8. Return Response to Frontend
        return new Response(JSON.stringify({ generatedMessage }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        });

      } catch (error) {
        console.error('Error in generate-message (tone-suggest) function:', error);
        // Do not return 403 for PermissionDenied anymore, as we handle invalid JWT gracefully
        const status = error.message.includes("limit reached") ? 429
                     : (error.message.includes("Invalid") || error.message.includes("Missing required fields")) ? 400 // Bad request for invalid inputs
                     : 500; // Generic server error
        return new Response(JSON.stringify({ error: error.message }), {
          status: status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    });

    // You will also need the shared CORS file: supabase/functions/_shared/cors.ts
    /*
    export const corsHeaders = {
      'Access-Control-Allow-Origin': '*', // Use your frontend URL in production
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    };
    */

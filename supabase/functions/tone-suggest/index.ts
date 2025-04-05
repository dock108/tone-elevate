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
    const DEFAULT_TONE = "professional but natural"; // Define default tone

    // Initialize OpenAI client
    const openai = new OpenAI({ apiKey: Deno.env.get('OPENAI_API_KEY') });

    console.log('generate-message (tone-suggest) function deployed!');

    // --- Placeholder Parsing Function ---
    // TODO: Implement actual parsing logic (e.g., using another LLM call)
    /*async function parseUserInput(userInput: string): Promise<{ intent: string; tone: string; message: string }> {
        console.log("Parsing user input (placeholder)...");
        // Simulate parsing - replace with actual logic later
        // Example: Extract intent/tone if explicitly mentioned, otherwise use defaults/input.
        let intent = "Rewrite the provided text"; // Default intent
        let tone = DEFAULT_TONE;
        let message = userInput;

        // Basic placeholder logic: Check for keywords (highly simplified)
        const lowerInput = userInput.toLowerCase();
        if (lowerInput.startsWith("write an email")) {
            intent = "Write an email based on the following points";
            message = userInput.substring("write an email".length).trim();
        } else if (lowerInput.startsWith("apologize for")) {
            intent = "Write an apology message";
        }
        // Add more sophisticated parsing here...

        // Placeholder: Look for explicit tone mention (e.g., "make it casual")
        const toneMatch = userInput.match(/make it (\w+)|tone: (\w+)/i);
        if (toneMatch && toneMatch[1]) {
            tone = toneMatch[1];
            // Potentially remove the tone instruction from the message itself
        } else if (toneMatch && toneMatch[2]) {
            tone = toneMatch[2];
        }


        console.log(`Parsed (placeholder): Intent='${intent}', Tone='${tone}'`);
        return { intent, tone, message };
    }*/

    // --- Actual Parsing Function using LLM ---
    async function parseUserInput(userInput: string): Promise<{ intent: string; tone: string; message: string }> {
        console.log("Parsing user input with LLM...");

        const parsingSystemPrompt = `You are an expert text analysis assistant. Your task is to analyze the user's raw input and extract the core information needed to rewrite or generate a message. Identify the user's primary \"intent\" (what they want to achieve, e.g., \"Write a follow-up email\", \"Apologize for missing a meeting\", \"Rewrite this draft to be more polite\"), the desired \"tone\" (if specified, otherwise use null), and the essential \"message\" content (the user's draft text or key points). Return ONLY a valid JSON object with the keys \"intent\", \"tone\", and \"message\".

Example:
Input: \"follow up on the invoice i sent to Acme Corp last Tuesday\"
Output: {\"intent\": \"Write a follow-up email about an invoice\", \"tone\": null, \"message\": \"invoice sent to Acme Corp last Tuesday\"}

Input: \"this sounds too harsh: 'Your report is late.' make it softer\"
Output: {\"intent\": \"Rewrite the provided text\", \"tone\": \"softer\", \"message\": \"Your report is late.\"}

Input: \"write an email to marketing about the new campaign launch, make it exciting\"
Output: {\"intent\": \"Write an email about the new campaign launch\", \"tone\": \"exciting\", \"message\": \"new campaign launch\"}
        `;

        const parsingUserPrompt = `Analyze the following user input and provide the JSON output:

Input:
"""
${userInput}
"""

JSON Output:`;

        try {
            const completion = await openai.chat.completions.create({
                model: 'gpt-4o', // Or a cheaper/faster model like gpt-3.5-turbo if preferred & sufficient
                messages: [
                    { role: 'system', content: parsingSystemPrompt },
                    { role: 'user', content: parsingUserPrompt },
                ],
                max_tokens: 200,
                temperature: 0.2, // Low temperature for factual extraction
                response_format: { type: "json_object" }, // Request JSON output
            });

            const rawResponse = completion.choices[0]?.message?.content;
            if (!rawResponse) {
                throw new Error('Parsing LLM returned empty content.');
            }

            console.log("Raw JSON response from parsing LLM:", rawResponse);
            const parsed = JSON.parse(rawResponse);

            // Validate the parsed object structure
            if (typeof parsed.intent !== 'string' || typeof parsed.message !== 'string') {
                throw new Error('Invalid JSON structure received from parsing LLM.');
            }

            const intent = parsed.intent;
            const tone = (typeof parsed.tone === 'string' && parsed.tone.trim() !== '') ? parsed.tone : DEFAULT_TONE;
            const message = parsed.message;

            console.log(`Parsed: Intent='${intent}', Tone='${tone}'`);
            return { intent, tone, message };

        } catch (error) {
            console.error('Error during LLM parsing:', error);
            // Fallback mechanism: If parsing fails, use basic defaults
            console.warn('Falling back to default parsing due to error.');
            return {
                intent: "Process the provided text",
                tone: DEFAULT_TONE,
                message: userInput, // Pass the original input as the message
            };
        }
    }

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
        // Expecting userInput, context, outputFormat primarily now
        const { userInput, context, outputFormat } = await req.json();
        // --- Deprecate direct 'text' and 'tone' inputs for single-shot mode ---
        // const { text, tone, context, outputFormat } = await req.json();

        // Validate required fields for the new flow
        if (!userInput || !context || !outputFormat) {
            throw new Error('Missing required fields: userInput, context, outputFormat');
        }
        if ([userInput, context, outputFormat].some(val => typeof val !== 'string')) {
            throw new Error('Invalid input types: userInput, context, and outputFormat must be strings');
        }
        if (!VALID_CONTEXTS.includes(context)) {
            throw new Error(`Invalid context: ${context}. Must be one of: ${VALID_CONTEXTS.join(', ')}`);
        }
         if (!VALID_OUTPUT_FORMATS.includes(outputFormat)) {
            throw new Error(`Invalid outputFormat: ${outputFormat}. Must be one of: ${VALID_OUTPUT_FORMATS.join(', ')}`);
        }
        if (userInput.length > MAX_INPUT_LENGTH) {
          throw new Error(`Input text exceeds maximum length of ${MAX_INPUT_LENGTH} characters.`);
        }
        // console.log(`Processing request: Tone=${tone}, Context=${context}, Format=${outputFormat}, Length=${text.length}, User=${userId ?? 'anonymous'}`);
        console.log(`Processing request: Context=${context}, Format=${outputFormat}, InputLength=${userInput.length}, User=${userId ?? 'anonymous'}`);

        // --- New Step: Parse User Input ---
        const { intent, tone, message } = await parseUserInput(userInput);
        // Now we have intent, tone, and the core message to work with.

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
        //    Using the parsed intent, tone, and message
        const systemPrompt = `You are ToneSmith, a writing assistant focused on clear, natural, and effective communication. Your goal is to help the user achieve their communication objective (intent) by rewriting or generating a message based on their input.\n\n**Core Principles:**\n1.  **Clarity & Conciseness:** Produce clean, easy-to-understand text.\n2.  **Natural Language & Anti-Cliché:** Sound human. **Aggressively avoid** jargon and tired corporate clichés. **Specifically, DO NOT use phrases like \"hope this finds you well,\" \"per my last email,\" \"circle back,\" or similar empty pleasantries**, unless the user's input explicitly demands them for a specific effect.\n3.  **Intent-Driven:** Focus squarely on achieving the user's specified goal: \`${intent}\`.\n4.  **Tone & Context Adherence:** Strictly follow the requested \`tone\` and adapt the message's structure (greetings, sign-offs, length, formality) to the specified \`context\` (e.g., Email, Teams Chat, etc.). **For Emails, get straight to the point; avoid generic opening fluff.**\n\n**Output Requirements:**\n-   **Message Only:** Output *only* the final generated message.\n-   **No Chatter:** Do *not* include introductions (e.g., \"Here's the draft:\"), explanations, or apologies.`;

        // Adapt user prompt to use parsed components
        const userPrompt = `Based on the user's goal ("${intent}") and their raw input below, craft a **complete and contextually suitable** message.

Tone: ${tone}
Context: ${context}
Output Format: ${outputFormat}

Remember to adapt the message structure (greetings, closings, length, etc.) to fit the '${context}'.

User's Raw Input/Message:
          """
          ${message}
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

        let generatedMessage = completion.choices[0]?.message?.content?.trim() ?? null;
        console.log('OpenAI Generated Message (raw):', generatedMessage);

        if (!generatedMessage) {
          throw new Error('AI did not generate a message.');
        }

        // --- New Step: Post-Process the Output ---
        // Remove common AI introductory phrases, even though the prompt discourages them.
        const prefixesToRemove = [
            /^Here's the message:/i,
            /^Here's a draft:/i,
            /^Okay, here is the draft:/i,
            /^Sure, here's the message:/i,
            /^Here is the message you requested:/i,
            /^Generated Message:/i, // In case the model echoes the prompt label
            // Add more prefixes as needed
        ];

        for (const prefixRegex of prefixesToRemove) {
            generatedMessage = generatedMessage.replace(prefixRegex, '').trim();
        }
        console.log('OpenAI Generated Message (post-processed):', generatedMessage);
        // --- End Post-Processing ---

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

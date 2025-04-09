    // supabase/functions/tone-suggest/index.ts
    import { serve } from 'https://deno.land/std@0.192.0/http/server.ts';
    import { corsHeaders } from '../_shared/cors.ts'; // Shared CORS headers
    import OpenAI from 'https://deno.land/x/openai@v4.52.7/mod.ts'; // Deno OpenAI lib
    import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
    import { DEFAULT_TONE_ID, getToneInstructions, tones } from '../_shared/tones.ts'; // Import from shared registry

    // --- Configuration ---
    const FREE_SUGGESTION_LIMIT_PER_DAY = 1; // Set the daily limit for free users
    const MAX_INPUT_LENGTH = 8192; // Max characters for user input - Updated to 8192
    const VALID_CONTEXTS = ["Documentation", "Email", "General Text", "GitHub Comment", "LinkedIn Post", "Teams Chat", "Text Message"];
    const VALID_OUTPUT_FORMATS = ["Raw Text", "Markdown"];

    // Initialize OpenAI client
    const openai = new OpenAI({ apiKey: Deno.env.get('OPENAI_API_KEY') });

    console.log('generate-message (tone-suggest) function deployed!');

    // --- LLM Parsing Function ---
    async function parseUserInput(userInput: string): Promise<{ intent: string; tone: string; message: string }> {
        console.log("Parsing user input with LLM...");

        const parsingSystemPrompt = `You are an expert text analysis assistant. Your task is to analyze the user's raw input and extract the core information needed to rewrite or generate a message. Identify the user's primary "intent" (what they want to achieve, e.g., "Write a follow-up email", "Apologize for missing a meeting", "Rewrite this draft to be more polite"), the desired "tone" (if specified, it MUST be one of the valid IDs: [${tones.map(t => `"${t.id}"`).join(', ')}], otherwise use null), and the essential "message" content (the user's draft text or key points). Return ONLY a valid JSON object with the keys "intent", "tone", and "message".

Example 1:
Input: "follow up on the invoice i sent to Acme Corp last Tuesday"
Output: {"intent": "Write a follow-up email about an invoice", "tone": null, "message": "invoice sent to Acme Corp last Tuesday"}

Example 2:
Input: "this sounds too harsh: 'Your report is late.' make it Professional - Subordinates"
Output: {"intent": "Rewrite the provided text", "tone": "Professional - Subordinates", "message": "Your report is late."}

Example 3:
Input: "write an email to marketing about the new campaign launch, make it exciting"
Output: {"intent": "Write an email about the new campaign launch", "tone": "Enthusiastic", "message": "new campaign launch"}
    `; // Added valid tone IDs constraint to prompt

        const parsingUserPrompt = `Analyze the following user input and provide the JSON output:

Input:
"""
${userInput}
"""

JSON Output:`;

        try {
            const completion = await openai.chat.completions.create({
                model: 'gpt-4o',
                messages: [
                    { role: 'system', content: parsingSystemPrompt },
                    { role: 'user', content: parsingUserPrompt },
                ],
                max_tokens: 250, // Increased slightly for potentially longer tone IDs
                temperature: 0.1, // Very low temperature for accurate extraction
                response_format: { type: "json_object" },
            });

            const rawResponse = completion.choices[0]?.message?.content;
            if (!rawResponse) {
                throw new Error('Parsing LLM returned empty content.');
            }

            console.log("Raw JSON response from parsing LLM:", rawResponse);
            const parsed = JSON.parse(rawResponse);

            // Validate structure
            if (typeof parsed.intent !== 'string' || typeof parsed.message !== 'string') {
                throw new Error('Invalid JSON structure received from parsing LLM (missing intent or message).');
            }
            // Validate tone (can be null or a valid tone string)
            if (parsed.tone !== null && typeof parsed.tone !== 'string') {
                 throw new Error('Invalid JSON structure received from parsing LLM (invalid tone type).');
            }

            const intent = parsed.intent;
            const message = parsed.message;
            // Validate parsed tone against the registry, fallback to default if invalid or null
            const parsedTone = parsed.tone;
            const isValidTone = parsedTone && tones.some(t => t.id === parsedTone);
            const tone = isValidTone ? parsedTone : DEFAULT_TONE_ID; // Use default if parsed tone is invalid or null

            if (!isValidTone && parsedTone !== null) {
                console.warn(`Parsed tone "${parsedTone}" is not in the known list. Falling back to default tone: ${DEFAULT_TONE_ID}`);
            } else if (parsedTone === null) {
                 console.log(`No specific tone parsed. Using default tone: ${DEFAULT_TONE_ID}`);
            }

            console.log(`Parsed: Intent='${intent}', Tone='${tone}'`);
            return { intent, tone, message };

        } catch (error) {
            console.error('Error during LLM parsing:', error);
            // Fallback mechanism: Use default tone ID
            console.warn(`Falling back to default parsing due to error. Using default tone: ${DEFAULT_TONE_ID}`);
            return {
                intent: "Process the provided text",
                tone: DEFAULT_TONE_ID, // Use imported default ID
                message: userInput,
            };
        }
    }

    // --- Refactored: Message Generation Function ---
    async function generateMessage(
        openaiClient: OpenAI,
        intent: string,
        tone: string, // Expecting a valid tone ID here
        message: string,
        context: string,
        outputFormat: string,
        outputLength: string // Added outputLength parameter ('short', 'medium', 'long')
    ): Promise<string> {
        console.log(`Generating message with Tone: ${tone}, Context: ${context}, Length: ${outputLength}`);

        const toneSpecificGuidanceText = getToneInstructions(tone);
        const toneSpecificGuidance = toneSpecificGuidanceText
            ? `\n\n**Recipient-Specific Tone Guidance (${tone}):** ${toneSpecificGuidanceText}`
            : '';

        // --- Length Guidance ---
        let lengthGuidance = '';
        switch (outputLength) {
            case 'short':
                lengthGuidance = '\n\n**Output Length:** Keep the message very concise (e.g., 1-2 sentences or key bullet points). Focus only on the most critical information.';
                break;
            case 'long':
                lengthGuidance = '\n\n**Output Length:** Generate a detailed and comprehensive message. Expand on the key points, provide context, and ensure thoroughness (e.g., multiple paragraphs if appropriate).';
                break;
            case 'medium': // Default case
            default:
                lengthGuidance = '\n\n**Output Length:** Generate a message of standard, medium length (e.g., a short paragraph or a few bullet points). Balance conciseness with necessary detail.';
                break;
        }

        const systemPrompt = `You are ToneElevate, a writing assistant focused on clear, natural, and effective communication. Your goal is to help the user achieve their communication objective (intent) by rewriting or generating a message based on their input.\n\n**Core Principles:**\n1.  **Clarity & Conciseness:** Produce clean, easy-to-understand text.\n2.  **Natural Language & Anti-Cliché:** Sound human. **Aggressively avoid** jargon and tired corporate clichés. **Specifically, DO NOT use phrases like \"hope this finds you well,\" \"per my last email,\" \"circle back,\" or similar empty pleasantries**, unless the user's input explicitly demands them for a specific effect.\n3.  **Intent-Driven:** Focus squarely on achieving the user's specified goal: \`${intent}\`.\n4.  **Tone & Context Adherence:** Strictly follow the requested \`tone\` (\`${tone}\`) and adapt the message's structure (greetings, sign-offs, length, formality) to the specified \`context\` (\`${context}\`). **For Emails, get straight to the point; avoid generic opening fluff.**${toneSpecificGuidance}${lengthGuidance}

**Output Requirements:**\n-   **Message Only:** Output *only* the final generated message.\n-   **No Chatter:** Do *not* include introductions (e.g., \"Here's the draft:\"), explanations, or apologies.`;

        const userPrompt = `Based on the user's goal ("${intent}") and their raw input below, craft a **complete and contextually suitable** message, adhering to the requested output length.

Tone: ${tone}
Context: ${context}
Output Format: ${outputFormat}
Desired Length: ${outputLength}

User Input:
"""
${message}
"""

Generated Message:`; // Ensure prompt clearly asks for the message

        try {
            const completion = await openaiClient.chat.completions.create({
                model: 'gpt-4o', // Or your preferred model
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt },
                ],
                max_tokens: 1000, // Adjust as needed for expected output length
                temperature: 0.7, // Standard temperature for creative generation
                // stop: null // Default stop sequences are usually fine
            });

            const generatedMessage = completion.choices[0]?.message?.content?.trim();

            if (!generatedMessage) {
                console.error('OpenAI completion returned empty content.');
                throw new Error('Failed to generate message content.');
            }

            console.log('Message generation successful.');
            return generatedMessage;

        } catch (error) {
            console.error('Error during OpenAI message generation:', error);
            throw new Error('Failed to generate message due to an internal error.'); // Re-throw for main handler
        }
    }
    // --- End Refactored Section ---

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
        let userId: string | null = null;

        if (authHeader && authHeader.startsWith('Bearer ')) {
          const token = authHeader.replace('Bearer ', '');
          try {
            const { data, error: userError } = await supabaseAdmin.auth.getUser(token);
            if (!userError && data?.user) {
              userId = data.user.id;
              console.log('Request authenticated for user:', userId);
            } else {
               console.warn('JWT provided but invalid or user not found:', userError?.message || 'No user data');
            }
          } catch (getUserError) {
              console.error('Error during getUser verification:', getUserError);
          }
        } else {
          console.log('No Authorization header found, proceeding as anonymous.');
        }

        // 3. Parse and Validate Request Body
        const { userInput, context, outputFormat, outputLength = 'medium' } = await req.json();

        // Validate required fields
        if (!userInput || !context || !outputFormat) {
            return new Response(JSON.stringify({ error: 'Missing required fields: userInput, context, outputFormat' }), {
                status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }
        if ([userInput, context, outputFormat].some(val => typeof val !== 'string')) {
             return new Response(JSON.stringify({ error: 'Invalid input types: userInput, context, and outputFormat must be strings' }), {
                status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }
        if (!VALID_CONTEXTS.includes(context)) {
             return new Response(JSON.stringify({ error: `Invalid context: ${context}. Must be one of: ${VALID_CONTEXTS.join(', ')}` }), {
                status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }
         if (!VALID_OUTPUT_FORMATS.includes(outputFormat)) {
             return new Response(JSON.stringify({ error: `Invalid outputFormat: ${outputFormat}. Must be one of: ${VALID_OUTPUT_FORMATS.join(', ')}` }), {
                status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }
        if (userInput.length > MAX_INPUT_LENGTH) {
             return new Response(JSON.stringify({ error: `Input text exceeds maximum length of ${MAX_INPUT_LENGTH} characters.` }), {
                status: 413, headers: { ...corsHeaders, 'Content-Type': 'application/json' } // 413 Payload Too Large
            });
        }
        // Validate outputLength
        if (!['short', 'medium', 'long'].includes(outputLength)) {
            return new Response(JSON.stringify({ error: `Invalid outputLength: ${outputLength}. Must be one of: short, medium, long` }), {
                status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }
        console.log(`Processing request: Context=${context}, Format=${outputFormat}, Length=${outputLength}, InputLength=${userInput.length}, User=${userId ?? 'anonymous'}`);

        // --- New Step: Parse User Input ---
        const { intent, tone, message } = await parseUserInput(userInput);
        // Now 'tone' is guaranteed to be a valid ID from the registry or the default

        // 4. Check User Subscription Status & Rate Limit (ONLY if user is logged in)
        let usageUpdate = {};

        if (userId) {
            console.log(`Checking status/limit for logged-in user ${userId}...`);
            try {
                const { data: profileData, error: profileError } = await supabaseAdmin
                    .from('profiles')
                    .select('subscription_status, last_suggestion_at, suggestion_count_today')
                    .eq('id', userId)
                    .single();

                if (profileError && profileError.code !== 'PGRST116') { // Ignore 'No rows found' error
                    throw profileError; // Throw other DB errors
                }

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
                            return new Response(JSON.stringify({ error: `Daily generation limit (${FREE_SUGGESTION_LIMIT_PER_DAY}) reached for free users. Please upgrade for unlimited access.` }), {
                                status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                            });
                        } else {
                            console.log(`User ${userId} is under the limit. Proceeding.`);
                            usageUpdate = { last_suggestion_at: now.toISOString(), suggestion_count_today: isSameDay ? count + 1 : 1 };
                        }
                    } else {
                       console.log(`User ${userId} is premium. Bypassing limit.`);
                    }
                } else {
                     console.warn(`No profile found for logged-in user ${userId}. Proceeding without limit checks.`);
                     // If profile MUST exist for logged-in users, could return an error here.
                     // For now, allow generation but don't track usage.
                }
            } catch (profileLookupError) {
                console.error(`Error checking profile/limit for user ${userId}:`, profileLookupError.message);
                // Proceed, but don't track usage. Consider if this should be a hard failure.
            }
        } else {
           console.log('Anonymous user. Skipping profile/limit checks.');
        }

        // 5. Generate Message using the refactored function
        const generatedMessageText = await generateMessage(
            openai, // Pass the initialized client
            intent,
            tone, // Pass the validated tone ID
            message,
            context,
            outputFormat,
            outputLength // Pass validated outputLength
        );

        // 6. Update Usage Count (if needed)
        if (userId && Object.keys(usageUpdate).length > 0) {
            console.log(`Updating usage for user ${userId}:`, usageUpdate);
            const { error: updateError } = await supabaseAdmin
                .from('profiles')
                .update(usageUpdate)
                .eq('id', userId);

            if (updateError) {
                // Log the error but don't fail the request - the user already got the message
                console.error(`Failed to update usage count for user ${userId}:`, updateError);
            }
        }

        // 7. Return Successful Response
        return new Response(JSON.stringify({ generatedMessage: generatedMessageText }), {
            status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      } catch (error) {
        // Generic Error Handling
        console.error('Error processing request:', error);
        // Provide a user-friendly error message
        const errorMessage = (error instanceof Error && error.message.startsWith('Invalid')) || (error instanceof Error && error.message.startsWith('Input text exceeds'))
            ? error.message // Use specific validation error messages
            : 'An unexpected error occurred while generating the message.';

        const errorStatus = (error instanceof Error && error.message.startsWith('Input text exceeds')) ? 413 : 500; // Specific status for payload size

        return new Response(JSON.stringify({ error: errorMessage }), {
            status: errorStatus, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
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

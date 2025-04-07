import { useState } from 'react';
import { supabase } from './lib/supabaseClient'; // Import supabase client
// import { Session, RealtimeChannel } from '@supabase/supabase-js'; // Removed unused type imports
// import PremiumSubscription from './components/PremiumSubscription'; // Import the component - TS6133 unused
// import UserPreferences from './components/UserPreferences'; // Import preferences component - TS6133 unused
import ReactMarkdown from 'react-markdown'; // Import react-markdown
// Import our minimized App.css with only essential styles
import './App.css';

// Vite exposes env variables prefixed with VITE_
// const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'; // Kept for reference if needed

// --- Auth Component --- (Refined Tailwind Styles)
// interface AuthProps { // TS6196 unused interface
//   onClose: () => void;
// }
// const Auth: React.FC<AuthProps> = ({ onClose }) => { // TS6133 unused component
// ... commented out Auth component logic ...
// }; // End of commented out Auth component

// Main App Component
function App() {
  // --- State Variables ---
  // const [session, setSession] = useState<Session | null>(null); // Commented out - Not used yet
  // const [profile, setProfile] = useState<any | null>(null); // Commented out - Not used yet
  // const [loadingProfile, setLoadingProfile] = useState(true); // Commented out - Not used yet
  // const [text] = useState<string>(''); // Old - REMOVED setText
  // const [tone] = useState<string>('professional'); // Old - REMOVED setTone
  // const [context] = useState<string>('Email'); // Old - REMOVED setContext

  const [outputFormat, setOutputFormat] = useState<string>('Raw Text'); // Default output format
  const [generatedMessage, setGeneratedMessage] = useState<string | null>(null); // Stores the single generated message
  const [isGenerating, setIsGenerating] = useState<boolean>(false); // Renamed from isSuggesting
  const [generationError, setGenerationError] = useState<string | null>(null); // Renamed from suggestionError
  const [copySuccess, setCopySuccess] = useState<boolean>(false); // State for copy feedback
  const [userInput, setUserInput] = useState<string>(''); // User's primary input

  // Define tone options mirroring the structure in the backend for consistency
  const toneOptions = [
    // Professional Tones (Hierarchical)
    { id: "Professional - C-Suite", label: "Professional - C-Suite" },
    { id: "Professional - Director", label: "Professional - Director" },
    { id: "Professional - Boss", label: "Professional - Boss" },
    { id: "Professional - Peer Group", label: "Professional - Peer Group" },
    { id: "Professional - Subordinates", label: "Professional - Subordinates" },
    { id: "Professional - Interns", label: "Professional - Interns" },
    // Other Tones (Alphabetical - consider sorting if needed, or keep manual for specific order)
    { id: "Casual", label: "Casual" },
    { id: "Confident", label: "Confident" },
    { id: "Direct", label: "Direct" },
    { id: "Empathetic", label: "Empathetic" },
    { id: "Enthusiastic", label: "Enthusiastic" },
    { id: "Formal", label: "Formal" },
    { id: "Friendly", label: "Friendly" },
    { id: "Humorous", label: "Humorous" },
    { id: "Informative", label: "Informative" },
    { id: "Inquisitive", label: "Inquisitive" },
    { id: "Motivational", label: "Motivational" },
    { id: "Neutral", label: "Neutral" },
    { id: "Persuasive", label: "Persuasive" },
    { id: "Respectful", label: "Respectful" },
    { id: "Supportive", label: "Supportive" },
    { id: "Urgent", label: "Urgent" },
  ];

  // Frontend constant for input length validation/display
  const MAX_INPUT_LENGTH = 8192;

  const contextOptions = [
    'Documentation',
    'Email',
    'General Text',
    'GitHub Comment',
    'LinkedIn Post',
    'Teams Chat',
    'Text Message',
  ].sort();

  const [selectedTone, setSelectedTone] = useState<string>(toneOptions[2].id); // Default to 'Professional - Boss'
  const [selectedContext, setSelectedContext] = useState<string>(contextOptions[1]); // Default to Email

  // --- API Call Handler ---
  const handleGenerateMessage = async () => {
    // Allow generation even if not logged in, function handles limits/errors
    if (!userInput.trim()) {
      alert("Please enter some text to generate a message.");
      return;
    }

    console.log(`Invoking tone-suggest function for: Tone=${selectedTone}, Context=${selectedContext}, Format=${outputFormat}`);
    setIsGenerating(true); // Renamed
    setGenerationError(null); // Renamed
    setGeneratedMessage(null); // Clear previous message
    setCopySuccess(false); // Reset copy feedback

    try {
      // Call the Supabase Edge Function with updated parameters
      const { data, error: invokeError } = await supabase.functions.invoke('tone-suggest', {
        // Body now contains userInput, context, and outputFormat
        // The function will parse intent/tone from userInput internally.
        // No need to JSON.stringify() the body for invoke v2+
        body: { userInput, selectedContext, outputFormat }, // Map `userInput` state to `userInput`, remove `selectedTone`
      });

      if (invokeError) {
        // Handle Supabase function invocation errors (network, permissions etc.)
        console.error("Supabase function invocation error:", invokeError);
        throw new Error(invokeError.message || 'Failed to connect to the generation service.');
      }

      // Check if the function returned a specific error payload (e.g., rate limit)
      if (data && data.error) {
         console.error("Function returned error:", data.error);
        throw new Error(data.error);
      }

      // Expecting { generatedMessage: "..." } on success
      if (data && typeof data.generatedMessage === 'string') {
        setGeneratedMessage(data.generatedMessage);
        console.log('Message generated successfully.');
      } else {
        console.error('Unexpected data format from function:', data);
        throw new Error('Received an unexpected response from the server.');
      }

    } catch (err) {
      console.error("Error during message generation:", err);
      const message = err instanceof Error ? err.message : 'Failed to generate message.';
      setGenerationError(`Error: ${message}`);
      setGeneratedMessage(null); // Ensure no message is displayed on error
    } finally {
      setIsGenerating(false); // Renamed
    }
  };

  // --- Copy to Clipboard Function ---
  const handleCopyToClipboard = async () => {
    if (!generatedMessage) return;
    try {
      await navigator.clipboard.writeText(generatedMessage);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 3000);
      console.log('Message copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy text: ', err);
      alert('Failed to copy message to clipboard.');
    }
  };

  // --- Commented out Profile Fetching and Auth Logic ---
  /*
  // Function to fetch user profile
  const fetchProfile = async (userId: string) => {
    // setLoadingProfile(true);
    try {
      const { data, error, status } = await supabase
        .from('profiles')
        .select(`subscription_status, name`)
        .eq('id', userId)
        .single();

      if (error && status !== 406) {
        throw error;
      }

      if (data) {
        // setProfile(data);
        console.log('User profile loaded:', data);
      } else {
         console.log('No profile found for user.');
         // setProfile({ subscription_status: 'free' }); // Assume free
      }
    } catch (error) {
      alert(`Error loading profile: ${(error as Error).message}`);
      // setProfile(null);
    } finally {
      // setLoadingProfile(false);
    }
  };

  useEffect(() => {
    let profileSubscription: RealtimeChannel | null = null;

    // Auth Listener
    supabase.auth.getSession().then(({ data: { session } }) => {
      // setSession(session);
      if (session?.user?.id) {
        // fetchProfile(session.user.id);
      } else {
        // setLoadingProfile(false);
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      // setSession(session);
      if (session?.user?.id) {
        // fetchProfile(session.user.id);

        // Subscribe to Profile Changes (Realtime)
        if (!profileSubscription) { // Avoid duplicate subscriptions
            profileSubscription = supabase
              .channel(`public:profiles:id=eq.${session.user.id}`)
              .on<any>( // Use <any> or define a proper type for the payload
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${session.user.id}` },
                (payload) => {
                  console.log('Profile updated via webhook! Reloading profile:', payload.new);
                  // setProfile(payload.new);
                }
              )
              .subscribe((status, err) => {
                  if (status === 'SUBSCRIBED') {
                    console.log('Subscribed to profile changes for user:', session.user.id);
                  } else {
                    console.error('Realtime subscription error:', status, err);
                  }
              });
             console.log('Attempted profile subscription setup.');
        }
      } else {
        // setProfile(null);
        // setLoadingProfile(false);
        // Unsubscribe if channel exists
        if (profileSubscription) {
          supabase.removeChannel(profileSubscription)
            .then(() => console.log('Unsubscribed from profile changes.'))
            .catch(err => console.error('Error unsubscribing:', err));
          profileSubscription = null;
        }
      }
      console.log('Auth state changed, session:', session ? 'Yes' : 'No');
    });

    // Close auth modal if user logs in/out
    // if (session) // setShowAuth(false);

    // Cleanup Listeners
    return () => {
      authListener?.subscription.unsubscribe();
      if (profileSubscription) {
        supabase.removeChannel(profileSubscription);
      }
    };
  }, []);

  // Determine if the user is premium based on profile status
  // const isPremium = profile?.subscription_status === 'premium' || profile?.subscription_status === 'active';
  */
  // --- End Commented out Section ---

  // --- Refined Tailwind JSX --- //
  return (
    // Main container with light gray background
    <div className="min-h-screen bg-gray-100 font-sans text-gray-800 dark:bg-gray-900 dark:text-gray-200">

      {/* Header */}
      <header className="w-full py-8 text-center">
        {/* App Title - Using Deep Blue */}
        <h1 className="text-4xl font-bold text-deep-blue dark:text-teal-aqua">
          ToneSmith
        </h1>
        {/* Tagline */}
        <p className="mt-1 text-lg text-gray-600 dark:text-gray-400">
          Polished Messages. Perfect Tone. Instantly.
        </p>
      </header>

      {/* Main content wrapper - Wider, Flex layout for sidebar */}
      <div className="mx-auto w-full max-w-6xl px-4 pb-24 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:space-x-8">

          {/* Main content area - Takes up 3/4 width on medium+ screens */}
          <main className="w-full md:w-3/4">
            {/* Vertical stack for all content blocks */}
            <div className="space-y-10"> {/* Increased spacing between major blocks */}

              {/* Section 1: Enter Your Message */}
              <section>
                <label htmlFor="user-input" className="mb-2 block text-lg font-semibold text-gray-700 dark:text-gray-300">
                  1. Enter Your Message
                </label>
                <textarea
                  id="user-input"
                  rows={8}
                  className="w-full rounded-lg border border-gray-300 p-4 text-base shadow-sm transition duration-200 ease-in-out placeholder:italic placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-aqua dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:ring-teal-aqua"
                  placeholder="Write your unfiltered thoughts or rough draft here..."
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  maxLength={MAX_INPUT_LENGTH} // Enforce max length
                />
                {/* Character Count Indicator */}
                <p className="mt-1 text-right text-sm text-gray-500 dark:text-gray-400">
                  Characters: {userInput.length} / {MAX_INPUT_LENGTH}
                </p>
              </section>

              {/* Section 2: Choose Tone & Context */}
              <section>
                <h3 className="mb-3 text-lg font-semibold text-gray-700 dark:text-gray-300">
                  2. Choose Tone & Context
                </h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  {/* Tone Dropdown */}
                  <div>
                    <div className="relative mb-1 flex items-center space-x-1">
                      <label htmlFor="tone-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Tone
                      </label>
                      <div className="group relative">
                        <span className="cursor-help text-xs text-gray-400 dark:text-gray-500">ⓘ</span>
                        <div className="absolute bottom-full left-1/2 z-10 mb-2 hidden w-48 -translate-x-1/2 transform rounded-md bg-gray-800 p-2 text-center text-xs text-white shadow-lg group-hover:block dark:bg-gray-200 dark:text-gray-800">
                          Choose the emotional style or formality (e.g., Professional, Casual).
                        </div>
                      </div>
                    </div>
                    <select
                      id="tone-select"
                      value={selectedTone}
                      onChange={(e) => setSelectedTone(e.target.value)}
                      className="w-full cursor-pointer appearance-none rounded-lg border border-gray-300 p-2.5 text-base shadow-sm transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-teal-aqua dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:focus:ring-teal-aqua"
                    >
                      {toneOptions.map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  {/* Context Dropdown */}
                  <div>
                    <div className="relative mb-1 flex items-center space-x-1">
                      <label htmlFor="context-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Context
                      </label>
                      <div className="group relative">
                        <span className="cursor-help text-xs text-gray-400 dark:text-gray-500">ⓘ</span>
                        <div className="absolute bottom-full left-1/2 z-10 mb-2 hidden w-48 -translate-x-1/2 transform rounded-md bg-gray-800 p-2 text-center text-xs text-white shadow-lg group-hover:block dark:bg-gray-200 dark:text-gray-800">
                          Select where you'll use the message (e.g., Email, LinkedIn).
                        </div>
                      </div>
                    </div>
                    <select
                      id="context-select"
                      value={selectedContext}
                      onChange={(e) => setSelectedContext(e.target.value)}
                      className="w-full cursor-pointer appearance-none rounded-lg border border-gray-300 p-2.5 text-base shadow-sm transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-teal-aqua dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:focus:ring-teal-aqua"
                    >
                      {contextOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                  {/* Output Format Dropdown */}
                  <div>
                    <div className="relative mb-1 flex items-center space-x-1">
                      <label htmlFor="format-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Output Format
                      </label>
                      <div className="group relative">
                        <span className="cursor-help text-xs text-gray-400 dark:text-gray-500">ⓘ</span>
                        <div className="absolute bottom-full left-1/2 z-10 mb-2 hidden w-48 -translate-x-1/2 transform rounded-md bg-gray-800 p-2 text-center text-xs text-white shadow-lg group-hover:block dark:bg-gray-200 dark:text-gray-800">
                          Choose plain text or Markdown formatting.
                        </div>
                      </div>
                    </div>
                    <select
                      id="format-select"
                      value={outputFormat}
                      onChange={(e) => setOutputFormat(e.target.value)}
                      className="w-full cursor-pointer appearance-none rounded-lg border border-gray-300 p-2.5 text-base shadow-sm transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-teal-aqua dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:focus:ring-teal-aqua"
                    >
                      <option>Raw Text</option>
                      <option>Markdown</option>
                    </select>
                  </div>
                </div>
              </section>

              {/* Generate Message Button */}
              <div className="text-center">
                <button
                  onClick={handleGenerateMessage}
                  disabled={isGenerating}
                  className="inline-flex transform items-center justify-center rounded-lg bg-teal-aqua px-6 py-3 text-base font-semibold text-white shadow-md transition duration-200 ease-in-out hover:scale-105 hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-teal-aqua focus:ring-offset-2 active:scale-95 active:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50 dark:focus:ring-offset-gray-900"
                >
                  {isGenerating ? (
                    <>
                      <svg className="-ml-1 mr-3 h-5 w-5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Generating...
                    </>
                  ) : (
                    'Generate Message'
                  )}
                </button>
              </div>

              {/* Section 3: Generated Message (Conditional) */}
              {(generatedMessage || generationError) && (
                <section className="transition-opacity duration-300 ease-in-out">
                  <h3 className="mb-4 text-xl font-semibold text-gray-700 dark:text-gray-300">
                    3. Generated Message
                  </h3>
                  <div className="relative rounded-lg border border-gray-200 bg-gray-50 p-6 shadow-sm dark:border-gray-600 dark:bg-gray-700">
                    {generationError && (
                      <div className="mb-4 rounded-md border border-red-300 bg-red-50 p-3 dark:border-red-600 dark:bg-red-900">
                        <p className="text-sm font-medium text-red-700 dark:text-red-200">
                          {generationError}
                        </p>
                      </div>
                    )}

                    {generatedMessage && (
                      <div className="min-h-[100px] pr-16">
                        {outputFormat === 'Markdown' ? (
                          <div className="prose prose-gray max-w-none dark:prose-invert leading-relaxed">
                            <ReactMarkdown>{generatedMessage}</ReactMarkdown>
                          </div>
                        ) : (
                          <pre className="whitespace-pre-wrap font-sans text-base leading-relaxed text-gray-800 dark:text-gray-100">{generatedMessage}</pre>
                        )}
                      </div>
                    )}

                    {generatedMessage && (
                      <div className="absolute top-4 right-4">
                        <button
                          onClick={handleCopyToClipboard}
                          title="Copy to Clipboard"
                          className={`inline-flex transform items-center rounded-md border px-3 py-1.5 text-sm font-medium shadow-sm transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-teal-aqua focus:ring-offset-1 active:scale-95 dark:focus:ring-offset-gray-800 ${
                            copySuccess
                              ? 'border-transparent bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-700 dark:text-white dark:hover:bg-green-600'
                              : 'border-gray-300 bg-gray-100 text-gray-700 hover:scale-105 hover:bg-gray-200 active:bg-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 dark:active:bg-gray-500'
                          }`}
                        >
                          {copySuccess ? (
                            <>
                              <svg className="-ml-0.5 mr-1.5 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                              </svg>
                              Copied
                            </>
                          ) : (
                            <>
                              <svg className="-ml-0.5 mr-1.5 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75" />
                              </svg>
                              Copy
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </section>
              )}

            </div>
          </main>

          {/* Right Sidebar Ad Column - Takes up 1/4 width on medium+ screens */}
          <aside className="mt-10 w-full md:mt-0 md:w-1/4">
            <div className="sticky top-8 space-y-6"> {/* Makes the ad stick on scroll within its column */} 
              <div className="rounded-lg border border-dashed border-gray-300 bg-gray-200 p-6 text-center text-sm text-gray-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400">
                Ad Placeholder
                <br />
                (Right Column)
                <br />
                (approx 25% width)
              </div>
              {/* Can add more sticky elements here if needed */}
            </div>
          </aside>

        </div> {/* End Flex container */}
      </div> {/* End Main content wrapper */}


      {/* Bottom Fixed Ad Bar */}
      <div className="fixed bottom-0 left-0 z-40 w-full border-t border-gray-300 bg-gray-200 p-3 text-center text-sm text-gray-600 shadow-lg dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
        Persistent Ad Banner Placeholder
      </div>

    </div>
  );
}

export default App;

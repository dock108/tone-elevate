import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabaseClient'; // Import supabase client
import { Session, RealtimeChannel } from '@supabase/supabase-js';
import PremiumSubscription from './components/PremiumSubscription'; // Import the component
import UserPreferences from './components/UserPreferences'; // Import preferences component
import ReactMarkdown from 'react-markdown'; // Import react-markdown
// Import our minimized App.css with only essential styles
import './App.css';

// Vite exposes env variables prefixed with VITE_
// const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'; // Kept for reference if needed

// --- Auth Component --- (Refined Tailwind Styles)
interface AuthProps {
  onClose: () => void;
}
const Auth: React.FC<AuthProps> = ({ onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert(`Login Error: ${error.message}`);
    if (!error) onClose();
    setLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) alert(`Sign Up Error: ${error.message}`);
    else alert('Signup successful! Please check your email to verify.');
    // Don't auto-close on signup success, user needs to verify email
    setLoading(false);
  };

  return (
    // Modal Backdrop
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-75 p-4 transition-opacity duration-300 ease-in-out">
      {/* Modal Content */}
      <div className="relative w-full max-w-md transform rounded-xl bg-white p-6 shadow-2xl transition-all duration-300 ease-in-out dark:bg-gray-800 sm:p-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 rounded-full p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
          aria-label="Close modal"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>

        <h2 className="mb-6 text-center text-2xl font-semibold text-gray-900 dark:text-gray-100">
          Login or Sign Up
        </h2>
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-base shadow-sm transition focus:border-deep-blue focus:outline-none focus:ring-1 focus:ring-deep-blue dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:focus:border-teal-aqua dark:focus:ring-teal-aqua"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-base shadow-sm transition focus:border-deep-blue focus:outline-none focus:ring-1 focus:ring-deep-blue dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:focus:border-teal-aqua dark:focus:ring-teal-aqua"
            />
          </div>
          <div className="flex flex-col space-y-3 pt-4 sm:flex-row sm:space-y-0 sm:space-x-4">
            <button
              type="submit"
              disabled={loading}
              onClick={handleLogin}
              className="flex-1 transform rounded-lg bg-deep-blue px-5 py-2.5 text-sm font-semibold text-white shadow-md transition duration-150 ease-in-out hover:scale-105 hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-deep-blue focus:ring-offset-2 active:scale-95 disabled:opacity-60 dark:focus:ring-offset-gray-800"
            >
              {loading ? 'Processing...' : 'Login'}
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={handleSignup}
              className="flex-1 transform rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 shadow-md transition duration-150 ease-in-out hover:scale-105 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-deep-blue focus:ring-offset-2 active:scale-95 disabled:opacity-60 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 dark:focus:ring-offset-gray-800"
            >
              {loading ? 'Processing...' : 'Sign Up'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Main App Component
function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<any | null>(null); // State for user profile
  const [loadingProfile, setLoadingProfile] = useState(true); // Loading state for profile
  const [showAuth, setShowAuth] = useState(false); // State to toggle Auth modal
  const [text, setText] = useState<string>('');
  const [tone, setTone] = useState<string>('professional'); // Example tone
  // --- New State Variables ---
  const [context, setContext] = useState<string>('Email'); // Default context
  const [outputFormat, setOutputFormat] = useState<string>('Raw Text'); // Default output format
  // --- Renamed State Variables ---
  const [generatedMessage, setGeneratedMessage] = useState<string | null>(null); // Stores the single generated message
  const [isGenerating, setIsGenerating] = useState<boolean>(false); // Renamed from isSuggesting
  const [generationError, setGenerationError] = useState<string | null>(null); // Renamed from suggestionError
  const [copySuccess, setCopySuccess] = useState<boolean>(false); // State for copy feedback

  // --- Renamed and Updated API Call Handler ---
  const handleGenerateMessage = async () => {
    // Allow generation even if not logged in, function handles limits/errors
    if (!text.trim()) {
      alert("Please enter some text to generate a message.");
      return;
    }

    console.log(`Invoking tone-suggest function for: Tone=${tone}, Context=${context}, Format=${outputFormat}`);
    setIsGenerating(true); // Renamed
    setGenerationError(null); // Renamed
    setGeneratedMessage(null); // Clear previous message
    setCopySuccess(false); // Reset copy feedback

    try {
      // Call the Supabase Edge Function with updated parameters
      const { data, error: invokeError } = await supabase.functions.invoke('tone-suggest', {
        // Body now contains text, tone, context, and outputFormat
        // No need to JSON.stringify() the body for invoke v2+
        body: { text, tone, context, outputFormat },
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
      setTimeout(() => setCopySuccess(false), 2000); // Hide message after 2s
      console.log('Message copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy text: ', err);
      alert('Failed to copy message to clipboard.');
    }
  };

  // Function to fetch user profile
  const fetchProfile = async (userId: string) => {
    setLoadingProfile(true);
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
        setProfile(data);
        console.log('User profile loaded:', data);
      } else {
         console.log('No profile found for user.');
         setProfile({ subscription_status: 'free' }); // Assume free
      }
    } catch (error) {
      alert(`Error loading profile: ${(error as Error).message}`);
      setProfile(null);
    } finally {
      setLoadingProfile(false);
    }
  };

  useEffect(() => {
    let profileSubscription: RealtimeChannel | null = null;

    // Auth Listener
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user?.id) {
        fetchProfile(session.user.id);
      } else {
        setLoadingProfile(false);
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user?.id) {
        fetchProfile(session.user.id);

        // Subscribe to Profile Changes (Realtime)
        if (!profileSubscription) { // Avoid duplicate subscriptions
            profileSubscription = supabase
              .channel(`public:profiles:id=eq.${session.user.id}`)
              .on<any>( // Use <any> or define a proper type for the payload
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${session.user.id}` },
                (payload) => {
                  console.log('Profile updated via webhook! Reloading profile:', payload.new);
                  setProfile(payload.new);
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
        setProfile(null);
        setLoadingProfile(false);
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
    if (session) setShowAuth(false);

    // Cleanup Listeners
    return () => {
      authListener?.subscription.unsubscribe();
      if (profileSubscription) {
        supabase.removeChannel(profileSubscription);
      }
    };
  }, []);

  // Helper to check subscription status
  const isPremium = profile?.subscription_status === 'premium' || profile?.subscription_status === 'active';

  // --- Refined Tailwind JSX --- //
  return (
    // Use Inter font if available, fallback to system sans-serif
    <div className="flex min-h-screen flex-col bg-gray-100 font-sans text-gray-900 dark:bg-gray-900 dark:text-gray-100">
      {/* --- Header --- */}
      <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/95 px-4 py-3 backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800/95 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          {/* Branding */}
          <div className="flex items-baseline space-x-4">
            <h1 className="text-3xl font-bold tracking-tight text-deep-blue dark:text-teal-aqua">
              ToneSmith
            </h1>
            <p className="hidden text-sm font-light text-gray-500 dark:text-gray-400 md:block">
              Polished Messages. Perfect Tone. Instantly.
            </p>
          </div>

          {/* Auth Controls */}
          <div className="flex items-center space-x-4">
            {loadingProfile ? (
              <div className="h-6 w-24 animate-pulse rounded-md bg-gray-200 dark:bg-gray-700"></div>
            ) : session ? (
              <div className="flex items-center space-x-4">
                <span className="hidden text-sm text-gray-700 dark:text-gray-300 lg:block">
                  {profile?.name || session.user.email}
                  <span className={`ml-2 inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${isPremium ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-100' : 'bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-100'}`}>
                    {isPremium ? 'Premium' : 'Free'}
                  </span>
                </span>
                <button
                  onClick={() => supabase.auth.signOut()}
                  className="transform rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition duration-150 ease-in-out hover:scale-105 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-deep-blue focus:ring-offset-2 active:scale-95 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 dark:focus:ring-offset-gray-800"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAuth(true)}
                className="transform rounded-lg bg-deep-blue px-4 py-2 text-sm font-semibold text-white shadow-md transition duration-150 ease-in-out hover:scale-105 hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-deep-blue focus:ring-offset-2 active:scale-95 dark:focus:ring-offset-gray-800"
              >
                Login / Sign Up
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Auth Modal */}
      {showAuth && <Auth onClose={() => setShowAuth(false)} />}

      {/* --- Main Content --- */}
      <main className="mx-auto w-full max-w-5xl flex-grow px-4 py-8 sm:px-6 lg:px-8">
        {/* Using Grid for main layout - can adjust columns for responsiveness */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Left Column: Input & Controls */}
          <div className="space-y-8">
            {/* --- Step 1: Input Area --- */}
            <div className="rounded-xl bg-white p-6 shadow-lg dark:bg-gray-800">
              <label htmlFor="input-text" className="mb-3 block text-xl font-semibold text-gray-800 dark:text-gray-100">
                <span className="mr-2 inline-block rounded-full bg-deep-blue px-2 py-0.5 text-sm text-white dark:bg-teal-aqua dark:text-gray-900">1</span>
                Enter Your Message
              </label>
              <textarea
                id="input-text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Write your unfiltered thoughts, notes, or draft message here..."
                rows={10} // Increased rows slightly
                disabled={isGenerating}
                className="w-full rounded-lg border border-gray-300 p-4 text-base leading-relaxed shadow-sm transition focus:border-deep-blue focus:outline-none focus:ring-1 focus:ring-deep-blue disabled:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400 dark:focus:border-teal-aqua dark:focus:ring-teal-aqua dark:disabled:bg-gray-700/50 dark:disabled:text-gray-500"
              />
            </div>

            {/* --- Step 2: Tone & Context Selection --- */}
            <div className="rounded-xl bg-white p-6 shadow-lg dark:bg-gray-800">
              <h3 className="mb-5 text-xl font-semibold text-gray-800 dark:text-gray-100">
                 <span className="mr-2 inline-block rounded-full bg-deep-blue px-2 py-0.5 text-sm text-white dark:bg-teal-aqua dark:text-gray-900">2</span>
                 Choose Tone & Context
              </h3>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                {/* Tone Select */}
                <div>
                  <label htmlFor="tone-select" className="mb-1.5 block text-sm font-medium text-gray-600 dark:text-gray-300">Tone</label>
                  <select
                    id="tone-select"
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                    disabled={isGenerating}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-base shadow-sm transition focus:border-deep-blue focus:outline-none focus:ring-1 focus:ring-deep-blue disabled:opacity-60 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:focus:border-teal-aqua dark:focus:ring-teal-aqua dark:disabled:bg-gray-700/50"
                  >
                    {/* Options */}
                    <option value="casual">Casual</option>
                    <option value="concise">Concise</option>
                    <option value="formal">Formal</option>
                    <option value="friendly">Friendly</option>
                    <option value="persuasive">Persuasive</option>
                    <option value="professional">Professional</option>
                  </select>
                </div>
                {/* Context Select */}
                <div>
                  <label htmlFor="context-select" className="mb-1.5 block text-sm font-medium text-gray-600 dark:text-gray-300">Context</label>
                  <select
                    id="context-select"
                    value={context}
                    onChange={(e) => setContext(e.target.value)}
                    disabled={isGenerating}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-base shadow-sm transition focus:border-deep-blue focus:outline-none focus:ring-1 focus:ring-deep-blue disabled:opacity-60 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:focus:border-teal-aqua dark:focus:ring-teal-aqua dark:disabled:bg-gray-700/50"
                  >
                    {/* Options */}
                    <option value="Documentation">Documentation</option>
                    <option value="Email">Email</option>
                    <option value="General Text">General Text</option>
                    <option value="GitHub Comment">GitHub Comment</option>
                    <option value="LinkedIn Post">LinkedIn Post</option>
                    <option value="Teams Chat">Teams Chat</option>
                    <option value="Text Message">Text Message</option>
                  </select>
                </div>
                {/* Output Format Select */}
                <div>
                  <label htmlFor="format-select" className="mb-1.5 block text-sm font-medium text-gray-600 dark:text-gray-300">Format</label>
                  <select
                    id="format-select"
                    value={outputFormat}
                    onChange={(e) => setOutputFormat(e.target.value)}
                    disabled={isGenerating}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-base shadow-sm transition focus:border-deep-blue focus:outline-none focus:ring-1 focus:ring-deep-blue disabled:opacity-60 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:focus:border-teal-aqua dark:focus:ring-teal-aqua dark:disabled:bg-gray-700/50"
                  >
                    {/* Options */}
                    <option value="Markdown">Markdown</option>
                    <option value="Raw Text">Raw Text</option>
                  </select>
                </div>
              </div>
            </div>

             {/* Generate Button - Spans across left column */}
             <div className="text-center">
                 <button
                    onClick={handleGenerateMessage}
                    disabled={isGenerating || !text.trim()}
                    className="inline-flex w-full transform items-center justify-center rounded-lg border border-transparent bg-teal-aqua px-8 py-3 text-base font-semibold text-white shadow-lg transition duration-150 ease-in-out hover:scale-[1.02] hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-teal-aqua focus:ring-offset-2 active:scale-95 disabled:opacity-60 sm:w-auto dark:bg-teal-aqua dark:focus:ring-offset-gray-800"
                 >
                  {isGenerating && (
                      <svg className="-ml-1 mr-3 h-5 w-5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                  )}
                  {isGenerating ? 'Generating...' : 'Generate Message'}
                 </button>
             </div>
          </div> {/* End Left Column */}

          {/* Right Column: Output */}
          <div className="space-y-8">
            {/* --- Step 3: Output Area --- */}
            <div className="sticky top-24 rounded-xl bg-white p-6 shadow-lg dark:bg-gray-800">
                <h3 className="mb-4 text-xl font-semibold text-gray-800 dark:text-gray-100">
                    <span className="mr-2 inline-block rounded-full bg-deep-blue px-2 py-0.5 text-sm text-white dark:bg-teal-aqua dark:text-gray-900">3</span>
                    Generated Message
                </h3>
                <div className="relative min-h-[300px] rounded-lg border border-gray-200 bg-gray-50 p-5 dark:border-gray-700 dark:bg-gray-900/50">
                  {/* Output Content */}
                  <div className="prose prose-base max-w-none dark:prose-invert prose-pre:whitespace-pre-wrap prose-pre:break-words prose-code:font-mono">
                    {isGenerating && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center rounded-lg bg-white/50 dark:bg-gray-800/50">
                          <svg className="h-10 w-10 animate-spin text-deep-blue dark:text-teal-aqua" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span className="mt-3 font-medium text-gray-600 dark:text-gray-300">Generating...</span>
                      </div>
                    )}
                    {generationError && !isGenerating && (
                      <div className="rounded-md border border-coral-accent/50 bg-coral-accent/10 p-4 text-center">
                        <p className="font-medium text-coral-accent dark:text-coral-accent/90">Error: {generationError}</p>
                      </div>
                    )}
                    {generatedMessage && !isGenerating && !generationError && (
                       <> {/* Fragment to hold message and copy button */}
                          {outputFormat === 'Markdown' ? (
                              <ReactMarkdown>{generatedMessage}</ReactMarkdown>
                          ) : (
                              <pre className="whitespace-pre-wrap break-words font-mono text-base leading-relaxed">
                                 {generatedMessage}
                              </pre>
                          )}
                       </>
                    )}
                    {!isGenerating && !generationError && !generatedMessage && (
                      <p className="text-center text-base text-gray-500 dark:text-gray-400">Your generated message will appear here.</p>
                    )}
                  </div> {/* End Prose div */}

                  {/* Copy Button - Positioned at bottom right of output area */}
                   {generatedMessage && !isGenerating && !generationError && (
                        <div className="absolute bottom-3 right-3 mt-4">
                          <button
                            onClick={handleCopyToClipboard}
                            className="inline-flex transform items-center rounded-lg bg-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 transition duration-150 ease-in-out hover:scale-105 hover:bg-gray-300 active:scale-95 disabled:opacity-50 dark:bg-gray-600 dark:text-gray-100 dark:ring-gray-500 dark:hover:bg-gray-500"
                          >
                             <svg className="-ml-0.5 mr-1.5 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m9.75 0h-3.25c-.621 0-1.125.504-1.125 1.125v16.5c0 .621.504 1.125 1.125 1.125h3.25c.621 0 1.125-.504 1.125-1.125v-16.5c0-.621-.504-1.125-1.125-1.125z" /></svg>
                             {copySuccess ? 'Copied!' : 'Copy'}
                          </button>
                        </div>
                    )}
                </div> {/* End Output Content Area div */}
            </div> {/* End Output Area Card div */}

             {/* --- Other Components Below Output (If Logged In) --- */}
             {session && !loadingProfile && (
               <div className="mt-10 space-y-8">
                 <div className="rounded-xl bg-white p-6 shadow-lg dark:bg-gray-800">
                   <PremiumSubscription userId={session.user.id} currentStatus={profile?.subscription_status} />
                 </div>
                 <div className="rounded-xl bg-white p-6 shadow-lg dark:bg-gray-800">
                   <UserPreferences userId={session.user.id} />
                 </div>
               </div>
             )}
          </div> {/* End Right Column */}
        </div> {/* End Grid */}
      </main> {/* End Main Content */}

       {/* --- Footer --- */}
       <footer className="mt-12 border-t border-gray-200 bg-gray-50 py-6 text-center dark:border-gray-700 dark:bg-gray-800">
          <p className="text-sm text-gray-600 dark:text-gray-400">
              &copy; {new Date().getFullYear()} ToneSmith. AI-Powered Communication Assistance.
          </p>
       </footer>
    </div> // End Outermost Div
  );
}

export default App;

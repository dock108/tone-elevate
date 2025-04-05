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
        // Body now contains userInput, context, and outputFormat
        // The function will parse intent/tone from userInput internally.
        // No need to JSON.stringify() the body for invoke v2+
        body: { userInput: text, context, outputFormat }, // Map `text` state to `userInput`, remove `tone`
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
    // Main container with light gray background
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 dark:bg-gray-900 dark:text-gray-200">
      
      {/* Header - Updated to include navigation */}
      <header className="w-full bg-white border-b border-gray-200 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          {/* Applying App Title style */}
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">ToneSmith</h1>
          {/* Basic Nav Links - Hidden on small screens */}
          <nav className="space-x-6 hidden sm:block">
            <a href="#" className="text-sm text-gray-600 hover:text-black dark:text-gray-300 dark:hover:text-white">About</a>
            <a href="#" className="text-sm text-gray-600 hover:text-black dark:text-gray-300 dark:hover:text-white">Upgrade</a>
            <a href="#" className="text-sm text-gray-600 hover:text-black dark:text-gray-300 dark:hover:text-white">History</a>
          </nav>
          {/* Placeholder for potential mobile menu button if needed later */}
          {/* <button className="sm:hidden">Menu</button> */}
        </div>
      </header>
      
      {/* Main content - Centered, max-w-2xl, with padding */}
      <main className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
        
        {/* Vertical stack for all content blocks */}
        <div className="space-y-8"> {/* Increased spacing between major blocks */}
          
          {/* Hero section - Applying App Title style */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
              Fine-tune your message
            </h2>
            {/* Ensure leading-relaxed on paragraph */}
            <p className="mx-auto mt-3 max-w-xl text-lg leading-relaxed text-gray-500 dark:text-gray-400">
              Transform your draft into a perfectly toned message for any context.
            </p>
          </div>
          
          {/* Input Form Card - Apply container styles: rounded-2xl, shadow-lg */}
          <div className="overflow-hidden rounded-2xl bg-white p-6 shadow-lg dark:bg-gray-800">
            {/* Use space-y for inner form elements */}
            <div className="space-y-6">
              
              {/* Text area */} 
              <div>
                {/* Applying new Label style */}
                <label htmlFor="message-input" className="block text-sm font-medium text-gray-700 mb-2 uppercase tracking-wide dark:text-gray-300">
                  Enter Your Message
                </label>
                <textarea
                  id="message-input" 
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Type or paste your draft message here..."
                  rows={7}
                  // Applying exact Textarea Styling from request
                  className="w-full p-4 rounded-xl border border-gray-300 shadow-sm focus:border-black focus:ring-black text-base leading-relaxed text-gray-800 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:focus:border-gray-400 dark:focus:ring-gray-400 dark:placeholder:text-gray-500"
                />
              </div>
              
              {/* Tone Selector */} 
              <div>
                {/* Applying new Label style */}
                <label htmlFor="tone-select" className="block text-sm font-medium text-gray-700 mb-2 uppercase tracking-wide dark:text-gray-300">
                  Select Tone
                </label>
                <select
                  id="tone-select"
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  // Applying exact Select Styling from request (keeping appearance-none)
                  className="w-full p-3 rounded-xl border border-gray-300 shadow-sm focus:border-black focus:ring-black text-base text-gray-800 appearance-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:focus:border-gray-400 dark:focus:ring-gray-400"
                  style={{ backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20"><path stroke="%236b7280" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 8l4 4 4-4"/></svg>')`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.7rem center', backgroundSize: '1.3em 1.3em' }}
                >
                  <option value="professional">Professional</option>
                  <option value="casual">Casual</option>
                  <option value="friendly">Friendly</option>
                  <option value="formal">Formal</option>
                  <option value="concise">Concise</option>
                  <option value="persuasive">Persuasive</option>
                  <option value="empathetic">Empathetic</option>
                </select>
              </div>
              
              {/* Advanced options (Context & Format) - Kept collapsible */}
              <details className="group rounded-lg bg-gray-50 p-4 dark:bg-gray-700/40">
                <summary className="cursor-pointer text-sm font-medium text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200">
                  <span className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="mr-1.5 h-4 w-4 transition-transform group-open:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                    Advanced Options
                  </span>
                </summary>
                
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {/* Context Selector */}
                  <div>
                    {/* Applying Section Label style */}
                    <label htmlFor="context-select" className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      Context
                    </label>
                    <select
                      id="context-select"
                      value={context}
                      onChange={(e) => setContext(e.target.value)}
                      // Applying Input Text style (text-sm, text-gray-800) for smaller selects
                      className="w-full appearance-none rounded-md border border-gray-300 bg-white py-2 px-3 pr-8 text-sm text-gray-800 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                      style={{ backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20"><path stroke="%236b7280" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 8l4 4 4-4"/></svg>')`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.7rem center', backgroundSize: '1.2em 1.2em' }}
                    >
                      <option value="Email">Email</option>
                      <option value="Slack Message">Slack Message</option>
                      <option value="Report">Report</option>
                      <option value="Presentation">Presentation</option>
                      <option value="General">General</option>
                    </select>
                  </div>
                  
                  {/* Output Format Selector */}
                  <div>
                    {/* Applying Section Label style */}
                    <label htmlFor="format-select" className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      Format
                    </label>
                    <select
                      id="format-select"
                      value={outputFormat}
                      onChange={(e) => setOutputFormat(e.target.value)}
                       // Applying Input Text style (text-sm, text-gray-800) for smaller selects
                      className="w-full appearance-none rounded-md border border-gray-300 bg-white py-2 px-3 pr-8 text-sm text-gray-800 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                      style={{ backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20"><path stroke="%236b7280" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 8l4 4 4-4"/></svg>')`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.7rem center', backgroundSize: '1.2em 1.2em' }}
                    >
                      <option value="Raw Text">Raw Text</option>
                      <option value="Markdown">Markdown</option>
                      <option value="JSON">JSON</option>
                    </select>
                  </div>
                </div>
              </details>
              
              {/* Generate Button - Applying new styles */}
              <div className="pt-2">
                <button
                  onClick={handleGenerateMessage}
                  disabled={isGenerating || !text.trim()}
                  // Applying exact Button Styling from request
                  className="w-full bg-black text-white py-3 px-5 rounded-xl text-sm font-medium hover:bg-gray-800 transition duration-150 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-200 dark:text-black dark:hover:bg-gray-300 dark:focus:ring-gray-400 dark:focus:ring-offset-gray-900"
                >
                  {isGenerating ? (
                    <span className="flex items-center justify-center">
                      <svg className="mr-2 h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Generating Message...
                    </span>
                  ) : (
                    'Generate Message'
                  )}
                </button>
              </div>
              
              {/* Error Message (Positioned inside form card) */} 
              {generationError && (
                <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-600 dark:bg-red-900/30 dark:text-red-300" role="alert">
                  <span className="font-medium">Error:</span> {generationError.replace('Error: ', '')}
                </div>
              )}
            </div>
          </div> {/* End Input Form Card */} 
          
          {/* Output Card - Apply container styles: rounded-xl, shadow-sm */}
          {/* Show card structure even when loading or empty */}
          {(generatedMessage || isGenerating || !generationError) && (
            <div className="overflow-hidden rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
              {/* Adding optional Label */}
              <p className="mb-3 text-sm font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">Your Polished Message</p>
              
              <div className="flex items-center justify-between mb-4"> {/* Adjusted margin for label */} 
                {/* Title moved below label, made smaller or removed if label is sufficient */}
                {/* <h3 className="text-sm font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">Generated Message</h3> */}
                
                {/* Copy Button */}
                {generatedMessage && !isGenerating && (
                  <button
                    onClick={handleCopyToClipboard}
                    title="Copy to Clipboard"
                    // Position adjusted slightly with the new label
                    className="ml-auto text-xs text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 transition duration-150 font-medium"
                  >
                    {copySuccess ? (
                      <span className="flex items-center text-green-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="mr-1 h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        Copied!
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="mr-1 h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        Copy
                      </span>
                    )}
                  </button>
                )}
              </div>
              
              {/* Output Content Area - Applying Output Text style, removing inner background */}
              <div className="min-h-[200px] rounded-lg p-5 text-base leading-relaxed text-gray-900 dark:text-gray-100"> {/* Removed bg-gray-50, adjusted padding slightly */}
                {isGenerating ? (
                  // Loading State
                  <div className="flex h-full min-h-[120px] items-center justify-center">
                    <div className="text-center">
                      <svg className="mx-auto h-8 w-8 animate-spin text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">Generating your message...</p>
                    </div>
                  </div>
                ) : generatedMessage ? (
                   // Display Generated Message
                   outputFormat === 'Markdown' ? (
                    <ReactMarkdown className="prose prose-sm prose-gray max-w-none dark:prose-invert leading-relaxed">{generatedMessage}</ReactMarkdown>
                  ) : (
                    <pre className="whitespace-pre-wrap font-sans leading-relaxed">{generatedMessage}</pre>
                  )
                ) : (
                   // Empty State (if not loading and no message)
                   <div className="flex h-full min-h-[120px] items-center justify-center">
                      <div className="text-center">
                        <svg className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                        </svg>
                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                          Your generated message will appear here.
                        </p>
                      </div>
                   </div>
                )}
              </div>
            </div>
          )} 

          {/* Ad Placeholder Block - Added below output */}
          <div className="rounded-xl border border-dashed border-gray-300 bg-gray-100 p-4 text-center text-sm text-gray-500 dark:border-gray-600 dark:bg-gray-700/50 dark:text-gray-400">
            Placeholder: This space will show a relevant sponsored message.
          </div>

          {/* Upgrade CTA Block - Added below ad */}
          <div className="mt-4 rounded-xl bg-black p-4 text-center text-white dark:bg-gray-700">
            <p className="text-sm"><span className="font-semibold">Need more features?</span> <a href="#" className="underline hover:text-gray-300 dark:hover:text-white">Upgrade to Pro</a> for enhanced tone options &amp; history.</p>
          </div>

        </div> {/* End Vertical Stack */} 
      </main>
      
      {/* Footer */}
      <footer className="mt-12 border-t border-gray-200 bg-white py-8 dark:border-gray-700 dark:bg-gray-800">
        {/* Footer content remains the same */} 
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="text-center md:flex md:items-center md:justify-between">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              © {new Date().getFullYear()} ToneSmith • AI-Powered Communication Assistance
            </p>
            <div className="mt-4 flex justify-center space-x-6 md:mt-0">
              <a href="#" className="text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300">Terms</a>
              <a href="#" className="text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300">Privacy</a>
              <a href="#" className="text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;

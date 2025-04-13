import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Helmet } from 'react-helmet-async'; // Import Helmet
import { supabase } from './lib/supabaseClient'; // Import supabase client
import { Session, User } from '@supabase/supabase-js'; // Import Session AND User types
// Import our minimized App.css with only essential styles
import './App.css';

// Import react-hot-toast
import toast, { Toaster } from 'react-hot-toast';

// Import components (non-lazy)
import Header from './components/Header';
import InputSection from './components/InputSection';
import ConfigSection from './components/ConfigSection';
import ActionSection from './components/ActionSection';
import OutputSection from './components/OutputSection';
import InfoCard from './components/InfoCard'; // Import the new info card

// Import Saved Prompts API helpers and types
import {
  fetchSavedPrompts,
  SavedPrompt
} from './lib/savedPromptsApi';

// Import Tone Templates data and component
import { toneTemplatesData, ToneTemplate } from './lib/toneTemplatesData';
import ToneTemplates from './components/ToneTemplates';
import MultiToneSelector from './components/MultiToneSelector'; // Import the new component
import ToneComparisonDisplay from './components/ToneComparisonDisplay'; // Import the comparison display
import ContentLengthSelector from './components/ContentLengthSelector'; // Import the new length selector

// Lazy load potentially heavy/unused components
// TODO: Premium features not ready yet
// const PremiumSubscription = lazy(() => import('./components/PremiumSubscription'));
// const UserPreferences = lazy(() => import('./components/UserPreferences'));
const SavedPromptsModal = lazy(() => import('./components/SavedPromptsModal')); // Placeholder for the modal
const AuthModal = lazy(() => import('./components/AuthModal')); // Import AuthModal

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
  const [session, setSession] = useState<Session | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_profile, _setProfile] = useState<any | null>(null); // Prefixed
  const [isPremium, setIsPremium] = useState<boolean>(false);
  const [isUpgrading, setIsUpgrading] = useState<boolean>(false); // Add missing state for upgrade button
  const [generatedMessage, setGeneratedMessage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [userInput, setUserInput] = useState<string>('');
  const [selectedTone, setSelectedTone] = useState<string>('');
  const [selectedContext, setSelectedContext] = useState<string>('');

  // State for Multi-Tone Comparison
  const [comparisonTones, setComparisonTones] = useState<string[]>([]); // IDs of tones selected for comparison
  const [comparisonResults, setComparisonResults] = useState<Record<string, string | null>>({}); // Object to store results keyed by tone ID
  const [isComparing, setIsComparing] = useState<boolean>(false); // Loading state for comparison generation

  // Saved Prompts State
  // Simplify - only keep what's needed
  const [savedPrompts, setSavedPrompts] = useState<SavedPrompt[]>([]);
  const [isLoadingPrompts, setIsLoadingPrompts] = useState<boolean>(false);
  const [showSavedPromptsModal, setShowSavedPromptsModal] = useState<boolean>(false); // State for Saved Prompts Modal
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false); // State for Auth Modal

  // Other UI State
  // TODO: Premium features not ready yet
  // const [showPremiumModal, setShowPremiumModal] = useState(false);
  // const [showPreferencesModal, setShowPreferencesModal] = useState(false);
  const [copyButtonText, setCopyButtonText] = useState('Copy');
  const [hasJustGenerated, setHasJustGenerated] = useState(false); // State to prevent duplicate submission

  // --- Refinement State ---
  const [refinementInput, setRefinementInput] = useState<string>("");
  const [refinementHistory, setRefinementHistory] = useState<{ request: string; response: string }[]>([]);
  const [isRefining, setIsRefining] = useState<boolean>(false);
  const [selectedComparisonForRefinement, setSelectedComparisonForRefinement] = useState<string | null>(null); // Track which comparison result is selected
  const [outputLength, setOutputLength] = useState<string>('Medium'); // Add state for output length

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

  // --- Constants ---
  // const MAX_COMPARISON_TONES = 3; // Remove this static constant

  // --- Derived State ---
  const isLoggedIn = !!session?.user;
  const maxComparisonTones = isPremium ? 5 : 3; // Define dynamic limit here

  // --- Effects ---
  // Set default tone and context once on mount
  useEffect(() => {
    const defaultTone = toneOptions.find(opt => opt.id === "Professional - Boss") || toneOptions[0];
    setSelectedTone(defaultTone.id);
    const defaultContext = contextOptions.includes('Email') ? 'Email' : contextOptions[0];
    setSelectedContext(defaultContext);
  }, []); // Empty dependency array ensures this runs only once

  // Fetch saved prompts when session changes (Simplified: Fetching moved to profile effect)
  useEffect(() => {
    // Removed prompt fetching logic from here - now handled in fetchUserProfile
    // If user logs out, prompt clearing is handled elsewhere (auth listener, logout handler)
  }, [session]); // Re-run when session changes

  // Auth listener (Removed premium check calls)
  useEffect(() => {
    // Fetch initial session state
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      setSession(initialSession);
      // REMOVED: await checkUserPremiumStatus(initialSession?.user?.id);
    });

    // Subscribe to auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      // REMOVED: await checkUserPremiumStatus(newSession?.user?.id);
      // Prompt fetching is now handled in the other useEffect based on session
      // Clearing state on logout is handled in fetchUserProfile and handleLogout
    });

    // Cleanup function to unsubscribe when the component unmounts
    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []); // Empty dependency array ensures this runs only on mount and unmount

  // Close Auth modal automatically on successful login/signup
  useEffect(() => {
    if (session) {
      setShowAuthModal(false);
    }
  }, [session]);

  // --- Derived state for input validation ---
  const isInputValid = userInput.trim().length > 0;
  // TODO: Comparison feature not fully implemented yet
  // const canCompare = session?.user && comparisonTones.length > 0 && isInputValid;

  // --- Event Handlers ---
  const handleUserInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setUserInput(event.target.value);
  };

  const handleClearInput = () => {
    setUserInput('');
    setGeneratedMessage(null); // Optionally clear generated message too
    setComparisonResults({}); // Clear comparison results
    setSelectedComparisonForRefinement(null); // Clear refinement selection
    setRefinementHistory([]); // Clear refinement history
    setRefinementInput(''); // Clear refinement input
  };

  const handleToneChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedTone(event.target.value);
  };

  const handleContextChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedContext(event.target.value);
  };

  // Handler for output length change
  const handleOutputLengthChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setOutputLength(event.target.value);
  };

  // --- Auth Handlers ---
  const handleOpenAuthModal = () => {
    setShowAuthModal(true);
  };

  const handleCloseAuthModal = () => {
    setShowAuthModal(false);
  };

  const handleLogout = async () => {
    try {
    const { error } = await supabase.auth.signOut();
    if (error) {
        if (error.message.includes('session missing')) {
          // Session is already gone, just clear local state
          setSession(null);
          toast.success('Logged out successfully.');
        } else {
      toast.error(`Logout failed: ${error.message}`);
        }
    } else {
      toast.success('Logged out successfully.');
      setSession(null); // Immediately clear session state
      }
    } catch (e) {
      console.error('Logout error:', e);
      // Force local logout even if API call failed
      setSession(null);
      toast.error('Forced logout - session may have already expired');
    }
  };

  // --- Upgrade Click Handler (Calls Edge Function) ---
  const handleUpgradeClick = async () => {
    setIsUpgrading(true);
    const toastId = toast.loading('Processing upgrade request...');
    try {
      // Ensure we have a session token to include
      const session = await supabase.auth.getSession();
      if (!session?.data?.session?.access_token) {
        throw new Error("Not authenticated. Please log in.");
      }

      // Invoke the Edge Function, sending just the access token
      // The Edge Function expects this and will handle the Bearer prefix
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        headers: {
          Authorization: `Bearer ${session.data.session.access_token}`,
        }
        // Body is not needed for this function
      });

      if (error) throw new Error(error.message || 'Function invocation failed');
      if (data.error) throw new Error(data.error); // Handle error returned from function logic
      if (!data.url) throw new Error("Checkout URL missing from response.");

      // Redirect user to Stripe Checkout page
      window.location.href = data.url;
      // Toast will be dismissed by navigation
    } catch (error: any) {
      console.error("Upgrade error:", error);
      toast.error(`Upgrade failed: ${error.message}`, { id: toastId });
    } finally {
      setIsUpgrading(false);
    }
  };

  // --- Saved Prompts Handlers ---
  // Simplified to just fetching prompts
  const handleFetchSavedPrompts = async (userId: string) => {
    setIsLoadingPrompts(true);
    try {
      const prompts = await fetchSavedPrompts(userId);
      setSavedPrompts(prompts);
    } catch (error) {
      toast.error('Failed to load saved prompts.');
      console.error("Error fetching saved prompts:", error);
    } finally {
    setIsLoadingPrompts(false);
    }
  };

  // Remove unused handlers
  const handleCloseSavedPromptsModal = () => {
    setShowSavedPromptsModal(false);
  };

  const handleLoadSavedPrompt = (prompt: SavedPrompt) => {
    setUserInput(prompt.prompt_text);
    setSelectedTone(prompt.tone_id);
    setSelectedContext(prompt.context);
    setGeneratedMessage(null); // Clear any previous generation
    setShowSavedPromptsModal(false); // Close modal after loading
    toast.success("Prompt loaded.");
  };

  // --- Tone Template Handler ---
  const handleSelectToneTemplate = (template: ToneTemplate) => {
    // Check if the template's tone and context exist in the options
    const isValidTone = toneOptions.some(opt => opt.id === template.tone_id);
    const isValidContext = contextOptions.includes(template.context);

    if (!isValidTone) {
        console.warn(`Template "${template.name}" has an invalid tone_id: ${template.tone_id}. Using default.`);
        toast.error(`Template tone "${template.tone_id}" is invalid. Please check template data.`);
        // Optionally set a default tone or leave as is
    }
     if (!isValidContext) {
        console.warn(`Template "${template.name}" has an invalid context: ${template.context}. Using default.`);
        toast.error(`Template context "${template.context}" is invalid. Please check template data.`);
        // Optionally set a default context or leave as is
    }

    // Update state with data from the selected template
    setUserInput(template.prompt_text);
    setSelectedTone(isValidTone ? template.tone_id : selectedTone); // Use template tone if valid, else keep current
    setSelectedContext(isValidContext ? template.context : selectedContext); // Use template context if valid, else keep current

    setGeneratedMessage(null); // Clear any previously generated message
    toast.success(`Template "${template.name}" loaded.`); // User feedback
  };

  // --- Multi-Tone Selection Handler ---
  const handleComparisonToneChange = (selectedIds: string[]) => {
    setComparisonTones(selectedIds);
    setSelectedComparisonForRefinement(null); // Clear selection if comparison tones change
  };

  // --- API Call Handler (Updated for Multi-Tone) ---
  const handleGenerateOrCompare = async () => {
    if (!isInputValid || isGenerating || isComparing) return;
    setSelectedComparisonForRefinement(null); // Reset refinement selection on new generation
    setRefinementHistory([]); // Reset history on new generation
    setRefinementInput(''); // Reset input on new generation

    const outputFormat = "Raw Text";
    const tonesToGenerate = session?.user && comparisonTones.length > 0 ? comparisonTones : [selectedTone]; // Use comparison tones if logged in and selected, else single tone
    const isMulti = tonesToGenerate.length > 1;

    console.log(`Generating for tones: ${tonesToGenerate.join(', ')}`);
    if (isMulti) {
      setIsComparing(true);
      setComparisonResults({}); // Clear previous results
    } else {
      setIsGenerating(true);
      setGeneratedMessage(null); // Clear previous single result
    }
    
    const toastId = toast.loading(isMulti ? `Generating ${tonesToGenerate.length} variations...` : 'Generating message...');

    try {
      // Create an array of promises for each API call
      const promises = tonesToGenerate.map(toneId => 
        supabase.functions.invoke('tone-suggest', {
          body: { 
            userInput: userInput,
            // NOTE: The backend currently parses tone from userInput. 
            // We might need to adjust the backend or pass the specific toneId here if parsing isn't sufficient.
            // For now, assuming backend handles variations based on intent/context primarily.
            // If passing toneId is needed, it might look like: 
            // tone: toneId, // Pass specific tone ID
            context: selectedContext, 
            outputFormat: outputFormat,
            outputLength: outputLength // Add the outputLength state here
          },
        })
        .then(({ data, error: invokeError }) => {
          if (invokeError) throw new Error(`(${toneId}): ${invokeError.message || 'Invocation failed'}`);
          if (data && data.error) throw new Error(`(${toneId}): ${data.error}`);
          if (data && typeof data.generatedMessage === 'string') return { toneId, message: data.generatedMessage };
          throw new Error(`(${toneId}): Unexpected response format`);
        })
      );

      // Wait for all promises to resolve
      const results = await Promise.all(promises);
      
      // Process results
      if (isMulti) {
        const newResults: Record<string, string | null> = {};
        results.forEach(result => {
          newResults[result.toneId] = result.message;
        });
        setComparisonResults(newResults);
        toast.success(`${results.length} variations generated!`, { id: toastId });
        setGeneratedMessage(null); // Clear single message display when comparing
      } else {
        // Single generation result
        setGeneratedMessage(results[0].message);
        toast.success('Message generated successfully!', { id: toastId });
        setComparisonResults({}); // Clear comparison results
      }
      
      setHasJustGenerated(true);
      setTimeout(() => setHasJustGenerated(false), 1500);

    } catch (err) {
      console.error("Error during generation:", err);
      const message = err instanceof Error ? err.message : 'Generation failed.';
      toast.error(`Generation failed: ${message}`, { id: toastId });
      if (isMulti) setComparisonResults({});
      else setGeneratedMessage(null);
    } finally {
      if (isMulti) setIsComparing(false);
      else setIsGenerating(false);
    }
  };

  // --- Copy to Clipboard Function (Needs update if comparing) ---
  // TODO: Update handleCopyToClipboard to handle multiple results if needed?
  // Or provide copy buttons within the comparison display?
  const handleCopyToClipboard = async () => {
    if (!generatedMessage) return;
    try {
      await navigator.clipboard.writeText(generatedMessage);
      toast.success('Message copied to clipboard!');
      setCopyButtonText('Copied ✓'); // Change button text
      console.log('Message copied to clipboard!');
      // Reset button text after a delay
      setTimeout(() => setCopyButtonText('Copy'), 2000); 
    } catch (err) {
      console.error('Failed to copy text: ', err);
      toast.error('Failed to copy message.');
    }
  };

  // Fetch profile data when session changes (This effect handles profile and premium status)
  useEffect(() => {
    const fetchUserProfile = async (user: User | undefined) => {
      if (!user) {
        _setProfile(null);
        setIsPremium(false); // Reset premium on logout/no user
        setSavedPrompts([]); // Clear prompts on logout/no user
        return; // Ensure we exit here if no user
      }

      // Fetch saved prompts here since we need the user ID
      handleFetchSavedPrompts(user.id);

      // Restore the try/catch and query
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, is_premium') // Fetch only needed fields
          .eq('id', user.id) // Match against the 'id' column in profiles
          .single();

        if (error && error.code !== 'PGRST116') { // PGRST116: row not found
          throw error;
        }

        if (data) { // Data exists, profile found
          _setProfile(data);
          setIsPremium(data.is_premium || false);
        } else { // No data (PGRST116 or other reason)
          // Profile might not exist yet for a new user, or RLS hides it
          _setProfile(null);
          setIsPremium(false); // Assume not premium if profile not found
        }
      } catch (error: any) {
        console.error("Error fetching user profile:", error);
        _setProfile(null);
        setIsPremium(false); // Default to not premium on error
        setSavedPrompts([]); // Also clear prompts on profile fetch error
        // Optionally show a toast
        toast.error(`Error fetching user profile: ${error.message}`);
      }
    };

    // Call fetchUserProfile when session changes
    fetchUserProfile(session?.user); // Pass the user object or undefined

  }, [session]); // Re-run when session changes

  // --- Refinement Handlers ---
  const handleRefinementInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setRefinementInput(event.target.value);
  };

  // Handler to select a specific comparison result for refinement
  const handleSelectComparisonForRefinement = (toneId: string) => {
    if (comparisonResults[toneId]) {
      setSelectedComparisonForRefinement(toneId);
      setRefinementInput(''); // Clear refinement input when selecting new target
      // Optionally pre-fill refinement input or focus it
      toast.success(`Selected "${toneId}" tone for refinement.`);
    } else {
      console.warn('Attempted to select non-existent comparison result for refinement:', toneId);
    }
  };

  const handleRefinementSubmit = async () => {
    // Determine the message to refine based on context
    const messageToRefine = selectedComparisonForRefinement 
                            ? comparisonResults[selectedComparisonForRefinement]
                            : generatedMessage;

    if (!isPremium) {
      toast.error("Message refinement requires a Premium subscription.");
      return;
    }
    if (!messageToRefine) { // Check the actual message determined above
      toast.error("No message available to refine.");
      return;
    }
    if (!refinementInput.trim()) {
      toast.error("Please enter your refinement request.");
      return;
    }

    setIsRefining(true);
    const currentRefinementRequest = refinementInput;
    const toastId = toast.loading("Refining message...");

    try {
      const { data, error } = await supabase.functions.invoke('refine-output', {
        body: {
          originalMessage: messageToRefine, // Use the determined message
          userFollowUp: currentRefinementRequest,
          tone: selectedTone, 
          context: selectedContext,
        },
      });

      if (error) throw new Error(error.message || 'Function invocation failed');
      if (data.error) throw new Error(data.error);
      if (!data.refinedMessage) throw new Error('Refined message missing from response.');

      const refinedResponse = data.refinedMessage;

      // Update state differently based on whether we were refining a comparison or single output
      if (selectedComparisonForRefinement) {
        // Refined from comparison: Clear comparison, set as main output
        setGeneratedMessage(refinedResponse);
        setComparisonResults({});
        setSelectedComparisonForRefinement(null); 
      } else {
        // Refined from single output: Just update main output
        setGeneratedMessage(refinedResponse);
      }
      
      // Add to history (common to both cases)
      setRefinementHistory(prev => [...prev, { request: currentRefinementRequest, response: refinedResponse }]);
      
      // Clear the input field only on success
      setRefinementInput(""); 
      
      toast.success("Message refined successfully!", { id: toastId });

    } catch (err) {
      console.error("Refinement error:", err);
      const message = err instanceof Error ? err.message : 'Refinement failed.';
      toast.error(`Refinement failed: ${message}`, { id: toastId });
    } finally {
      setIsRefining(false);
    }
  };

  // --- Feedback Handler (Placeholder) ---
  const handleFeedbackClick = () => {
    // Simple mailto link for now
    window.location.href = "mailto:feedback@toneelevate.com?subject=ToneElevate Feedback";
    toast.success("Opening email client for feedback...");
  };

  // --- Cancel Subscription Handler ---
  const handleCancelSubscriptionClick = async () => {
    // Confirmation Dialog
    const isConfirmed = window.confirm(
      "Are you sure you want to cancel your Premium subscription?\n\nYou will retain access until the end of your current billing period."
    );

    if (!isConfirmed) {
      return; // User cancelled the action
    }

    const toastId = toast.loading("Processing cancellation...");
    
    try {
      // Call the Supabase Edge Function to handle cancellation
      const { data, error } = await supabase.functions.invoke('cancel-subscription');

      if (error) {
        // Handle potential errors from the function invocation itself
        throw new Error(error.message || 'Function invocation failed');
      }
      
      if (data.error) {
         // Handle errors returned successfully from the function logic
         throw new Error(data.error);
      }

      if (data.success) {
         toast.success("Subscription scheduled to cancel at period end.", { id: toastId });
         // NOTE: We don't update isPremium state here. 
         // The UI should ideally reflect the cancellation status based on subscription data 
         // fetched from Stripe or updated via webhooks (e.g., show "Cancels on [date]").
         // For simplicity now, the UI won't change immediately after clicking cancel.
      } else {
         // Should be caught by data.error check, but as a fallback
         throw new Error(data.message || "Cancellation failed for an unknown reason.");
      }

    } catch (error: any) {
      console.error("Cancellation processing error:", error);
      toast.error(`Cancellation failed: ${error.message}`, { id: toastId });
    }
    // Loading state is handled by the toast
  };

  // --- JSX Return ---
  console.log('[App.tsx] Rendering - isPremium state:', isPremium);
  return (
    <div className="min-h-screen bg-gray-100 font-sans flex flex-col">
      {/* === SEO Head Management === */}
      <Helmet>
        <title>ToneElevate - AI-Powered Communication Assistant</title>
        <meta
          name="description"
          content="Struggling with a tricky message? ToneElevate crafts perfectly toned responses for email, chat & more. Get the right words for any situation."
        />
        {/* Add other meta tags here later if needed (e.g., keywords, open graph) */}
      </Helmet>

      <Toaster position="top-center" reverseOrder={false} />
      <Header 
        session={session}
        isPremium={isPremium}
        onLoginClick={handleOpenAuthModal}
        onLogoutClick={handleLogout}
        onUpgradeClick={handleUpgradeClick}
        isUpgrading={isUpgrading}
      />

      {/* Main Content Area - Remove bottom margin */}
      <main className="flex-grow container mx-auto p-4 md:p-6 lg:p-8 pb-[env(safe-area-inset-bottom)]">
        {/* === SEO H1 Heading (Visually Hidden) === */}
        <h1 className="sr-only">
          Unsure How to Phrase It? Get AI Help Writing Messages with the Right Tone
        </h1>

        <div className="lg:grid lg:grid-cols-3 lg:gap-8">
          {/* Left Column (takes 2/3 on large screens) - Add lg:pb-24 */}
          <div className="lg:col-span-2 space-y-6 mb-8 lg:mb-0 lg:pb-24">

          {/* Add a placeholder or message if user is not logged in but tries to compare? */} 
            {/* This might be redundant now with the InfoCard */}
            {/* {!session?.user && (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
                  <p className="text-sm text-yellow-700">
                     ✨ <button onClick={handleOpenAuthModal} className="font-medium underline hover:text-yellow-800">Log in or Sign up</button> to compare multiple tone variations side-by-side!
                  </p>
              </div>
            )} */}

            {/* Tone Templates Section */}
          <ToneTemplates
            templates={toneTemplatesData}
            onSelectTemplate={handleSelectToneTemplate}
          />

            {/* Input Section */}
          <InputSection 
            userInput={userInput}
            onUserInputChange={handleUserInputChange}
            onClearInput={handleClearInput}
            maxLength={MAX_INPUT_LENGTH}
              // Remove the unused props
            />

            {/* Conditional Config Section (Single Tone or Multi-Tone) */}
            {(() => {
              // Add console log here
              // console.log('[App.tsx] Rendering conditional section. isLoggedIn:', !!session?.user);
              return !!session?.user ? (
            <MultiToneSelector 
                toneOptions={toneOptions}
                selectedTones={comparisonTones}
                onSelectionChange={handleComparisonToneChange}
                  maxSelection={maxComparisonTones} // Pass dynamic limit
                  isLoggedIn={isLoggedIn} 
            />
              ) : ( // Logged out case
                <>
            <ConfigSection 
              selectedTone={selectedTone}
              selectedContext={selectedContext}
              toneOptions={toneOptions}
              contextOptions={contextOptions}
              onToneChange={handleToneChange}
              onContextChange={handleContextChange}
            />
                  {/* Content Length Selector now part of ConfigSection group for logged-out */}
                  {/* <div className="mt-4">
                      <ContentLengthSelector 
                          selectedLength={outputLength}
                          onLengthChange={handleOutputLengthChange}
                      />
                   </div> */}
                </>
              );
            })()}

            {/* Content Length Selector (Always visible below config/multi-select) */}
             <div className="max-w-sm"> {/* Constrain width slightly */} 
                  <ContentLengthSelector 
                     selectedLength={outputLength}
                     onLengthChange={handleOutputLengthChange}
                  />
              </div>

            {/* Output Area (Single or Comparison) */}
          {Object.keys(comparisonResults).length > 0 ? (
                <ToneComparisonDisplay 
                  results={comparisonResults} 
                  // --- Refinement Props for Comparison ---
                  isPremium={isPremium}
                  isRefining={isRefining}
                  refinementInput={refinementInput}
                  onRefinementInputChange={handleRefinementInputChange}
                  onRefinementSubmit={handleRefinementSubmit}
                  refinementHistory={refinementHistory}
                  selectedComparisonForRefinement={selectedComparisonForRefinement} // Pass down selected ID
                  onSelectComparisonForRefinement={handleSelectComparisonForRefinement} // Pass down handler
                /> 
          ) : (
              <OutputSection 
                generatedMessage={generatedMessage}
                isGenerating={isGenerating}
                copyButtonText={copyButtonText}
                onCopyToClipboard={handleCopyToClipboard}
                  // --- Refinement Props ---
                  isPremium={isPremium}
                  isRefining={isRefining}
                  refinementInput={refinementInput}
                  onRefinementInputChange={handleRefinementInputChange}
                  onRefinementSubmit={handleRefinementSubmit}
                  refinementHistory={refinementHistory}
                />
            )}
          </div>

          {/* Right Column (takes 1/3 on large screens) */}
          <div className="lg:col-span-1">
            <InfoCard
               isLoggedIn={isLoggedIn}
               isPremium={isPremium}
               onLoginClick={handleOpenAuthModal}
               onUpgradeClick={handleUpgradeClick}
               onCancelSubscriptionClick={handleCancelSubscriptionClick}
               onFeedbackClick={handleFeedbackClick}
              />
          </div>
        </div>
      </main>

      {/* Fixed Action Button Area - Centered Container */} 
      <div className="fixed bottom-0 left-0 right-0 z-20 px-4 sm:px-6 lg:px-8 pb-4">
        <div className="max-w-4xl mx-auto"> {/* Changed from max-w-7xl to max-w-4xl */}
          <ActionSection 
            onGenerate={handleGenerateOrCompare} 
            isGenerating={isGenerating || isComparing} 
            isInputValid={isInputValid}
            hasJustGenerated={hasJustGenerated}
            comparisonToneCount={session?.user ? comparisonTones.length : 0} 
            generateButtonText={'Generate Message'}
          />
        </div>
      </div>

      {/* Saved Prompts Modal (Rendered conditionally) */}
      {showSavedPromptsModal && (
        <Suspense fallback={<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"><LoadingFallback /></div>}>
          <SavedPromptsModal
            isOpen={showSavedPromptsModal}
            onClose={handleCloseSavedPromptsModal}
            savedPrompts={savedPrompts}
            isLoading={isLoadingPrompts}
            onSelectPrompt={handleLoadSavedPrompt}
            onDeletePrompt={(promptId: string) => handleLoadSavedPrompt(savedPrompts.find(p => p.id === promptId) || { 
              id: promptId, 
              user_id: '',
              created_at: '',
              name: '',
              prompt_text: '',
              tone_id: '',
              context: ''
            })}
          />
        </Suspense>
      )}

      {/* Authentication Modal */}
      {showAuthModal && (
        <Suspense fallback={<LoadingFallback />}>
          <AuthModal 
            isOpen={showAuthModal}
            onClose={handleCloseAuthModal}
          />
        </Suspense>
      )}

    </div>
  );
}

const LoadingFallback = () => <div className="p-4 text-center"><p>Loading component...</p></div>;

export default App;

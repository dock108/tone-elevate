import React, { useState, useEffect, lazy, Suspense } from 'react';
import { supabase } from './lib/supabaseClient'; // Import supabase client
import { Session /*, RealtimeChannel */ } from '@supabase/supabase-js'; // Import Session type
import ReactMarkdown from 'react-markdown'; // Import react-markdown
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

// Import Saved Prompts API helpers and types
import {
  fetchSavedPrompts,
  saveNewPrompt,
  deletePrompt,
  SavedPrompt,
  NewSavedPromptData
} from './lib/savedPromptsApi';

// Import Tone Templates data and component
import { toneTemplatesData, ToneTemplate } from './lib/toneTemplatesData';
import ToneTemplates from './components/ToneTemplates';
import MultiToneSelector from './components/MultiToneSelector'; // Import the new component
import ToneComparisonDisplay from './components/ToneComparisonDisplay'; // Import the comparison display

// Lazy load potentially heavy/unused components
const PremiumSubscription = lazy(() => import('./components/PremiumSubscription'));
const UserPreferences = lazy(() => import('./components/UserPreferences'));
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
  // const [profile, setProfile] = useState<any | null>(null); // Keep commented if not fully used yet
  // const [loadingProfile, setLoadingProfile] = useState(true); // Keep commented if not fully used yet

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
  const [savedPrompts, setSavedPrompts] = useState<SavedPrompt[]>([]);
  const [isLoadingPrompts, setIsLoadingPrompts] = useState<boolean>(false);
  const [showSavedPromptsModal, setShowSavedPromptsModal] = useState<boolean>(false);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false); // State for Auth Modal

  // Other UI State
  const [showPremiumModal, setShowPremiumModal] = useState(false); // Keep if used
  const [showPreferencesModal, setShowPreferencesModal] = useState(false); // Keep if used
  const [copyButtonText, setCopyButtonText] = useState('Copy');
  const [hasJustGenerated, setHasJustGenerated] = useState(false); // State to prevent duplicate submission

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
  const MAX_COMPARISON_TONES = 3;

  // --- Effects ---
  // Set default tone and context once on mount
  useEffect(() => {
    const defaultTone = toneOptions.find(opt => opt.id === "Professional - Boss") || toneOptions[0];
    setSelectedTone(defaultTone.id);
    const defaultContext = contextOptions.includes('Email') ? 'Email' : contextOptions[0];
    setSelectedContext(defaultContext);
  }, []); // Empty dependency array ensures this runs only once

  // Fetch saved prompts when session changes
  useEffect(() => {
    if (session?.user?.id) {
      handleFetchSavedPrompts(session.user.id);
    } else {
      // Clear prompts if user logs out
      setSavedPrompts([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  // Auth listener
  useEffect(() => {
    // Fetch initial session state
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Subscribe to auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    // Cleanup function to unsubscribe when the component unmounts
    return () => {
      // Call unsubscribe on the subscription object within the data object
      authListener?.subscription?.unsubscribe();
      // Cleanup profileSubscription if it's uncommented later
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
  const canCompare = session?.user && comparisonTones.length > 0 && isInputValid;

  // --- Event Handlers ---
  const handleUserInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setUserInput(event.target.value);
  };

  const handleClearInput = () => {
    setUserInput('');
    setGeneratedMessage(null); // Optionally clear generated message too
  };

  const handleToneChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedTone(event.target.value);
  };

  const handleContextChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedContext(event.target.value);
  };

  // --- Auth Handlers ---
  const handleOpenAuthModal = () => {
    setShowAuthModal(true);
  };

  const handleCloseAuthModal = () => {
    setShowAuthModal(false);
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error(`Logout failed: ${error.message}`);
    } else {
      toast.success('Logged out successfully.');
      setSession(null); // Immediately clear session state
    }
  };

  // --- Saved Prompts Handlers ---
  const handleToggleSavedPromptsModal = () => {
    setShowSavedPromptsModal(prev => !prev);
  };

  const handleFetchSavedPrompts = async (userId: string) => {
    setIsLoadingPrompts(true);
    const { data, error } = await fetchSavedPrompts(userId);
    if (error) {
      toast.error(`Failed to load saved prompts: ${error}`);
    } else if (data) {
      setSavedPrompts(data);
    } else {
      setSavedPrompts([]); // Set to empty array if data is null
    }
    setIsLoadingPrompts(false);
  };

  const handleSaveCurrentPrompt = async (label?: string) => {
    if (!session?.user?.id) {
      toast.error("You must be logged in to save prompts.");
      return;
    }
    if (!userInput.trim()) {
      toast.error("Cannot save an empty prompt.");
      return;
    }

    const promptData: NewSavedPromptData = {
      user_id: session.user.id,
      label: label || null,
      prompt_text: userInput,
      tone_id: selectedTone,
      context: selectedContext,
    };

    const toastId = toast.loading("Saving prompt...");
    const { data, error } = await saveNewPrompt(promptData);

    if (error) {
      toast.error(`Failed to save prompt: ${error}`, { id: toastId });
    } else if (data) {
      toast.success("Prompt saved successfully!", { id: toastId });
      // Add the new prompt to the beginning of the list locally
      // or refetch the list for simplicity
      setSavedPrompts(prev => [data, ...prev]);
      // Optionally close modal or give other feedback
    }
  };

  const handleDeleteSavedPrompt = async (promptId: string) => {
    if (!session?.user?.id) {
      toast.error("Authentication error.");
      return;
    }

    // Optional: Add confirmation dialog here
    const confirmDelete = window.confirm("Are you sure you want to delete this saved prompt?");
    if (!confirmDelete) {
      return;
    }

    const toastId = toast.loading("Deleting prompt...");
    const { success, error } = await deletePrompt(promptId, session.user.id);

    if (error || !success) {
      toast.error(`Failed to delete prompt: ${error || 'Unknown error'}`, { id: toastId });
    } else {
      toast.success("Prompt deleted.", { id: toastId });
      // Remove the prompt from the local state
      setSavedPrompts(prev => prev.filter(p => p.id !== promptId));
    }
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
  };

  // --- API Call Handler (Updated for Multi-Tone) ---
  const handleGenerateOrCompare = async () => {
    if (!isInputValid || isGenerating || isComparing) return;

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
            outputFormat: outputFormat
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

  // --- Commented out Profile Fetching Logic ---
  /*
  // Function to fetch user profile
  const fetchProfile = async (userId: string) => {
    // ... existing fetchProfile logic ...
  };
  */

  // --- JSX Return ---
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-blue-50 text-gray-800 font-sans">
      <Toaster position="top-center" reverseOrder={false} />
      <Header 
        session={session} // Pass session state
        onLoginClick={handleOpenAuthModal} // Pass handler to open modal
        onLogoutClick={handleLogout} // Pass logout handler
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-64"> {/* Increased bottom padding to pb-64 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Input, Config, Actions */}
          <div className="lg:col-span-2 space-y-6">

            {/* Add a placeholder or message if user is not logged in but tries to compare? */} 
            {!session?.user && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
                    <p className="text-sm text-yellow-700">
                       ✨ <button onClick={handleOpenAuthModal} className="font-medium underline hover:text-yellow-800">Log in or Sign up</button> to compare multiple tone variations side-by-side!
                    </p>
                </div>
            )}

            {/* Tone Templates Section (Moved Above Input) */}
            <ToneTemplates
              templates={toneTemplatesData}
              onSelectTemplate={handleSelectToneTemplate}
            />

            {/* Pass necessary state and handlers to child components */}
            <InputSection 
              userInput={userInput}
              onUserInputChange={handleUserInputChange}
              onClearInput={handleClearInput}
              maxLength={MAX_INPUT_LENGTH}
              onSavePrompt={() => { /* TODO: Implement actual save trigger */ handleSaveCurrentPrompt(); }}
              onLoadPrompt={handleToggleSavedPromptsModal}
              isLoggedIn={!!session?.user} // Pass login status
            />
            {/* Show Single Tone Selector OR Multi Tone Selector */} 
            {session?.user ? (
              <MultiToneSelector 
                  toneOptions={toneOptions}
                  selectedTones={comparisonTones}
                  onSelectionChange={handleComparisonToneChange}
                  maxSelection={MAX_COMPARISON_TONES}
                  isLoggedIn={!!session?.user}
                  // TODO: Connect the login button inside this component too
              />
            ) : (
               // Show original single selector if not logged in
              <ConfigSection 
                selectedTone={selectedTone}
                selectedContext={selectedContext}
                toneOptions={toneOptions}
                contextOptions={contextOptions}
                onToneChange={handleToneChange}
                onContextChange={handleContextChange}
              />
            )}
            
            {/* Show Single Output OR Comparison Output */} 
            {Object.keys(comparisonResults).length > 0 ? (
                <ToneComparisonDisplay results={comparisonResults} /> 
            ) : (
                <OutputSection 
                  generatedMessage={generatedMessage}
                  isGenerating={isGenerating}
                  copyButtonText={copyButtonText}
                  onCopyToClipboard={handleCopyToClipboard}
                />
            )}
          </div>

          {/* Right Column: Ads / Premium Placeholder */}
          <aside className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">Ad Placeholder</h2>
              <div className="bg-gray-200 h-48 flex items-center justify-center text-gray-500 rounded">
                Right Sidebar Ad Slot
              </div>
            </div>
            {/* Temporarily hidden Premium/Upgrade section
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">Upgrade</h2>
               <Suspense fallback={<LoadingFallback />}>
                   {showPremiumModal && <PremiumSubscription onClose={() => setShowPremiumModal(false)} />} 
                   <button 
                     onClick={() => setShowPremiumModal(true)} 
                     className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md transition duration-150 ease-in-out">
                     Upgrade to Premium
                   </button>
               </Suspense>
            </div>
            */}
          </aside>
        </div>
      </main>

      {/* Fixed Action Button Area - Simplified Container */} 
      <div className="fixed bottom-24 left-0 right-0 z-20 px-4 sm:px-6 lg:px-8"> {/* Removed pointer-events-none */}
        <div className="max-w-7xl mx-auto">
          {/* Constrain width to match left column on large screens */} 
          <div className="lg:max-w-[calc(66.66%-1rem)]"> 
             <ActionSection 
               onGenerate={handleGenerateOrCompare} 
               isGenerating={isGenerating || isComparing} 
               isInputValid={isInputValid}
               hasJustGenerated={hasJustGenerated}
               // Pass comparison info instead of changing button text directly
               comparisonToneCount={session?.user ? comparisonTones.length : 0} 
               generateButtonText={'Generate Message'} // Keep button text consistent
             />
          </div>
        </div>
      </div>

      {/* Fixed Bottom Banner Ad Placeholder */}
      <div className="fixed bottom-0 left-0 right-0 bg-white p-4 shadow-lg border-t border-gray-200 text-center">
        <div className="bg-gray-200 h-16 flex items-center justify-center text-gray-500 rounded">
          Bottom Banner Ad Slot
        </div>
      </div>

      {/* Saved Prompts Modal (Rendered conditionally) */}
      {showSavedPromptsModal && (
        <Suspense fallback={<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"><LoadingFallback /></div>}>
          <SavedPromptsModal
            isOpen={showSavedPromptsModal}
            onClose={handleToggleSavedPromptsModal}
            savedPrompts={savedPrompts}
            isLoading={isLoadingPrompts}
            onSelectPrompt={handleLoadSavedPrompt}
            onDeletePrompt={handleDeleteSavedPrompt}
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

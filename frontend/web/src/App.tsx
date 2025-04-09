import React, { useState, useEffect, lazy, Suspense } from 'react';
import { supabase } from './lib/supabaseClient'; // Import supabase client
import { Session } from '@supabase/supabase-js'; // Import Session type
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
  // TODO: Premium features not ready yet
  // const [showPremiumModal, setShowPremiumModal] = useState(false);
  // const [showPreferencesModal, setShowPreferencesModal] = useState(false);
  const [copyButtonText, setCopyButtonText] = useState('Copy');
  // const [hasJustGenerated, setHasJustGenerated] = useState(false); // Removed unused state TS6133

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
  // TODO: Comparison feature not fully implemented yet
  // const canCompare = session?.user && comparisonTones.length > 0 && isInputValid;

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
  // const handleOpenAuthModal = () => { // Removed unused handler TS6133
  //   setShowAuthModal(true);
  // };

  const handleCloseAuthModal = () => {
    setShowAuthModal(false);
  };

  // const handleLogout = async () => { // Removed unused handler TS6133
  //   const { error } = await supabase.auth.signOut();
  //   if (error) {
  //     toast.error(`Logout failed: ${error.message}`);
  //   } else {
  //     toast.success('Logged out successfully.');
  //     setSession(null); 
  //   }
  // };

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
          if (result && typeof result.message === 'string') { // Check result exists
            newResults[result.toneId] = result.message;
          }
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
      
      // Removed usage of hasJustGenerated
      // setHasJustGenerated(true);
      // setTimeout(() => setHasJustGenerated(false), 1500);

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
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />

      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 text-center mb-8">
          Get the Right Tone: Craft Perfect Messages for Any Audience with ToneElevate
        </h1>

        <div className="space-y-8">
          <ToneTemplates 
            templates={toneTemplatesData} 
            onSelectTemplate={handleSelectToneTemplate} 
          />

          <InputSection 
            userInput={userInput} 
            onUserInputChange={handleUserInputChange}
            onClearInput={handleClearInput}
            maxLength={MAX_INPUT_LENGTH}
            isLoggedIn={!!session?.user?.id} 
            onSavePrompt={handleSaveCurrentPrompt}
            onLoadPrompt={handleToggleSavedPromptsModal}
          />
          
          <ConfigSection
            selectedTone={selectedTone}
            selectedContext={selectedContext}
            toneOptions={toneOptions}
            contextOptions={contextOptions}
            onToneChange={handleToneChange}
            onContextChange={handleContextChange}
          />

          <MultiToneSelector 
            toneOptions={toneOptions} 
            selectedTones={comparisonTones} 
            onSelectionChange={handleComparisonToneChange}
            maxSelection={MAX_COMPARISON_TONES}
            isLoggedIn={!!session?.user?.id}
          />

          <ActionSection 
            isGenerating={isGenerating || isComparing} 
            onGenerate={handleGenerateOrCompare} 
            isInputValid={isInputValid} 
            hasJustGenerated={false}
            generateButtonText={comparisonTones.length > 0 && !!session?.user?.id ? `Compare ${comparisonTones.length} Tones` : 'Generate Message'} 
            comparisonToneCount={session?.user ? comparisonTones.length : 0} 
          />

          {generatedMessage && !isComparing && (
            <OutputSection 
              generatedMessage={generatedMessage} 
              isGenerating={isGenerating}
              copyButtonText={copyButtonText}
              onCopyToClipboard={handleCopyToClipboard}
            />
          )}

          {isComparing || Object.keys(comparisonResults).length > 0 && (
             <ToneComparisonDisplay 
               results={comparisonResults}
             />
          )}
        </div>
      </main>
      
      <Toaster position="bottom-center" />
      
      <Suspense fallback={<LoadingFallback />}>
        {showAuthModal && <AuthModal isOpen={showAuthModal} onClose={handleCloseAuthModal} />}
        {showSavedPromptsModal && session?.user?.id && (
          <SavedPromptsModal 
            isOpen={showSavedPromptsModal} 
            onClose={handleToggleSavedPromptsModal} 
            prompts={savedPrompts}
            onLoadPrompt={handleLoadSavedPrompt} 
            onDeletePrompt={handleDeleteSavedPrompt}
            isLoading={isLoadingPrompts}
          />
        )}
      </Suspense>
    </div>
  );
}

const LoadingFallback = () => <div className="p-4 text-center"><p>Loading component...</p></div>;

export default App;

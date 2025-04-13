import React, { useState } from 'react';

// Define the structure for a single refinement history item
interface RefinementHistoryItem {
  request: string;
  response: string;
}

// Update props interface to include refinement-related state and handlers
interface OutputSectionProps {
  generatedMessage: string | null;
  isGenerating: boolean;
  onCopyToClipboard: () => void;
  copyButtonText: string;
  // --- Refinement Props ---
  isPremium: boolean;
  isRefining: boolean;
  refinementInput: string;
  onRefinementInputChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onRefinementSubmit: () => void;
  refinementHistory: RefinementHistoryItem[];
}

const OutputSection: React.FC<OutputSectionProps> = ({ 
  generatedMessage,
  isGenerating,
  onCopyToClipboard,
  copyButtonText,
  // Destructure refinement props
  isPremium,
  isRefining,
  refinementInput,
  onRefinementInputChange,
  onRefinementSubmit,
  refinementHistory
}) => {
  console.log('[OutputSection.tsx] Received props - isPremium:', isPremium);

  // State for refinement history visibility
  const [isHistoryVisible, setIsHistoryVisible] = useState(false);

  // Handle Enter key press in refinement input
  const handleRefinementKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault(); // Prevent newline
      onRefinementSubmit(); // Submit refinement
    }
  };

  const CopyButton = () => (
    <button
      onClick={onCopyToClipboard}
      disabled={!generatedMessage || isGenerating || copyButtonText === 'Copied ✓'}
      className={`absolute top-2 right-2 px-3 py-1 text-xs font-semibold rounded transition duration-150 ease-in-out ${copyButtonText === 'Copied ✓' ? 'bg-green-100 text-green-700 cursor-default' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'} disabled:opacity-75 disabled:cursor-not-allowed`}
    >
       {copyButtonText}
    </button>
  );

  return (
    <div className="space-y-6"> {/* Use space-y to separate main output and refinement */} 
      <div className="relative p-4 border rounded min-h-[200px] bg-gray-50 shadow-inner">
        <h2 className="text-lg font-semibold mb-3 text-gray-700">Generated Message</h2>
        
        {isGenerating && (
          <div className="flex items-center justify-center h-full">
            <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        )}

        {!isGenerating && generatedMessage && (
          <>
            <CopyButton />
            <div className="whitespace-pre-wrap text-sm text-gray-800 mt-2 font-sans overflow-x-auto">{generatedMessage}</div>
          </>
        )}

        {!isGenerating && !generatedMessage && (
          <p className="text-gray-500 italic text-center mt-8">Your generated message will appear here.</p>
        )}
      </div>

      {/* --- Refinement Section (Conditional Rendering) --- */}
      {isPremium && generatedMessage && (
        <div className="p-4 border rounded bg-white shadow-sm">
          <h3 className="text-md font-semibold mb-3 text-gray-700">Refine Message</h3>
          <textarea
            value={refinementInput}
            onChange={onRefinementInputChange}
            onKeyDown={handleRefinementKeyDown} // Add keydown handler
            placeholder="Enter your refinement request (e.g., 'make it more formal', 'add a call to action'). Press Enter to submit."
            className="w-full p-2 border rounded mb-2 text-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out resize-none" // Added resize-none
            rows={2} // Start with 2 rows
            disabled={isRefining} // Disable input while refining
          />
          <div className="flex justify-between items-center">
            <button
              onClick={onRefinementSubmit}
              disabled={isRefining || !refinementInput.trim()} // Also disable if input is empty
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition duration-150 ease-in-out flex items-center"
            >
              {isRefining ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Refining...
                </>
              ) : (
                'Submit Refinement'
              )}
            </button>
            {/* Refinement History Toggle */}
            {refinementHistory.length > 0 && (
              <button 
                onClick={() => setIsHistoryVisible(!isHistoryVisible)}
                className="text-sm text-blue-600 hover:text-blue-800 underline"
              >
                {isHistoryVisible ? 'Hide' : 'Show'} Refinement History ({refinementHistory.length})
              </button>
            )}
          </div>

          {/* Collapsible Refinement History */} 
          {isHistoryVisible && refinementHistory.length > 0 && (
            <div className="mt-4 max-h-48 overflow-y-auto border-t pt-3 space-y-3">
              {refinementHistory.map((item, index) => (
                <div key={index} className="text-xs p-2 border rounded bg-gray-50">
                  <p className="font-semibold text-gray-600">Request:</p>
                  <p className="text-gray-800 mb-1">{item.request}</p>
                  <p className="font-semibold text-gray-600">Response:</p>
                  <p className="text-gray-800 whitespace-pre-wrap">{item.response}</p>
                </div>
              )).reverse()} { /* Show newest first */ }
            </div>
          )}
        </div>
      )}

      {/* Spacer for fixed bottom elements on mobile when premium section is visible */}
      {isPremium && generatedMessage && <div className="h-20 md:h-0"></div>} 

    </div>
  );
};

export default OutputSection; 
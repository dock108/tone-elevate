import React, { useState } from 'react';
import toast from 'react-hot-toast';

// Define the structure for a single refinement history item
interface RefinementHistoryItem {
  request: string;
  response: string;
}

interface ToneComparisonDisplayProps {
  results: Record<string, string | null>; // Object with toneId as key and generated message as value
  // --- Refinement Props ---
  isPremium: boolean;
  isRefining: boolean;
  refinementInput: string;
  onRefinementInputChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onRefinementSubmit: () => void;
  refinementHistory: RefinementHistoryItem[];
  selectedComparisonForRefinement: string | null;
  onSelectComparisonForRefinement: (toneId: string) => void;
}

// Helper function to copy text
const copyToClipboard = async (text: string | null, toneId: string) => {
  if (!text) {
    toast.error('Nothing to copy for this tone.');
    return;
  }
  try {
    await navigator.clipboard.writeText(text);
    toast.success(`Copied text for tone: ${toneId}`);
  } catch (err) {
    console.error('Failed to copy text: ', err);
    toast.error('Failed to copy text.');
  }
};

const ToneComparisonDisplay: React.FC<ToneComparisonDisplayProps> = ({
  results,
  // Destructure refinement props
  isPremium,
  isRefining,
  refinementInput,
  onRefinementInputChange,
  onRefinementSubmit,
  refinementHistory,
  selectedComparisonForRefinement,
  onSelectComparisonForRefinement
}) => {
  const toneIds = Object.keys(results);
  const [isHistoryVisible, setIsHistoryVisible] = useState(false);

  // Determine grid columns based on number of results
  let gridColsClass = 'grid-cols-1';
  if (toneIds.length === 2) {
    gridColsClass = 'sm:grid-cols-2';
  } else if (toneIds.length >= 3) {
    gridColsClass = 'sm:grid-cols-2 lg:grid-cols-3'; // Show 2 cols on medium, 3 on large
  }

  // Handle Enter key press in refinement input
  const handleRefinementKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault(); // Prevent newline
      onRefinementSubmit(); // Submit refinement
    }
  };

  return (
    <section aria-labelledby="comparison-heading" className="mt-6 space-y-6">
      <div>
        <h2 id="comparison-heading" className="text-lg font-semibold text-gray-700 mb-4">
          Generated Tone Variations
        </h2>
        <div className={`grid ${gridColsClass} gap-4`}>
          {toneIds.map((toneId) => {
            const message = results[toneId];
            const isSelectedForRefinement = selectedComparisonForRefinement === toneId;
            return (
              <div 
                key={toneId} 
                className={`p-4 rounded-lg shadow-sm border flex flex-col transition-all duration-150 ease-in-out ${isSelectedForRefinement ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-200' : 'bg-white border-gray-200'}`}
              >
                {/* Header for the tone */}
                <div className="flex justify-between items-center mb-2 border-b pb-2">
                  <h3 className={`text-md font-medium ${isSelectedForRefinement ? 'text-blue-800' : 'text-blue-700'}`}>{toneId}</h3>
                  <button 
                    onClick={() => copyToClipboard(message, toneId)}
                    className="text-xs text-gray-500 hover:text-blue-600 focus:outline-none p-1 rounded hover:bg-gray-100"
                    title={`Copy text for ${toneId}`}
                    disabled={!message} // Disable if message is null/empty
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                  </button>
                </div>
                {/* Generated Message Content */}
                <div className="flex-grow overflow-y-auto max-h-60 pr-2 mb-3"> {/* Scrollable content area, added margin-bottom */} 
                  {message ? (
                    <div className="text-sm text-gray-800 whitespace-pre-wrap break-words">
                      {message}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 italic">Failed to generate message for this tone.</p>
                  )}
                </div>
                 {/* Select for Refinement Button (Premium Only) */} 
                 {isPremium && message && (
                  <button
                    onClick={() => onSelectComparisonForRefinement(toneId)}
                    disabled={isSelectedForRefinement} // Disable if already selected
                    className={`w-full mt-auto px-3 py-1.5 text-xs font-medium rounded transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-1 ${isSelectedForRefinement ? 'bg-blue-200 text-blue-800 cursor-default' : 'bg-blue-100 text-blue-700 hover:bg-blue-200 focus:ring-blue-500'} disabled:opacity-70 disabled:cursor-not-allowed`}
                  >
                    {isSelectedForRefinement ? 'Selected for Refinement' : 'Select for Refinement'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* --- Refinement Section (Conditional Rendering: Premium & Selection Made) --- */}
      {isPremium && selectedComparisonForRefinement && (
        <div className="p-4 border rounded bg-white shadow-sm border-blue-300 ring-1 ring-blue-200">
           <h3 className="text-md font-semibold mb-3 text-gray-700">
            Refine Variation: <span className="text-blue-700 font-bold">"{selectedComparisonForRefinement}"</span>
          </h3>
          <textarea
            value={refinementInput}
            onChange={onRefinementInputChange}
            onKeyDown={handleRefinementKeyDown} // Add keydown handler
            placeholder={`Refine the "${selectedComparisonForRefinement}" message (e.g., 'make it shorter', 'add urgency'). Press Enter to submit.`}
            className="w-full p-2 border rounded mb-2 text-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out resize-none"
            rows={2}
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
    </section>
  );
};

export default ToneComparisonDisplay; 
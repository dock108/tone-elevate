import React from 'react';

interface ActionSectionProps {
  isGenerating: boolean;
  onGenerate: () => void;
  isInputValid: boolean;
  hasJustGenerated: boolean;
  generateButtonText: string; // Text for the main button
  comparisonToneCount: number; // Number of tones selected for comparison
}

const ActionSection: React.FC<ActionSectionProps> = ({
  isGenerating,
  onGenerate,
  isInputValid,
  hasJustGenerated,
  generateButtonText,
  comparisonToneCount
}) => {

  const isDisabled = isGenerating || !isInputValid || hasJustGenerated;
  const showComparisonInfo = comparisonToneCount > 0;

  return (
    <div className="bg-gradient-to-t from-gray-100 via-gray-100 to-transparent pt-4 pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-center space-x-4"> { /* Flex container */}
        <button
          onClick={onGenerate}
          disabled={isDisabled}
          className={`flex-grow px-6 py-3 bg-blue-600 text-white font-semibold rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition duration-150 ease-in-out`}
        >
          {isGenerating ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating...
            </>
          ) : (
            generateButtonText // Use prop for button text
          )}
        </button>

        {/* Display comparison count if applicable */} 
        {showComparisonInfo && !isGenerating && (
           <span className="text-sm text-gray-600 flex-shrink-0 whitespace-nowrap">
              (Comparing {comparisonToneCount} tones)
           </span>
        )}
      </div>
      
      {/* Validation message - Keep below button */}
      {!isInputValid && !isGenerating && (
        <p className="text-xs text-gray-500 mt-2 text-center">
          Please enter some text to generate a message.
          {/* Tooltip could go here if needed, e.g., on a disabled button state explanation */}
        </p>
      )}
    </div>
  );
};

export default ActionSection; 
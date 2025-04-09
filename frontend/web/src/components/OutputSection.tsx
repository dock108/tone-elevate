import React from 'react';

interface OutputSectionProps {
  generatedMessage: string | null;
  isGenerating: boolean;
  onCopyToClipboard: () => void;
  copyButtonText: string;
}

const OutputSection: React.FC<OutputSectionProps> = ({ 
  generatedMessage,
  isGenerating,
  onCopyToClipboard,
  copyButtonText
}) => {

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
    <div className="relative p-4 border rounded mt-6 min-h-[200px] bg-gray-50 shadow-inner">
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
  );
};

export default OutputSection; 
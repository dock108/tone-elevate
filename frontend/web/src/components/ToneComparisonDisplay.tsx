import React from 'react';
import toast from 'react-hot-toast';

interface ToneComparisonDisplayProps {
  results: Record<string, string | null>; // Object with toneId as key and generated message as value
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

const ToneComparisonDisplay: React.FC<ToneComparisonDisplayProps> = ({ results }) => {
  const toneIds = Object.keys(results);

  // Determine grid columns based on number of results
  let gridColsClass = 'grid-cols-1';
  if (toneIds.length === 2) {
    gridColsClass = 'sm:grid-cols-2';
  } else if (toneIds.length >= 3) {
    gridColsClass = 'sm:grid-cols-2 lg:grid-cols-3'; // Show 2 cols on medium, 3 on large
  }

  return (
    <section aria-labelledby="comparison-heading" className="mt-6">
      <h2 id="comparison-heading" className="text-lg font-semibold text-gray-700 mb-4">
        Generated Tone Variations
      </h2>
      <div className={`grid ${gridColsClass} gap-4`}>
        {toneIds.map((toneId) => {
          const message = results[toneId];
          return (
            <div key={toneId} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-col">
              {/* Header for the tone */}
              <div className="flex justify-between items-center mb-2 border-b pb-2">
                <h3 className="text-md font-medium text-blue-700">{toneId}</h3>
                <button 
                  onClick={() => copyToClipboard(message, toneId)}
                  className="text-xs text-gray-500 hover:text-blue-600 focus:outline-none p-1 rounded hover:bg-gray-100"
                  title={`Copy text for ${toneId}`}
                  disabled={!message} // Disable if message is null/empty
                >
                  {/* Simple Copy Icon */} 
                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                </button>
              </div>
              {/* Generated Message Content */}
              <div className="flex-grow overflow-y-auto max-h-60 pr-2"> {/* Scrollable content area */} 
                {message ? (
                   <div className="text-sm text-gray-800 whitespace-pre-wrap break-words">
                     {message}
                   </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">Failed to generate message for this tone.</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default ToneComparisonDisplay; 
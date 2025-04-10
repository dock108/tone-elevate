import React from 'react';
import { SavedPrompt } from '../lib/savedPromptsApi'; // Adjust path as needed

interface SavedPromptsModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedPrompts: SavedPrompt[];
  isLoading: boolean;
  onSelectPrompt: (prompt: SavedPrompt) => void;
  onDeletePrompt: (promptId: string) => void;
}

const SavedPromptsModal: React.FC<SavedPromptsModalProps> = ({
  isOpen,
  onClose,
  savedPrompts,
  isLoading,
  onSelectPrompt,
  onDeletePrompt,
}) => {
  if (!isOpen) return null;

  return (
    // Modal Overlay
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-300 ease-in-out"
      onClick={onClose} // Close modal when clicking overlay
    >
      {/* Modal Content Box - Stop propagation to prevent closing when clicking inside */}
      <div 
        className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto transform transition-all duration-300 ease-in-out scale-95 opacity-0 animate-modal-enter"
        onClick={(e) => e.stopPropagation()} // Prevent overlay click from closing
      >
        {/* Modal Header */}
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h2 className="text-xl font-semibold text-gray-700">Load Saved Prompt</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 focus:outline-none transition duration-150 ease-in-out"
            aria-label="Close modal"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        {/* Modal Body - Content */}
        <div>
          {isLoading ? (
            <div className="text-center text-gray-500 py-4">
              Loading prompts...
            </div>
          ) : savedPrompts.length === 0 ? (
            <div className="text-center text-gray-500 py-4">
              You haven't saved any prompts yet.
            </div>
          ) : (
            <ul className="space-y-3">
              {savedPrompts.map((prompt) => (
                <li key={prompt.id} className="border rounded-md p-3 hover:bg-gray-50 transition duration-150 ease-in-out">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium text-gray-800">
                        {prompt.name || `Prompt created ${new Date(prompt.created_at).toLocaleDateString()}`}
                      </p>
                      <p className="text-sm text-gray-600 truncate" title={prompt.prompt_text}>
                        {prompt.prompt_text} 
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Tone: {prompt.tone_id} | Context: {prompt.context}
                      </p>
                    </div>
                    <div className="flex space-x-2 flex-shrink-0 ml-4">
                      <button 
                        onClick={() => onSelectPrompt(prompt)}
                        className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 transition duration-150 ease-in-out"
                        title="Load this prompt"
                      >
                        Select
                      </button>
                      <button 
                        onClick={() => onDeletePrompt(prompt.id)}
                        className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-red-500 transition duration-150 ease-in-out"
                        title="Delete this prompt"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Modal Footer (Optional - e.g., for a close button if not in header) */}
        {/* <div className="border-t pt-4 mt-4 text-right">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 focus:outline-none">
            Close
          </button>
        </div> */}
      </div>
    </div>
  );
};

export default SavedPromptsModal;

// Add simple keyframes for modal animation in your global CSS (e.g., index.css or App.css):
/*
@keyframes modal-enter {
  from { transform: scale(0.95); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
.animate-modal-enter {
  animation: modal-enter 0.2s ease-out forwards;
}
*/ 
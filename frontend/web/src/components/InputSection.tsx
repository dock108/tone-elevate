import React from 'react';

interface InputSectionProps {
  // Define props needed from App.tsx (e.g., userInput value, change handler, max length)
  userInput: string;
  onUserInputChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  maxLength: number;
  onClearInput: () => void; // Add prop for clearing input
  isLoggedIn: boolean; // New prop: Is the user logged in?
  onSavePrompt: (label?: string) => void; // New prop: Handler to save the current prompt
  onLoadPrompt: () => void; // New prop: Handler to open the load prompt modal
}

const InputSection: React.FC<InputSectionProps> = ({ 
  userInput, 
  onUserInputChange, 
  maxLength,
  onClearInput,
  isLoggedIn,
  onSavePrompt,
  onLoadPrompt
 }) => {
  const currentLength = userInput.length;
  const remainingLength = maxLength - currentLength;

  // Optional: State for handling the prompt label input if needed directly here
  // const [promptLabel, setPromptLabel] = useState('');
  // const handleSaveClick = () => {
  //   // Potentially open a small input for label first
  //   // For now, just call the handler without a label (or with a default)
  //   onSavePrompt(); 
  // };
  
  // Simple save trigger (no label input in this version)
  const handleSaveClick = () => {
      // You could add logic here to prompt for a label if desired
      // For example, using a simple window.prompt or a small inline input field
      // const label = window.prompt("Enter an optional label for this prompt:");
      onSavePrompt(); // Pass label if implemented: onSavePrompt(label || undefined);
  };

  return (
    <div className="relative">
      <div className="flex justify-between items-center mb-1">
        <label htmlFor="userInput" className="block text-sm font-medium text-gray-700">
          Your Message / Prompt
        </label>
        {/* Container for Save/Load buttons, shown only if logged in */} 
        {isLoggedIn && (
          <div className="flex items-center space-x-2">
             <button 
               onClick={handleSaveClick} // Use the simple trigger
               className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition duration-150 ease-in-out"
               disabled={!userInput.trim()} // Disable if input is empty
               title="Save current input as a prompt"
             >
               Save Prompt
             </button>
             <button 
               onClick={onLoadPrompt}
               className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition duration-150 ease-in-out"
               title="Load a saved prompt"
             >
               Load Prompts
             </button>
          </div>
        )}
      </div>
      <textarea
        id="userInput"
        value={userInput}
        onChange={onUserInputChange}
        placeholder="Enter your message or draft here..." 
        maxLength={maxLength}
        rows={6}
        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out resize-y"
      />
      <div className="absolute bottom-2 right-2 flex items-center space-x-2">
         {userInput.length > 0 && ( // Show Clear button only if there is input
          <button 
            onClick={onClearInput}
            className="text-xs text-gray-500 hover:text-gray-700 focus:outline-none"
            title="Clear input"
          >
            Clear
          </button>
        )}
         <span 
          className={`text-xs ${remainingLength < 0 ? 'text-red-600' : 'text-gray-500'}`}
         >
           {remainingLength} characters remaining
         </span>
       </div>
    </div>
  );
};

export default InputSection; 
import React from 'react';

interface InputSectionProps {
  // Define props needed from App.tsx
  userInput: string;
  onUserInputChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  maxLength: number;
  onClearInput: () => void; // Handler for clearing input
}

const InputSection: React.FC<InputSectionProps> = ({ 
  userInput, 
  onUserInputChange, 
  maxLength,
  onClearInput
 }) => {
  const currentLength = userInput.length;
  const remainingLength = maxLength - currentLength;

  return (
    <div className="relative">
      <div className="flex justify-between items-center mb-2">
        <div>
          <label htmlFor="userInput" className="block text-base font-medium text-gray-700">
            Write Naturally
          </label>
          <p className="text-sm text-gray-500 mt-1">
            Just write your thoughts - we'll help polish them for your selected tone and context.
          </p>
        </div>
      </div>
      <textarea
        id="userInput"
        value={userInput}
        onChange={onUserInputChange}
        placeholder="Type your thoughts here... anything at all. We'll help shape it into the right message.

Examples:
- ugh this sprint is taking way longer than we thought... gotta let sarah and the team know but don't want to freak everyone out
- hey so i looked at your doc and love most of it but that last section feels off... maybe we could approach it differently?
- omg got the promotion!!! need to tell everyone but probably shouldn't use exclamation marks lol
- these notes are all over the place... key points: deadline moved, jake owns design, maria needs backend help asap"
        maxLength={maxLength}
        rows={8}
        className="w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out resize-y font-normal text-base"
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
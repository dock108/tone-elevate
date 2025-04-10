import React from 'react';

interface ToneOption {
  id: string;
  label: string;
}

interface MultiToneSelectorProps {
  toneOptions: ToneOption[]; // All available tones
  selectedTones: string[]; // Array of selected tone IDs
  onSelectionChange: (selectedIds: string[]) => void; // Callback when selection changes
  maxSelection: number; // Maximum number of tones that can be selected
  isLoggedIn: boolean; // Controls if the component is enabled/visible
}

const MultiToneSelector: React.FC<MultiToneSelectorProps> = ({
  toneOptions,
  selectedTones,
  onSelectionChange,
  maxSelection,
  isLoggedIn
}) => {

  // Handler for checkbox changes
  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = event.target;
    let updatedSelection: string[];

    if (checked) {
      // Add to selection if not exceeding max
      if (selectedTones.length < maxSelection) {
        updatedSelection = [...selectedTones, value];
      } else {
        // Optionally provide feedback that max is reached (e.g., toast)
        console.warn(`Maximum ${maxSelection} tones can be selected.`);
        // Prevent checking the box if max is reached
        event.target.checked = false;
        return; // Exit without changing state
      }
    } else {
      // Remove from selection
      updatedSelection = selectedTones.filter((id) => id !== value);
    }
    
    onSelectionChange(updatedSelection); // Call the parent handler with the new array
  };

  // Render nothing or a disabled state/message if not logged in
  if (!isLoggedIn) {
    return (
      <div className="bg-gray-100 p-4 rounded-md border border-gray-200 text-center">
          <p className="text-sm text-gray-600">
            <button onClick={() => { /* TODO: Trigger login modal */ }} className="text-blue-600 hover:underline font-medium">Log in</button> to compare multiple tone variations side-by-side.
          </p>
      </div>
    );
  }

  // Render the multi-selector UI for logged-in users
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-md font-semibold text-gray-700 mb-3">
        Select Tones to Compare (Up to {maxSelection})
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-48 overflow-y-auto pr-2"> {/* Scrollable grid */} 
        {toneOptions.map((option) => (
          <div key={option.id} className="flex items-center">
            <input
              id={`tone-checkbox-${option.id}`}
              type="checkbox"
              value={option.id}
              checked={selectedTones.includes(option.id)} // Check if the tone is in the selected array
              onChange={handleCheckboxChange}
              // Disable checkbox if max is reached and this option is not already selected
              disabled={selectedTones.length >= maxSelection && !selectedTones.includes(option.id)}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <label 
              htmlFor={`tone-checkbox-${option.id}`} 
              className={`ml-2 block text-sm ${selectedTones.length >= maxSelection && !selectedTones.includes(option.id) ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700'}`}
            >
              {option.label}
            </label>
          </div>
        ))}
      </div>
      {/* Display currently selected count */} 
      <p className="text-xs text-gray-500 mt-2">
          Selected: {selectedTones.length} / {maxSelection}
      </p>
    </div>
  );
};

export default MultiToneSelector; 
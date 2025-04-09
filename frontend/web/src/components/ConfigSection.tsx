import React from 'react';

interface ConfigSectionProps {
  // Define props needed from App.tsx (e.g., toneOptions, contextOptions, selected values, change handlers)
  toneOptions: { id: string; label: string }[];
  selectedTone: string;
  onToneChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  contextOptions: string[];
  selectedContext: string;
  onContextChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
}

const ConfigSection: React.FC<ConfigSectionProps> = ({ 
  toneOptions,
  selectedTone,
  onToneChange,
  contextOptions,
  selectedContext,
  onContextChange,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
      <div>
        <label htmlFor="tone" className="block text-sm font-medium text-gray-700 mb-1">Tone</label>
        <select
          id="tone"
          value={selectedTone}
          onChange={onToneChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
        >
          {toneOptions.map(option => (
            <option key={option.id} value={option.id}>{option.label}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="context" className="block text-sm font-medium text-gray-700 mb-1">Context</label>
        <select
          id="context"
          value={selectedContext}
          onChange={onContextChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
        >
          {contextOptions.map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default ConfigSection; 
// frontend/web/src/components/ContentLengthSelector.tsx
import React from 'react';

interface ContentLengthSelectorProps {
  selectedLength: string;
  onLengthChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
}

const ContentLengthSelector: React.FC<ContentLengthSelectorProps> = ({
  selectedLength,
  onLengthChange,
}) => {
  const lengthOptions = ['Short', 'Medium', 'Long'];

  return (
    <div className="space-y-1">
      <label htmlFor="outputLength" className="block text-sm font-medium text-gray-700">
        Desired Output Length
      </label>
      <select
        id="outputLength"
        value={selectedLength}
        onChange={onLengthChange}
        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md shadow-sm"
      >
        {lengthOptions.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <p className="text-xs text-gray-500 mt-1">
        Guide the AI on the desired length (Short ≈ 1-2 sentences, Medium ≈ 1-2 paragraphs, Long ≈ 3+ paragraphs).
      </p>
    </div>
  );
};

export default ContentLengthSelector; 
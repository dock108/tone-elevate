import React from 'react';
import type { ToneTemplate } from '../lib/toneTemplatesData'; // Adjust path as needed

interface ToneTemplatesProps {
  templates: ToneTemplate[];
  onSelectTemplate: (template: ToneTemplate) => void;
}

const ToneTemplates: React.FC<ToneTemplatesProps> = ({ templates, onSelectTemplate }) => {
  // Return null or minimal UI if no templates are provided
  if (!templates || templates.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby="templates-heading" className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h2 id="templates-heading" className="text-lg font-semibold text-gray-700 mb-4">
        Quick Start Templates
      </h2>
      {/* Use flexbox with overflow for horizontal scrolling */}
      <div className="flex overflow-x-auto space-x-4 pb-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        {/* Map over templates and render each card */}
        {templates.map((template) => (
          <button
            key={template.id}
            onClick={() => onSelectTemplate(template)}
            // Set a fixed width or min-width for the cards to control initial display
            // Aiming for roughly 3 cards visible initially on medium screens
            className="flex-shrink-0 w-60 sm:w-64 lg:w-72 text-left p-4 border border-gray-200 rounded-md hover:bg-blue-50 hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out cursor-pointer h-full flex flex-col justify-between"
            title={`Use template: ${template.name}`}
          >
            <div>
              <h3 className="text-sm font-medium text-blue-700 mb-1 truncate" title={template.name}>{template.name}</h3>
              <p className="text-xs text-gray-600 line-clamp-2">{template.description}</p> { /* Limit description lines */}
            </div>
            <div className="mt-2">
               <span className="text-xs inline-flex items-center px-2 py-0.5 rounded bg-gray-100 text-gray-600 mr-1 whitespace-nowrap">
                 Tone: {template.tone_id}
               </span>
               <span className="text-xs inline-flex items-center px-2 py-0.5 rounded bg-gray-100 text-gray-600 whitespace-nowrap">
                 Context: {template.context}
               </span>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
};

export default ToneTemplates; 
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

interface UserPreferencesProps {
  userId: string;
}

const UserPreferences: React.FC<UserPreferencesProps> = ({ userId }) => {
  const [preferences, setPreferences] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [templateName, setTemplateName] = useState('');
  const [templateBody, setTemplateBody] = useState('');

  // Fetch preferences
  const fetchPreferences = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError, status } = await supabase
        .from('preferences')
        .select('*')
        .eq('user_id', userId)
        .limit(1)
        .maybeSingle();

      if (fetchError && status !== 406) throw fetchError;

      if (data) {
        setPreferences(data);
        setTemplateName(data.saved_template_name || '');
        setTemplateBody(data.saved_template_body || '');
        console.log('Preferences loaded:', data);
      } else {
        console.log('No preferences found, creating initial.');
        const { data: newData, error: insertError } = await supabase
          .from('preferences')
          .insert({ user_id: userId, preferred_tone: 'professional' })
          .select()
          .single();
        if (insertError) throw insertError;
        setPreferences(newData);
        setTemplateName('');
        setTemplateBody('');
      }
    } catch (err) {
      console.error('Error fetching/creating preferences:', err);
      setError(`Error loading preferences: ${(err as Error).message}`);
      setPreferences(null);
    } finally {
      setLoading(false);
    }
  };

  // Save template
  const handleSaveTemplate = async () => {
    if (!preferences?.id) {
      setError("Preferences not loaded yet.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { error: updateError } = await supabase
        .from('preferences')
        .update({ saved_template_name: templateName, saved_template_body: templateBody })
        .eq('id', preferences.id);
      if (updateError) throw updateError;
      alert("Template saved!");
      fetchPreferences(); // Refresh
    } catch (err) {
      console.error("Error saving template:", err);
      setError(`Failed to save template: ${(err as Error).message}`);
    } finally {
      setLoading(false); // Ensure loading is false even on error
    }
  };

  // Delete template
  const handleDeleteTemplate = async () => {
    if (!preferences?.id) {
      setError("Preferences not loaded yet.");
      return;
    }
    if (!window.confirm('Are you sure you want to delete this template?')) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { error: updateError } = await supabase
        .from('preferences')
        .update({ saved_template_name: null, saved_template_body: null })
        .eq('id', preferences.id);
      if (updateError) throw updateError;
      alert("Template deleted!");
      fetchPreferences(); // Refresh
    } catch (err) {
      console.error("Error deleting template:", err);
      setError(`Failed to delete template: ${(err as Error).message}`);
    } finally {
      setLoading(false); // Ensure loading is false even on error
    }
  };

  useEffect(() => {
    if (userId) {
      fetchPreferences();
    }
  }, [userId]);

  // --- Tailwind Styling --- //
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">My Template</h3>
      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <svg className="h-8 w-8 animate-spin text-deep-blue dark:text-teal-aqua" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      ) : error ? (
        <p className="rounded-md border border-red-400 bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">Error: {error}</p>
      ) : preferences ? (
        <form onSubmit={(e) => { e.preventDefault(); handleSaveTemplate(); }} className="space-y-4">
          <div>
            <label htmlFor="templateName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Template Name (Optional)
            </label>
            <input
              id="templateName"
              type="text"
              placeholder="e.g., Meeting Follow-up"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              disabled={loading}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-deep-blue focus:ring-deep-blue dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:focus:border-teal-aqua dark:focus:ring-teal-aqua sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="templateBody" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Template Body
            </label>
            <textarea
              id="templateBody"
              placeholder="Enter reusable template text..."
              rows={5}
              value={templateBody}
              onChange={(e) => setTemplateBody(e.target.value)}
              disabled={loading}
              required // Require body if saving
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-deep-blue focus:ring-deep-blue dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:focus:border-teal-aqua dark:focus:ring-teal-aqua sm:text-sm"
            />
          </div>
          <div className="flex justify-end space-x-3">
            {(preferences.saved_template_name || preferences.saved_template_body) && (
                <button
                  type="button" // Important: Prevents form submission
                  onClick={handleDeleteTemplate}
                  disabled={loading}
                  className="inline-flex justify-center rounded-md border border-transparent bg-red-600 py-2 px-4 text-sm font-medium text-white shadow-sm transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 dark:focus:ring-offset-gray-900"
                >
                    {loading ? 'Deleting...' : 'Delete'}
                </button>
            )}
            <button
              type="submit"
              disabled={loading || (!templateBody.trim() && !templateName.trim())} // Disable if both fields are empty
              className="inline-flex justify-center rounded-md border border-transparent bg-deep-blue py-2 px-4 text-sm font-medium text-white shadow-sm transition hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-deep-blue focus:ring-offset-2 disabled:opacity-50 dark:focus:ring-offset-gray-900"
            >
                {loading ? 'Saving...' : 'Save Template'}
            </button>
          </div>
        </form>
      ) : (
         <p className="text-center text-gray-500 dark:text-gray-400">Could not load preferences.</p>
      )}
    </div>
  );
};

export default UserPreferences; 
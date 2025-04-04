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
      setLoading(false);
    }
  };

  // Delete template
  const handleDeleteTemplate = async () => {
    if (!preferences?.id) {
      setError("Preferences not loaded yet.");
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
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchPreferences();
    }
  }, [userId]);

  return (
    <div className="preferences-card">
      <h3>My Template</h3>
      {loading ? (
        <p>Loading preferences...</p>
      ) : error ? (
        <p className="error-message">{error}</p>
      ) : preferences ? (
        <div>
          <div className="form-group">
            <label htmlFor="templateName">Template Name:</label>
            <input
              id="templateName"
              type="text"
              placeholder="e.g., Meeting Follow-up"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="templateBody">Template Body:</label>
            <textarea
              id="templateBody"
              placeholder="Enter template text..."
              rows={5}
              value={templateBody}
              onChange={(e) => setTemplateBody(e.target.value)}
              disabled={loading}
            />
          </div>
          <div className="prefs-buttons">
            <button onClick={handleSaveTemplate} disabled={loading}>
                {loading ? 'Saving...' : 'Save Template'}
            </button>
            {(preferences.saved_template_name || preferences.saved_template_body) && (
                <button className="delete-button" onClick={handleDeleteTemplate} disabled={loading}>
                    {loading ? 'Deleting...' : 'Delete Template'}
                </button>
            )}
          </div>
        </div>
      ) : (
         <p>Could not load preferences.</p>
      )}
    </div>
  );
};

export default UserPreferences; 
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
      setLoading(false);
    }
  };

  // Delete template
  const handleDeleteTemplate = async () => {
    if (!preferences?.id) {
      setError("Preferences not loaded yet.");
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
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchPreferences();
    }
  }, [userId]);

  return (
    <div className="preferences-card">
      <h3>My Template</h3>
      {loading ? (
        <p>Loading preferences...</p>
      ) : error ? (
        <p className="error-message">{error}</p>
      ) : preferences ? (
        <div>
          <div className="form-group">
            <label htmlFor="templateName">Template Name:</label>
            <input
              id="templateName"
              type="text"
              placeholder="e.g., Meeting Follow-up"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="templateBody">Template Body:</label>
            <textarea
              id="templateBody"
              placeholder="Enter template text..."
              rows={5}
              value={templateBody}
              onChange={(e) => setTemplateBody(e.target.value)}
              disabled={loading}
            />
          </div>
          <div className="prefs-buttons">
            <button onClick={handleSaveTemplate} disabled={loading}>
                {loading ? 'Saving...' : 'Save Template'}
            </button>
            {(preferences.saved_template_name || preferences.saved_template_body) && (
                <button className="delete-button" onClick={handleDeleteTemplate} disabled={loading}>
                    {loading ? 'Deleting...' : 'Delete Template'}
                </button>
            )}
          </div>
        </div>
      ) : (
         <p>Could not load preferences.</p>
      )}
    </div>
  );
};

export default UserPreferences; 
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TextInput, Button, SafeAreaView, Alert, ActivityIndicator, ScrollView, Pressable, Platform } from 'react-native';
import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabaseClient'; // Import supabase client
import { Session } from '@supabase/supabase-js';
import PremiumSubscription from './components/PremiumSubscription'; // Import the component
import { Picker } from '@react-native-picker/picker'; // Import Picker
import * as Clipboard from 'expo-clipboard'; // Import Clipboard

// TODO: Replace with actual environment variable handling (e.g., expo-constants)
// const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';

// Placeholder Auth Component
const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Sign in with email and password
  const handleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) Alert.alert('Login Error', error.message);
    // Session update is handled by the onAuthStateChange listener in App component
    setLoading(false);
  };

  // Sign up with email and password
  const handleSignup = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: email,
      password: password,
      // You can add additional metadata if needed for the trigger
      // options: { data: { name: 'Your Name' } }
    });

    if (error) Alert.alert('Sign Up Error', error.message);
    else Alert.alert('Sign Up Success', 'Please check your email for verification!');
    // Session update is handled by the onAuthStateChange listener in App component
    setLoading(false);
  };

  return (
    <View style={styles.authContainer}>
      <Text style={styles.authTitle}>Login or Sign Up</Text>
      <TextInput
        style={styles.authInput}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.authInput}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <View style={styles.authButtonContainer}>
        <Button title="Login" onPress={handleLogin} disabled={loading} />
        <Button title="Sign Up" onPress={handleSignup} disabled={loading} />
      </View>
    </View>
  );
};

// --- Preferences Component --- (New)
const UserPreferences = ({ userId }) => {
  const [preferences, setPreferences] = useState<any | null>(null);
  const [loadingPrefs, setLoadingPrefs] = useState(true);
  const [prefError, setPrefError] = useState<string | null>(null);
  const [templateName, setTemplateName] = useState('');
  const [templateBody, setTemplateBody] = useState('');

  // Fetch preferences
  const fetchPreferences = async () => {
    setLoadingPrefs(true);
    setPrefError(null);
    try {
      // Fetch the first preference record for the user
      const { data, error, status } = await supabase
        .from('preferences')
        .select('*')
        .eq('user_id', userId)
        .limit(1) // Get only the first one for this simple example
        .maybeSingle(); // Returns null instead of error if no row found

      if (error && status !== 406) throw error;

      if (data) {
        setPreferences(data);
        setTemplateName(data.saved_template_name || '');
        setTemplateBody(data.saved_template_body || '');
        console.log('Preferences loaded:', data);
      } else {
        console.log('No preferences found for user, creating initial.');
        // Optionally create a default preference record if none exists
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
    } catch (error) {
      console.error('Error fetching/creating preferences:', error);
      setPrefError(`Error loading preferences: ${error.message}`);
      setPreferences(null);
    } finally {
      setLoadingPrefs(false);
    }
  };

  // Save template
  const handleSaveTemplate = async () => {
    if (!preferences?.id) {
        Alert.alert("Error", "Preferences not loaded yet.");
        return;
    }
    setLoadingPrefs(true);
     try {
        const { error } = await supabase
            .from('preferences')
            .update({ saved_template_name: templateName, saved_template_body: templateBody })
            .eq('id', preferences.id);
        if (error) throw error;
        Alert.alert("Success", "Template saved!");
        fetchPreferences(); // Refresh data
     } catch(error) {
         console.error("Error saving template:", error);
         Alert.alert("Error", `Failed to save template: ${error.message}`);
         setLoadingPrefs(false);
     }
  };

  // Delete template
  const handleDeleteTemplate = async () => {
     if (!preferences?.id) {
        Alert.alert("Error", "Preferences not loaded yet.");
        return;
    }
     setLoadingPrefs(true);
     try {
        const { error } = await supabase
            .from('preferences')
            .update({ saved_template_name: null, saved_template_body: null })
            .eq('id', preferences.id);
        if (error) throw error;
        Alert.alert("Success", "Template deleted!");
        fetchPreferences(); // Refresh data
     } catch(error) {
         console.error("Error deleting template:", error);
         Alert.alert("Error", `Failed to delete template: ${error.message}`);
         setLoadingPrefs(false);
     }
  };

  useEffect(() => {
    if (userId) {
      fetchPreferences();
    }
  }, [userId]);

  return (
    <View style={styles.prefsContainer}>
      <Text style={styles.prefsTitle}>My Template</Text>
      {loadingPrefs ? (
        <ActivityIndicator />
      ) : prefError ? (
        <Text style={styles.errorText}>{prefError}</Text>
      ) : preferences ? (
        <>
          <TextInput
            style={styles.prefsInput}
            placeholder="Template Name (e.g., Meeting Follow-up)"
            value={templateName}
            onChangeText={setTemplateName}
          />
          <TextInput
            style={[styles.prefsInput, styles.prefsTextarea]}
            placeholder="Template Body..."
            value={templateBody}
            onChangeText={setTemplateBody}
            multiline
          />
          <View style={styles.prefsButtonContainer}>
            <Button title="Save Template" onPress={handleSaveTemplate} disabled={loadingPrefs} />
            {(preferences.saved_template_name || preferences.saved_template_body) && (
                <Button title="Delete Template" onPress={handleDeleteTemplate} disabled={loadingPrefs} color="#dc3545" />
            )}
          </View>
        </>
      ) : (
         <Text>Could not load preferences.</Text>
      )}
    </View>
  );
};

// Main App Component
export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<any | null>(null); // State to hold user profile
  const [loadingProfile, setLoadingProfile] = useState(true); // Loading state for profile
  const [text, setText] = useState('');
  const [tone, setTone] = useState('professional'); // Example tone
  // --- New State Variables ---
  const [context, setContext] = useState('Email'); // Default context
  const [outputFormat, setOutputFormat] = useState('Raw Text'); // Default output format
  // --- Renamed State Variables ---
  const [generatedMessage, setGeneratedMessage] = useState<string | null>(null); // Renamed from suggestions
  const [isGenerating, setIsGenerating] = useState(false); // Renamed from isLoadingSuggestions
  const [generationError, setGenerationError] = useState<string | null>(null); // Renamed from suggestionError
  const [copySuccess, setCopySuccess] = useState<boolean>(false); // State for copy feedback

  // Function to fetch user profile
  const fetchProfile = async (userId) => {
    setLoadingProfile(true);
    try {
      const { data, error, status } = await supabase
        .from('profiles')
        .select(`subscription_status, name`) // Select needed fields
        .eq('id', userId)
        .single();

      if (error && status !== 406) {
        throw error; // Throw error if it's not a "No rows found" error
      }

      if (data) {
        setProfile(data);
        console.log('User profile loaded:', data);
      } else {
         console.log('No profile found for user, might be newly created.');
         setProfile({ subscription_status: 'free' }); // Assume free if no profile yet
      }
    } catch (error) {
      Alert.alert('Error loading profile', error.message);
      setProfile(null);
    } finally {
      setLoadingProfile(false);
    }
  };

  // --- Renamed and Updated API Call Handler ---
  const handleGenerateMessage = async () => {
    // Allow generation even if not logged in, function handles limits/errors
    if (!text.trim()) {
      Alert.alert("Input Required", "Please enter some text to generate a message.");
      return;
    }

    console.log(`Invoking tone-suggest function for: Tone=${tone}, Context=${context}, Format=${outputFormat}`);
    setIsGenerating(true); // Renamed
    setGenerationError(null); // Renamed
    setGeneratedMessage(null); // Clear previous message
    setCopySuccess(false); // Reset copy feedback

    try {
      // Call the Supabase Edge Function with updated parameters
      const { data, error: invokeError } = await supabase.functions.invoke('tone-suggest', {
        // Body now contains text, tone, context, and outputFormat
        body: { text, tone, context, outputFormat },
      });

      if (invokeError) {
         // Handle Supabase function invocation errors (network, permissions etc.)
         console.error("Supabase function invocation error:", invokeError);
         throw new Error(invokeError.message || 'Failed to connect to the generation service.');
      }

      // Check if the function returned a specific error payload (e.g., rate limit)
      if (data && data.error) {
        console.error("Function returned error:", data.error);
        // Check for specific rate limit error message from backend
        if (data.error.includes("Daily generation limit")) {
            Alert.alert("Limit Reached", data.error);
        } else {
            Alert.alert("Generation Error", data.error);
        }
        throw new Error(data.error); // Still throw to stop execution
      }

      // Expecting { generatedMessage: "..." } on success
      if (data && typeof data.generatedMessage === 'string') {
        setGeneratedMessage(data.generatedMessage);
        console.log('Message generated successfully.');
      } else {
        console.error('Unexpected data format from function:', data);
        throw new Error('Received an unexpected response from the server.');
      }
    } catch (err) {
      // Avoid showing alert again if it was already shown for a function error
      if (!err.message.includes("Daily generation limit") && !(data && data.error)) {
          Alert.alert("Error", `Failed to generate message: ${err.message}`);
      }
      console.error("Error during message generation:", err);
      setGenerationError(`Error: ${err.message}`); // Keep error state for potential display
      setGeneratedMessage(null); // Ensure no message is displayed on error
    } finally {
      setIsGenerating(false); // Renamed
    }
  };

  // --- Copy to Clipboard Function ---
  const handleCopyToClipboard = async () => {
    if (!generatedMessage) return;
    try {
      await Clipboard.setStringAsync(generatedMessage);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000); // Hide message after 2s
      console.log('Message copied to clipboard!');
      // Optionally show a brief toast/message in the UI
      // Alert.alert("Copied!", "Message copied to clipboard."); // Can be intrusive
    } catch (err) {
      console.error('Failed to copy text: ', err);
      Alert.alert('Copy Error', 'Failed to copy message to clipboard.');
    }
  };

  useEffect(() => {
    let profileSubscription: any = null;

    // --- Auth Listener --- (Modified)
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user?.id) {
        fetchProfile(session.user.id); // Fetch profile on initial load if session exists
      } else {
        setLoadingProfile(false); // No user, stop loading profile
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user?.id) {
        fetchProfile(session.user.id); // Fetch profile when auth state changes

        // --- Subscribe to Profile Changes (Realtime) --- (Added)
        // Listen for changes specifically to the logged-in user's profile row
        profileSubscription = supabase
          .channel('public:profiles:id=eq.' + session.user.id)
          .on(
            'postgres_changes',
            { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${session.user.id}` },
            (payload) => {
              console.log('Profile updated via webhook! Reloading profile:', payload.new);
              setProfile(payload.new); // Update profile state directly from payload
              // Alternatively, refetch: fetchProfile(session.user.id);
            }
          )
          .subscribe((status, err) => {
              if (status === 'SUBSCRIBED') {
                  console.log('Subscribed to profile changes for user:', session.user.id);
              } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
                  console.error('Realtime subscription error:', status, err);
                  // Optionally, try to resubscribe or notify user
              }
          });

      } else {
        setProfile(null); // Clear profile on logout
        setLoadingProfile(false);
        // Unsubscribe from profile changes if subscription exists
        if (profileSubscription) {
          supabase.removeChannel(profileSubscription);
          profileSubscription = null;
          console.log('Unsubscribed from profile changes.');
        }
      }
      console.log('Auth state changed, session:', session ? 'Yes' : 'No');
    });

    // --- Cleanup Listeners --- (Modified)
    return () => {
      authListener?.subscription.unsubscribe();
      if (profileSubscription) {
        supabase.removeChannel(profileSubscription);
      }
    };
  }, []);

  // Helper to check subscription status
  const isPremiumUser = profile?.subscription_status === 'active' || profile?.subscription_status === 'premium';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ alignItems: 'center' }}>
        <Text style={styles.title}>ToneSmith Mobile</Text>

        {loadingProfile ? (
          <ActivityIndicator style={{ marginTop: 50 }} size="large" />
        ) : session ? (
          <>
            <Text style={styles.statusText}>
              Status: {profile?.subscription_status || 'Loading...'} {isPremiumUser ? '👑' : ''}
            </Text>
            <View style={styles.editorContainer}>
              <TextInput
                style={styles.input}
                multiline
                placeholder="Enter text here..."
                value={text}
                onChangeText={setText}
              />
              <View style={styles.pickerContainer}>
                <Text style={styles.label}>Tone:</Text>
                <Picker
                  selectedValue={tone}
                  onValueChange={(itemValue) => setTone(itemValue)}
                  style={styles.picker}
                  enabled={!isGenerating}
                >
                  <Picker.Item label="Casual" value="casual" />
                  <Picker.Item label="Concise" value="concise" />
                  <Picker.Item label="Formal" value="formal" />
                  <Picker.Item label="Friendly" value="friendly" />
                  <Picker.Item label="Persuasive" value="persuasive" />
                  <Picker.Item label="Professional" value="professional" />
                </Picker>
              </View>
              <View style={styles.pickerContainer}>
                <Text style={styles.label}>Context:</Text>
                <Picker
                  selectedValue={context}
                  onValueChange={(itemValue) => setContext(itemValue)}
                  style={styles.picker}
                  enabled={!isGenerating}
                >
                  <Picker.Item label="Documentation" value="Documentation" />
                  <Picker.Item label="Email" value="Email" />
                  <Picker.Item label="General Text" value="General Text" />
                  <Picker.Item label="GitHub Comment" value="GitHub Comment" />
                  <Picker.Item label="LinkedIn Post" value="LinkedIn Post" />
                  <Picker.Item label="Teams Chat" value="Teams Chat" />
                  <Picker.Item label="Text Message" value="Text Message" />
                </Picker>
              </View>
              <View style={styles.pickerContainer}>
                <Text style={styles.label}>Output Format:</Text>
                <Picker
                  selectedValue={outputFormat}
                  onValueChange={(itemValue) => setOutputFormat(itemValue)}
                  style={styles.picker}
                  enabled={!isGenerating}
                >
                  <Picker.Item label="Markdown" value="Markdown" />
                  <Picker.Item label="Raw Text" value="Raw Text" />
                </Picker>
              </View>
              <Text>Selected Tone: {tone}</Text>
              <Button
                  title={isGenerating ? "Generating..." : "Generate Message"}
                  onPress={handleGenerateMessage}
                  disabled={isGenerating}
              />
              <Button title="Sign Out" onPress={() => supabase.auth.signOut()} />
            </View>

            {/* --- Conditional Rendering for Subscription --- */ 
            {!isPremiumUser && (
                <PremiumSubscription />
            )}

            {/* --- Preferences/Template Section --- */ 
            <UserPreferences userId={session.user.id} />

            {/* Only show suggestions if premium or if free tier allows (logic in handleGetSuggestions) */} 
            <View style={styles.suggestionsContainer}>
              <Text style={styles.suggestionsTitle}>Suggestions:</Text>
              {isGenerating && <Text>Generating...</Text>}
              {generationError && !isGenerating && <Text style={styles.errorText}>{generationError}</Text>}
              {!isGenerating && !generationError && generatedMessage && (
                <View style={styles.generatedContent}>
                  {/* Basic Text rendering for now. Markdown requires a library like react-native-markdown-display */}
                   <Text selectable={true}>{generatedMessage}</Text>
                   <Pressable onPress={handleCopyToClipboard} style={styles.copyButton}>
                     <Text style={styles.copyButtonText}>Copy</Text>
                   </Pressable>
                   {copySuccess && <Text style={styles.copyFeedback}>Copied!</Text>}
                </View>
              )}
              {!isGenerating && !generationError && !generatedMessage && (
                <Text>No suggestions yet. Type text and click generate.</Text>
              )}
            </View>
          </>
        ) : (
          <Auth /> // Show Auth component if not logged in
        )}

        <StatusBar style="auto" />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    paddingTop: 50, // Adjust as needed for status bar etc.
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  editorContainer: {
    width: '90%',
    marginBottom: 20,
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  input: {
    height: 150,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 4,
    padding: 10,
    marginBottom: 10,
    textAlignVertical: 'top', // For Android multiline
  },
  suggestionsContainer: {
    width: '90%',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  suggestionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  suggestionItem: {
    fontSize: 14,
    marginBottom: 5,
  },
  errorText: {
      color: 'red',
      marginTop: 5,
      marginBottom: 10,
      textAlign: 'center',
  },
  // Styles for Auth Component
  authContainer: {
    width: '90%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  authTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  authInput: {
    width: '100%',
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  authButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 10,
  },
  statusText: {
      fontSize: 16,
      fontWeight: 'bold',
      marginBottom: 10,
      color: '#333',
  },
  // --- Styles for Preferences --- 
  prefsContainer: {
    width: '90%',
    marginTop: 20,
    marginBottom: 20,
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  prefsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  prefsInput: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  prefsTextarea: {
      height: 100,
      textAlignVertical: 'top',
  },
   prefsButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  generatedContent: {
     marginTop: 10,
     backgroundColor: '#e9ecef', // Light background for the message
     padding: 10,
     borderRadius: 5,
  },
  copyButton: {
      marginTop: 10,
      backgroundColor: '#007bff',
      paddingVertical: 8,
      paddingHorizontal: 15,
      borderRadius: 5,
      alignSelf: 'flex-start', // Position button
  },
  copyButtonText: {
      color: '#fff',
      fontWeight: 'bold',
  },
  copyFeedback: {
      marginTop: 5,
      marginLeft: 5,
      color: 'green',
      fontSize: 12,
      fontStyle: 'italic',
  },
  pickerContainer: {
    width: '90%',
    marginBottom: 20,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  picker: {
    width: '100%',
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 4,
  },
}); 
        .from('profiles')
        .select(`subscription_status, name`) // Select needed fields
        .eq('id', userId)
        .single();

      if (error && status !== 406) {
        throw error; // Throw error if it's not a "No rows found" error
      }

      if (data) {
        setProfile(data);
        console.log('User profile loaded:', data);
      } else {
         console.log('No profile found for user, might be newly created.');
         setProfile({ subscription_status: 'free' }); // Assume free if no profile yet
      }
    } catch (error) {
      Alert.alert('Error loading profile', error.message);
      setProfile(null);
    } finally {
      setLoadingProfile(false);
    }
  };

  // --- Renamed and Updated API Call Handler ---
  const handleGenerateMessage = async () => {
    // Allow generation even if not logged in, function handles limits/errors
    if (!text.trim()) {
      Alert.alert("Input Required", "Please enter some text to generate a message.");
      return;
    }

    console.log(`Invoking tone-suggest function for: Tone=${tone}, Context=${context}, Format=${outputFormat}`);
    setIsGenerating(true); // Renamed
    setGenerationError(null); // Renamed
    setGeneratedMessage(null); // Clear previous message
    setCopySuccess(false); // Reset copy feedback

    try {
      // Call the Supabase Edge Function with updated parameters
      const { data, error: invokeError } = await supabase.functions.invoke('tone-suggest', {
        // Body now contains text, tone, context, and outputFormat
        body: { text, tone, context, outputFormat },
      });

      if (invokeError) {
         // Handle Supabase function invocation errors (network, permissions etc.)
         console.error("Supabase function invocation error:", invokeError);
         throw new Error(invokeError.message || 'Failed to connect to the generation service.');
      }

      // Check if the function returned a specific error payload (e.g., rate limit)
      if (data && data.error) {
        console.error("Function returned error:", data.error);
        // Check for specific rate limit error message from backend
        if (data.error.includes("Daily generation limit")) {
            Alert.alert("Limit Reached", data.error);
        } else {
            Alert.alert("Generation Error", data.error);
        }
        throw new Error(data.error); // Still throw to stop execution
      }

      // Expecting { generatedMessage: "..." } on success
      if (data && typeof data.generatedMessage === 'string') {
        setGeneratedMessage(data.generatedMessage);
        console.log('Message generated successfully.');
      } else {
        console.error('Unexpected data format from function:', data);
        throw new Error('Received an unexpected response from the server.');
      }
    } catch (err) {
      // Avoid showing alert again if it was already shown for a function error
      if (!err.message.includes("Daily generation limit") && !(data && data.error)) {
          Alert.alert("Error", `Failed to generate message: ${err.message}`);
      }
      console.error("Error during message generation:", err);
      setGenerationError(`Error: ${err.message}`); // Keep error state for potential display
      setGeneratedMessage(null); // Ensure no message is displayed on error
    } finally {
      setIsGenerating(false); // Renamed
    }
  };

  // --- Copy to Clipboard Function ---
  const handleCopyToClipboard = async () => {
    if (!generatedMessage) return;
    try {
      await Clipboard.setStringAsync(generatedMessage);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000); // Hide message after 2s
      console.log('Message copied to clipboard!');
      // Optionally show a brief toast/message in the UI
      // Alert.alert("Copied!", "Message copied to clipboard."); // Can be intrusive
    } catch (err) {
      console.error('Failed to copy text: ', err);
      Alert.alert('Copy Error', 'Failed to copy message to clipboard.');
    }
  };

  useEffect(() => {
    let profileSubscription: any = null;

    // --- Auth Listener --- (Modified)
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user?.id) {
        fetchProfile(session.user.id); // Fetch profile on initial load if session exists
      } else {
        setLoadingProfile(false); // No user, stop loading profile
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user?.id) {
        fetchProfile(session.user.id); // Fetch profile when auth state changes

        // --- Subscribe to Profile Changes (Realtime) --- (Added)
        // Listen for changes specifically to the logged-in user's profile row
        profileSubscription = supabase
          .channel('public:profiles:id=eq.' + session.user.id)
          .on(
            'postgres_changes',
            { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${session.user.id}` },
            (payload) => {
              console.log('Profile updated via webhook! Reloading profile:', payload.new);
              setProfile(payload.new); // Update profile state directly from payload
              // Alternatively, refetch: fetchProfile(session.user.id);
            }
          )
          .subscribe((status, err) => {
              if (status === 'SUBSCRIBED') {
                  console.log('Subscribed to profile changes for user:', session.user.id);
              } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
                  console.error('Realtime subscription error:', status, err);
                  // Optionally, try to resubscribe or notify user
              }
          });

      } else {
        setProfile(null); // Clear profile on logout
        setLoadingProfile(false);
        // Unsubscribe from profile changes if subscription exists
        if (profileSubscription) {
          supabase.removeChannel(profileSubscription);
          profileSubscription = null;
          console.log('Unsubscribed from profile changes.');
        }
      }
      console.log('Auth state changed, session:', session ? 'Yes' : 'No');
    });

    // --- Cleanup Listeners --- (Modified)
    return () => {
      authListener?.subscription.unsubscribe();
      if (profileSubscription) {
        supabase.removeChannel(profileSubscription);
      }
    };
  }, []);

  // Helper to check subscription status
  const isPremiumUser = profile?.subscription_status === 'active' || profile?.subscription_status === 'premium';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ alignItems: 'center' }}>
        <Text style={styles.title}>ToneSmith Mobile</Text>

        {loadingProfile ? (
          <ActivityIndicator style={{ marginTop: 50 }} size="large" />
        ) : session ? (
          <>
            <Text style={styles.statusText}>
              Status: {profile?.subscription_status || 'Loading...'} {isPremiumUser ? '👑' : ''}
            </Text>
            <View style={styles.editorContainer}>
              <TextInput
                style={styles.input}
                multiline
                placeholder="Enter text here..."
                value={text}
                onChangeText={setText}
              />
              <View style={styles.pickerContainer}>
                <Text style={styles.label}>Tone:</Text>
                <Picker
                  selectedValue={tone}
                  onValueChange={(itemValue) => setTone(itemValue)}
                  style={styles.picker}
                  enabled={!isGenerating}
                >
                  <Picker.Item label="Casual" value="casual" />
                  <Picker.Item label="Concise" value="concise" />
                  <Picker.Item label="Formal" value="formal" />
                  <Picker.Item label="Friendly" value="friendly" />
                  <Picker.Item label="Persuasive" value="persuasive" />
                  <Picker.Item label="Professional" value="professional" />
                </Picker>
              </View>
              <View style={styles.pickerContainer}>
                <Text style={styles.label}>Context:</Text>
                <Picker
                  selectedValue={context}
                  onValueChange={(itemValue) => setContext(itemValue)}
                  style={styles.picker}
                  enabled={!isGenerating}
                >
                  <Picker.Item label="Documentation" value="Documentation" />
                  <Picker.Item label="Email" value="Email" />
                  <Picker.Item label="General Text" value="General Text" />
                  <Picker.Item label="GitHub Comment" value="GitHub Comment" />
                  <Picker.Item label="LinkedIn Post" value="LinkedIn Post" />
                  <Picker.Item label="Teams Chat" value="Teams Chat" />
                  <Picker.Item label="Text Message" value="Text Message" />
                </Picker>
              </View>
              <View style={styles.pickerContainer}>
                <Text style={styles.label}>Output Format:</Text>
                <Picker
                  selectedValue={outputFormat}
                  onValueChange={(itemValue) => setOutputFormat(itemValue)}
                  style={styles.picker}
                  enabled={!isGenerating}
                >
                  <Picker.Item label="Markdown" value="Markdown" />
                  <Picker.Item label="Raw Text" value="Raw Text" />
                </Picker>
              </View>
              <Text>Selected Tone: {tone}</Text>
              <Button
                  title={isGenerating ? "Generating..." : "Generate Message"}
                  onPress={handleGenerateMessage}
                  disabled={isGenerating}
              />
              <Button title="Sign Out" onPress={() => supabase.auth.signOut()} />
            </View>

            {/* --- Conditional Rendering for Subscription --- */ 
            {!isPremiumUser && (
                <PremiumSubscription />
            )}

            {/* --- Preferences/Template Section --- */ 
            <UserPreferences userId={session.user.id} />

            {/* Only show suggestions if premium or if free tier allows (logic in handleGetSuggestions) */} 
            <View style={styles.suggestionsContainer}>
              <Text style={styles.suggestionsTitle}>Suggestions:</Text>
              {isGenerating && <Text>Generating...</Text>}
              {generationError && !isGenerating && <Text style={styles.errorText}>{generationError}</Text>}
              {!isGenerating && !generationError && generatedMessage && (
                <View style={styles.generatedContent}>
                  {/* Basic Text rendering for now. Markdown requires a library like react-native-markdown-display */}
                   <Text selectable={true}>{generatedMessage}</Text>
                   <Pressable onPress={handleCopyToClipboard} style={styles.copyButton}>
                     <Text style={styles.copyButtonText}>Copy</Text>
                   </Pressable>
                   {copySuccess && <Text style={styles.copyFeedback}>Copied!</Text>}
                </View>
              )}
              {!isGenerating && !generationError && !generatedMessage && (
                <Text>No suggestions yet. Type text and click generate.</Text>
              )}
            </View>
          </>
        ) : (
          <Auth /> // Show Auth component if not logged in
        )}

        <StatusBar style="auto" />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    paddingTop: 50, // Adjust as needed for status bar etc.
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  editorContainer: {
    width: '90%',
    marginBottom: 20,
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  input: {
    height: 150,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 4,
    padding: 10,
    marginBottom: 10,
    textAlignVertical: 'top', // For Android multiline
  },
  suggestionsContainer: {
    width: '90%',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  suggestionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  suggestionItem: {
    fontSize: 14,
    marginBottom: 5,
  },
  errorText: {
      color: 'red',
      marginTop: 5,
      marginBottom: 10,
      textAlign: 'center',
  },
  // Styles for Auth Component
  authContainer: {
    width: '90%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  authTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  authInput: {
    width: '100%',
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  authButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 10,
  },
  statusText: {
      fontSize: 16,
      fontWeight: 'bold',
      marginBottom: 10,
      color: '#333',
  },
  // --- Styles for Preferences --- 
  prefsContainer: {
    width: '90%',
    marginTop: 20,
    marginBottom: 20,
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  prefsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  prefsInput: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  prefsTextarea: {
      height: 100,
      textAlignVertical: 'top',
  },
   prefsButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  generatedContent: {
     marginTop: 10,
     backgroundColor: '#e9ecef', // Light background for the message
     padding: 10,
     borderRadius: 5,
  },
  copyButton: {
      marginTop: 10,
      backgroundColor: '#007bff',
      paddingVertical: 8,
      paddingHorizontal: 15,
      borderRadius: 5,
      alignSelf: 'flex-start', // Position button
  },
  copyButtonText: {
      color: '#fff',
      fontWeight: 'bold',
  },
  copyFeedback: {
      marginTop: 5,
      marginLeft: 5,
      color: 'green',
      fontSize: 12,
      fontStyle: 'italic',
  },
  pickerContainer: {
    width: '90%',
    marginBottom: 20,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  picker: {
    width: '100%',
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 4,
  },
}); 
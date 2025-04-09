import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Button,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  ScrollView,
  Pressable,
  Platform,
  useColorScheme,
} from 'react-native';
import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabaseClient'; // Import supabase client
import { Picker } from '@react-native-picker/picker'; // Import Picker
import * as Clipboard from 'expo-clipboard'; // Import Clipboard
import Markdown from 'react-native-markdown-display'; // Import Markdown display

// === Constants ===
const MAX_INPUT_LENGTH = 8192;
const toneOptions = [
  // Professional Tones (Hierarchical)
  { id: "Professional - C-Suite", label: "Professional - C-Suite" },
  { id: "Professional - Director", label: "Professional - Director" },
  { id: "Professional - Boss", label: "Professional - Boss" },
  { id: "Professional - Peer Group", label: "Professional - Peer Group" },
  { id: "Professional - Subordinates", label: "Professional - Subordinates" },
  { id: "Professional - Interns", label: "Professional - Interns" },
  // Other Tones (Alphabetical)
  { id: "Casual", label: "Casual" },
  { id: "Confident", label: "Confident" },
  { id: "Direct", label: "Direct" },
  { id: "Empathetic", label: "Empathetic" },
  { id: "Enthusiastic", label: "Enthusiastic" },
  { id: "Formal", label: "Formal" },
  { id: "Friendly", label: "Friendly" },
  { id: "Humorous", label: "Humorous" },
  { id: "Informative", label: "Informative" },
  { id: "Inquisitive", label: "Inquisitive" },
  { id: "Motivational", label: "Motivational" },
  { id: "Neutral", label: "Neutral" },
  { id: "Persuasive", label: "Persuasive" },
  { id: "Respectful", label: "Respectful" },
  { id: "Supportive", label: "Supportive" },
  { id: "Urgent", label: "Urgent" },
];
const contextOptions = [
  'Documentation',
  'Email',
  'General Text',
  'GitHub Comment',
  'LinkedIn Post',
  'Teams Chat',
  'Text Message',
].sort();

// === Main App Component ===
export default function App() {
  // --- State Variables ---
  const [userInput, setUserInput] = useState('');
  const [selectedTone, setSelectedTone] = useState<string>(toneOptions[2].id); // Default to 'Professional - Boss'
  const [selectedContext, setSelectedContext] = useState<string>(contextOptions[1]); // Default to Email
  const [outputFormat, setOutputFormat] = useState<string>('Raw Text'); // Default output format
  const [generatedMessage, setGeneratedMessage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);
  const colorScheme = useColorScheme(); // Detect dark/light mode

  // --- Functions ---
  const handleGenerateMessage = async () => {
    if (!userInput.trim()) {
      Alert.alert("Input Required", "Please enter some text to generate a message.");
      return;
    }

    console.log(`Invoking tone-suggest function: Tone=${selectedTone}, Context=${selectedContext}, Format=${outputFormat}`);
    setIsGenerating(true);
    setGenerationError(null);
    setGeneratedMessage(null);
    setCopySuccess(false);

    try {
      const { data, error: invokeError } = await supabase.functions.invoke('tone-suggest', {
        body: { userInput, context: selectedContext, outputFormat },
      });

      if (invokeError) throw new Error(invokeError.message || 'Failed to connect to the generation service.');
      if (data && data.error) throw new Error(data.error);

      if (data && typeof data.generatedMessage === 'string') {
        setGeneratedMessage(data.generatedMessage);
        console.log('Message generated successfully.');
      } else {
        throw new Error('Received an unexpected response from the server.');
      }

    } catch (err) {
      console.error("Error during message generation:", err);
      const message = err instanceof Error ? err.message : 'Failed to generate message.';
      setGenerationError(`Error: ${message}`);
      setGeneratedMessage(null);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyToClipboard = async () => {
    if (!generatedMessage) return;
    try {
      await Clipboard.setStringAsync(generatedMessage);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 3000); // Reset after 3s
      console.log('Message copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy text: ', err);
      Alert.alert('Copy Error','Failed to copy message to clipboard.');
    }
  };

  // --- Styles --- (Adapting Tailwind concepts)
  const styles = getStyles(colorScheme);

  // --- Render --- //
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>ToneElevate</Text>
          <Text style={styles.tagline}>Polished Messages. Perfect Tone. Instantly.</Text>
        </View>

        {/* Section 1: Input */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Enter Your Message</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Write your unfiltered thoughts or rough draft here..."
            placeholderTextColor={styles.placeholderText.color}
            value={userInput}
            onChangeText={setUserInput}
            maxLength={MAX_INPUT_LENGTH}
            multiline
            textAlignVertical="top" // Good practice for multiline
          />
          <Text style={styles.charCount}>
            Characters: {userInput.length} / {MAX_INPUT_LENGTH}
          </Text>
        </View>

        {/* Section 2: Config */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Choose Tone & Context</Text>
          {/* Tone Picker */}
          <View style={styles.pickerContainer}>
             <Text style={styles.pickerLabel}>Tone</Text>
             <View style={styles.pickerWrapper}> // Wrapper for border/styling
              <Picker
                selectedValue={selectedTone}
                onValueChange={(itemValue) => setSelectedTone(itemValue)}
                style={styles.picker}
                itemStyle={styles.pickerItem} // For iOS font styling if needed
                mode="dropdown" // Android style
              >
                {toneOptions.map((option) => (
                  <Picker.Item key={option.id} label={option.label} value={option.id} />
                ))}
              </Picker>
             </View>
          </View>

          {/* Context Picker */}
          <View style={styles.pickerContainer}>
            <Text style={styles.pickerLabel}>Context</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={selectedContext}
                onValueChange={(itemValue) => setSelectedContext(itemValue)}
                style={styles.picker}
                 itemStyle={styles.pickerItem}
                 mode="dropdown"
              >
                {contextOptions.map((option) => (
                  <Picker.Item key={option} label={option} value={option} />
                ))}
              </Picker>
            </View>
          </View>

          {/* Output Format Picker */}
          <View style={styles.pickerContainer}>
            <Text style={styles.pickerLabel}>Output Format</Text>
             <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={outputFormat}
                  onValueChange={(itemValue) => setOutputFormat(itemValue)}
                  style={styles.picker}
                  itemStyle={styles.pickerItem}
                  mode="dropdown"
                >
                  <Picker.Item label="Raw Text" value="Raw Text" />
                  <Picker.Item label="Markdown" value="Markdown" />
                </Picker>
             </View>
          </View>
        </View>

        {/* Generate Button */}
        <View style={styles.buttonContainer}>
          <Pressable
            style={({ pressed }) => [
                styles.generateButton,
                isGenerating && styles.buttonDisabled,
                pressed && !isGenerating && styles.buttonPressed,
            ]}
            onPress={handleGenerateMessage}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <ActivityIndicator size="small" color="#ffffff" style={styles.spinner} />
                <Text style={styles.buttonText}>Generating...</Text>
              </>
            ) : (
              <Text style={styles.buttonText}>Generate Message</Text>
            )}
          </Pressable>
        </View>

        {/* Section 3: Output (Conditional) */}
        {(generatedMessage || generationError) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>3. Generated Message</Text>
            <View style={styles.outputContainer}>
              {generationError && (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>{generationError}</Text>
                </View>
              )}

              {generatedMessage && (
                <View style={styles.messageArea}> // Added for potential scroll/copy button positioning
                   {/* Copy Button - Positioned within messageArea */} 
                   <Pressable
                    style={({ pressed }) => [
                        styles.copyButton,
                        copySuccess && styles.copyButtonSuccess,
                        pressed && styles.buttonPressed // Reuse pressed style
                    ]}
                    onPress={handleCopyToClipboard}
                  >
                    <Text style={[styles.copyButtonText, copySuccess && styles.copyButtonTextSuccess]}>
                        {copySuccess ? 'Copied!' : 'Copy'}
                    </Text>
                  </Pressable>

                  {/* Message Display */} 
                  {outputFormat === 'Markdown' ? (
                    <Markdown style={markdownStyles(colorScheme)}>{generatedMessage}</Markdown>
                  ) : (
                    <Text style={styles.rawTextOutput} selectable={true}>{generatedMessage}</Text> // selectable is useful
                  )}
                </View>
              )}
            </View>
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

// --- Dynamic Styling Function ---
const getStyles = (colorScheme) => {
  const isDark = colorScheme === 'dark';
  const colors = {
    background: isDark ? '#111827' : '#f9fafb', // gray-900 : gray-50
    text: isDark ? '#e5e7eb' : '#1f2937', // gray-200 : gray-800
    placeholder: isDark ? '#6b7280' : '#9ca3af', // gray-500 : gray-400
    sectionTitle: isDark ? '#d1d5db' : '#374151', // gray-300 : gray-700
    tagline: isDark ? '#9ca3af' : '#4b5563', // gray-400 : gray-600
    title: isDark ? '#5eead4' : '#1e3a8a', // teal-aqua : deep-blue
    inputBackground: isDark ? '#1f2937' : '#ffffff', // gray-800 : white
    inputBorder: isDark ? '#4b5563' : '#d1d5db', // gray-600 : gray-300
    outputBackground: isDark ? '#374151' : '#f3f4f6', // gray-700 : gray-100
    outputBorder: isDark ? '#4b5563' : '#e5e7eb', // gray-600 : gray-200
    buttonBackground: '#14b8a6', // teal-aqua
    buttonText: '#ffffff',
    buttonDisabledBackground: '#99f6e4', // Lighter teal
    errorBackground: isDark ? '#7f1d1d' : '#fee2e2', // red-900 : red-100
    errorBorder: isDark ? '#b91c1c' : '#fca5a5', // red-700 : red-300
    errorText: isDark ? '#fecaca' : '#991b1b', // red-200 : red-800
    copyButtonBg: isDark ? '#4b5563' : '#e5e7eb', // gray-600 : gray-200
    copyButtonText: isDark ? '#e5e7eb' : '#374151', // gray-200 : gray-700
    copySuccessBg: isDark ? '#047857' : '#d1fae5', // green-700 : green-100
    copySuccessText: isDark ? '#ffffff' : '#065f46', // white : green-800
    pickerWrapperBg: isDark ? '#1f2937' : '#ffffff', // gray-800 : white
    pickerItemColor: isDark ? '#e5e7eb' : '#1f2937', // For iOS picker item text
  };

  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    container: {
      flex: 1,
    },
    contentContainer: {
        padding: 20,
        paddingBottom: 60, // Extra space at bottom
    },
    header: {
      alignItems: 'center',
      marginBottom: 30,
    },
    title: {
      fontSize: 32,
      fontWeight: 'bold',
      color: colors.title,
    },
    tagline: {
      fontSize: 16,
      color: colors.tagline,
      marginTop: 4,
    },
    section: {
      marginBottom: 30,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.sectionTitle,
      marginBottom: 15,
    },
    textArea: {
      height: 160, // Fixed height for consistency
      borderWidth: 1,
      borderColor: colors.inputBorder,
      borderRadius: 8,
      padding: 12,
      backgroundColor: colors.inputBackground,
      color: colors.text,
      fontSize: 15,
      marginBottom: 5,
    },
    placeholderText: {
        color: colors.placeholder,
    },
    charCount: {
      textAlign: 'right',
      fontSize: 12,
      color: colors.placeholder,
    },
    pickerContainer: {
      marginBottom: 15,
    },
    pickerLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: colors.text,
        marginBottom: 8,
    },
    pickerWrapper: {
      borderWidth: 1,
      borderColor: colors.inputBorder,
      borderRadius: 8,
      backgroundColor: colors.pickerWrapperBg,
      // Necessary for Picker background/border on iOS
      overflow: 'hidden',
    },
    picker: {
      width: '100%',
      height: Platform.OS === 'ios' ? undefined : 50, // Explicit height for Android
      color: colors.text,
      // Note: Background color on Picker itself might conflict with wrapper
    },
     pickerItem: {
        // Style props for Picker.Item (mainly iOS)
        color: colors.pickerItemColor,
        // height: 120, // Can adjust dropdown height on iOS if needed
     },
    buttonContainer: {
      alignItems: 'center',
      marginTop: 10, // Space above button
      marginBottom: 30, // Space below button
    },
    generateButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.buttonBackground,
      paddingVertical: 12,
      paddingHorizontal: 30,
      borderRadius: 8,
      minWidth: 180,
      // Add shadow for elevation
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 4,
    },
    buttonPressed: {
      opacity: 0.8, // Dim button slightly when pressed
    },
    buttonDisabled: {
      backgroundColor: colors.buttonDisabledBackground,
      opacity: 0.7,
      shadowOpacity: 0.1, // Less shadow when disabled
      elevation: 1,
    },
    buttonText: {
      color: colors.buttonText,
      fontSize: 16,
      fontWeight: '600',
      textAlign: 'center',
    },
    spinner: {
        marginRight: 10,
    },
    outputContainer: {
      borderWidth: 1,
      borderColor: colors.outputBorder,
      borderRadius: 8,
      backgroundColor: colors.outputBackground,
      padding: 15,
      minHeight: 100,
      position: 'relative', // Needed for absolute positioning of copy button
    },
     messageArea: {
        // Container for the message itself, allows button overlay
     },
     copyButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        zIndex: 1, // Ensure button is above text
        backgroundColor: colors.copyButtonBg,
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: colors.inputBorder, // Use input border for consistency
     },
     copyButtonSuccess: {
        backgroundColor: colors.copySuccessBg,
        borderColor: 'transparent',
     },
     copyButtonText: {
        fontSize: 12,
        fontWeight: '500',
        color: colors.copyButtonText,
     },
     copyButtonTextSuccess: {
        color: colors.copySuccessText,
     },
    errorBox: {
      borderWidth: 1,
      borderColor: colors.errorBorder,
      backgroundColor: colors.errorBackground,
      borderRadius: 6,
      padding: 10,
      marginBottom: 15,
    },
    errorText: {
      color: colors.errorText,
      fontSize: 14,
      fontWeight: '500',
    },
    rawTextOutput: {
      fontSize: 15,
      color: colors.text,
      lineHeight: 22,
      fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', // Monospace looks better for raw
      marginTop: 5, // Add space below copy button
      paddingTop: 30, // Extra padding to ensure button doesn't overlap initially
    },
  });
};

// --- Markdown Styles --- (Separate for clarity)
const markdownStyles = (colorScheme) => {
  const isDark = colorScheme === 'dark';
  const colors = {
      text: isDark ? '#e5e7eb' : '#1f2937',
      heading: isDark ? '#f3f4f6' : '#111827',
      link: isDark ? '#5eead4' : '#1e3a8a',
      codeBg: isDark ? '#374151' : '#e5e7eb',
      codeText: isDark ? '#e5e7eb' : '#1f2937',
      blockquoteBorder: isDark ? '#4b5563' : '#d1d5db',
      blockquoteText: isDark ? '#9ca3af' : '#6b7280',
  };
  return {
    // General text
    body: { fontSize: 15, color: colors.text, lineHeight: 22, marginTop: 5, paddingTop: 30 }, // Match raw text + space for button
    // Headings
    heading1: { fontSize: 24, fontWeight: 'bold', color: colors.heading, marginBottom: 10, marginTop: 15 },
    heading2: { fontSize: 20, fontWeight: 'bold', color: colors.heading, marginBottom: 8, marginTop: 12 },
    heading3: { fontSize: 18, fontWeight: 'bold', color: colors.heading, marginBottom: 6, marginTop: 10 },
    // Links
    link: { color: colors.link, textDecorationLine: 'underline' },
    // Code blocks
    code_block: {
      backgroundColor: colors.codeBg,
      color: colors.codeText,
      padding: 10,
      borderRadius: 4,
      fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
      marginBottom: 10,
    },
    // Inline code
    code_inline: {
      backgroundColor: colors.codeBg,
      color: colors.codeText,
      paddingHorizontal: 4, // Minimal padding
      paddingVertical: 1,
      borderRadius: 3,
      fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    },
    // Lists
    bullet_list: { marginBottom: 10 },
    ordered_list: { marginBottom: 10 },
    list_item: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: 5,
    },
     bullet_list_icon: {
       marginRight: 8,
       color: colors.text,
       // You might need to adjust size/position based on font
     },
     ordered_list_icon: {
       marginRight: 8,
       color: colors.text,
       // You might need to adjust size/position based on font
     },
    // Blockquotes
    blockquote: {
      borderLeftWidth: 4,
      borderLeftColor: colors.blockquoteBorder,
      paddingLeft: 10,
      marginLeft: 5,
      marginBottom: 10,
      backgroundColor: 'transparent', // Usually no background
    },
    // Paragraphs
    paragraph: { marginBottom: 10 },
     // Horizontal Rule
     hr: {
      backgroundColor: colors.blockquoteBorder, // Use a subtle color
      height: 1,
      marginVertical: 15,
    },
  };
}; 
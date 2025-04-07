export interface ToneDefinition {
  id: string; // Unique identifier, used in API calls and logic
  label: string; // User-facing label
  instructions?: string; // Specific prompt instructions for the AI
}

// Define all available tones
export const tones: ToneDefinition[] = [
  // --- Professional Tones (Hierarchical) ---
  {
    id: "Professional - C-Suite",
    label: "Professional - C-Suite",
    instructions:
      "Be extremely concise, authoritative, and focus on strategic implications or key outcomes. Avoid operational jargon. Assume a high-level understanding.",
  },
  {
    id: "Professional - Director",
    label: "Professional - Director",
    instructions:
      "Balance detail with clarity. Focus on actionable items, responsibilities, and clear next steps. Maintain a collaborative but decisive tone.",
  },
  {
    id: "Professional - Boss",
    label: "Professional - Boss",
    instructions:
      "Be respectful, succinct, and task-focused. Clearly state the situation, proposed actions, and any required decisions or support. Structure the information logically.",
  },
  {
    id: "Professional - Peer Group",
    label: "Professional - Peer Group",
    instructions:
      "Adopt a collaborative and collegial tone. Be open to discussion and mutual problem-solving. Focus on shared goals.",
  },
  {
    id: "Professional - Subordinates",
    label: "Professional - Subordinates",
    instructions:
      "Be approachable, clear, and motivating. Provide necessary context and explicit instructions. Offer support and encourage questions.",
  },
  {
    id: "Professional - Interns",
    label: "Professional - Interns",
    instructions:
      "Be supportive, encouraging, and explanatory. Clearly define tasks and context using simpler language. Check for understanding and offer guidance.",
  },
  // --- Other Tones (Alphabetical) ---
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

// Helper function to get instructions by tone ID
export function getToneInstructions(toneId: string): string | undefined {
  const tone = tones.find(t => t.id === toneId);
  return tone?.instructions;
}

// Default tone ID if parsing fails or none is provided
export const DEFAULT_TONE_ID = "Professional - Boss"; // Sensible default 
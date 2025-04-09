// Define the structure for a Tone Template
export interface ToneTemplate {
  id: string; // Unique identifier for the template
  name: string; // User-friendly name for the template
  description: string; // Short description of the template's purpose
  prompt_text: string; // Predefined prompt text
  tone_id: string; // The ID matching one of the available toneOptions
  context: string; // The context matching one of the available contextOptions
}

// Define example templates
export const toneTemplatesData: ToneTemplate[] = [
  {
    id: 'tpl_formal_request',
    name: 'Formal Request Email',
    description: 'A polite, formal email to request information or action.',
    prompt_text: 'Dear [Recipient Name],\n\nI am writing to formally request [details of request].\n\nCould you please provide [specific information needed] by [date/time]?\n\nThank you for your time and assistance.\n\nSincerely,\n[Your Name]',
    tone_id: 'Formal', // Matches a toneOption id
    context: 'Email', // Matches a contextOption
  },
  {
    id: 'tpl_team_update',
    name: 'Quick Team Update (Teams)',
    description: 'A brief, professional update for your team chat.',
    prompt_text: 'Quick update on [Project/Task]:\n- Status: [Current Status]\n- Next Steps: [Action Items]\n- Blockers: [Any Obstacles]\n\nLet me know if you have questions.',
    tone_id: 'Professional - Peer Group', // Matches a toneOption id
    context: 'Teams Chat', // Matches a contextOption
  },
  {
    id: 'tpl_casual_follow_up',
    name: 'Casual Follow-Up',
    description: 'A friendly, informal reminder or follow-up message.',
    prompt_text: 'Hey [Name], just wanted to quickly follow up on [topic]. Any updates? Let me know when you have a moment!',
    tone_id: 'Casual', // Matches a toneOption id
    context: 'General Text', // Matches a contextOption
  },
  {
    id: 'tpl_linkedin_share',
    name: 'LinkedIn Post Idea',
    description: 'A template for sharing an article or insight professionally.',
    prompt_text: 'Sharing an insightful article on [Topic]: [Link]\n\nMy key takeaway is [Your Insight]. Curious to hear others\' thoughts on this. #LinkedIn #ProfessionalDevelopment #[RelevantHashtag]',
    tone_id: 'Informative', // Matches a toneOption id
    context: 'LinkedIn Post', // Matches a contextOption
  },
    {
    id: 'tpl_meeting_request',
    name: 'Meeting Request (Boss)',
    description: 'A concise request to schedule a meeting with your manager.',
    prompt_text: 'Hi [Boss\'s Name], could we schedule a brief meeting to discuss [Topic]? Please let me know what time works best for you next week. Thanks!',
    tone_id: 'Professional - Boss', // Matches a toneOption id
    context: 'Email', // Matches a contextOption
  },
]; 
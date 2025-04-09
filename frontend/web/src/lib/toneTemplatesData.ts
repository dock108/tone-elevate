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
    id: 'tpl_project_delay',
    name: 'Project Delay Update',
    description: 'When you need to communicate delays or setbacks professionally',
    prompt_text: `ugh this is not great... we're definitely not hitting that March deadline. qa found some major security issues, design changes took longer than expected, and the client kept changing requirements. probably looking at 2-3 weeks delay minimum. need to let everyone know but don't want to cause panic`,
    tone_id: 'Professional - Director',
    context: 'Email',
  },
  {
    id: 'tpl_feedback_response',
    name: 'Feedback Response',
    description: 'When you want to acknowledge feedback while maintaining your position',
    prompt_text: `just got your feedback on the proposal - thanks for the detailed review! love most of your suggestions especially around the timeline and budget. but honestly not sure about restructuring the whole technical approach this late... maybe we can find a middle ground?`,
    tone_id: 'Professional - Peer Group',
    context: 'Teams Chat',
  },
  {
    id: 'tpl_celebration_post',
    name: 'Team Win Announcement',
    description: 'Share good news or celebrate achievements',
    prompt_text: `YES!! team crushed it today - final presentation went amazing, client literally said it was the best pitch they've seen all year! sarah's demo was perfect, alex handled the tough questions like a pro, and everyone's energy was just *chefs kiss* need to give the team a proper shoutout`,
    tone_id: 'Enthusiastic',
    context: 'LinkedIn Post',
  },
  {
    id: 'tpl_meeting_reschedule',
    name: 'Meeting Reschedule',
    description: 'When you need to move or cancel a meeting last minute',
    prompt_text: `hey really sorry but something urgent came up with the client - their prod system is having issues and we need all hands on deck. can we move our 2pm sync? should be resolved by tomorrow morning. know this is last minute :/`,
    tone_id: 'Professional - Peer Group',
    context: 'Teams Chat',
  },
  {
    id: 'tpl_code_review',
    name: 'Code Review Feedback',
    description: 'Provide constructive feedback on code or technical work',
    prompt_text: `looked through your PR - code is super clean and love the new error handling! couple thoughts: might want to add some more comments in the auth flow (gets a bit complex), and maybe we should split that huge utils file into smaller modules? also found a small memory leak in the websocket connection`,
    tone_id: 'Professional - Peer Group',
    context: 'GitHub Comment',
  },
  {
    id: 'tpl_resource_request',
    name: 'Resource Request',
    description: 'When you need to ask for additional team members or budget',
    prompt_text: `been crunching the numbers for next quarter... we're definitely understaffed for what's coming. need at least 2 more senior devs and maybe a designer? current team is burning out trying to keep up with all the new features. plus the cloud costs are way higher than we planned. should probably loop in finance too`,
    tone_id: 'Professional - Director',
    context: 'Email',
  },
  {
    id: 'tpl_conflict_resolution',
    name: 'Team Conflict Resolution',
    description: 'Address disagreements or tensions professionally',
    prompt_text: `getting worried about the tension between the frontend and backend teams... lots of finger pointing about these api changes. need to smooth things over without taking sides. maybe we should do a proper retro? both teams have valid points but this blame game isn't helping anyone`,
    tone_id: 'Professional - Boss',
    context: 'Teams Chat',
  }
]; 
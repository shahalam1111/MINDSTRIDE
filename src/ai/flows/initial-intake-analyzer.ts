
'use server';
/**
 * @fileOverview Analyzes the user's initial intake form data to identify key areas of concern and potential support needs,
 * providing deep, analytical insights and research-informed recommendations for mood enhancement.
 *
 * - analyzeInitialIntake - A function that analyzes the initial intake data.
 * - InitialIntakeInput - The input type for the analyzeInitialIntake function.
 * - InitialIntakeOutput - The return type for the analyzeInitialIntake function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EXERCISE_FREQUENCY_OPTIONS = [
  'None', '1-2 times per week', '3-4 times per week', '5-6 times per week', 'Daily'
] as const;

const InitialIntakeInputSchema = z.object({
  fullName: z.string().optional().describe('The full name of the user.'),
  age: z.number().describe('The age of the user. Must be 18 or older.'),
  gender: z.enum(['Male', 'Female', 'Non-binary', 'Prefer not to say']).describe('The gender of the user.'),
  location: z.string().describe('The city and timezone of the user.'),
  diagnosisHistory: z.enum(['Yes', 'No', 'Prefer not to say']).describe('Whether the user has been diagnosed with any mental health conditions.'),
  diagnoses: z.array(z.string()).optional().describe('List of mental health conditions the user has been diagnosed with.'),
  currentTreatment: z.enum(['Yes', 'No', 'Prefer not to say']).describe('Whether the user is currently seeing a therapist or mental health professional.'),
  sleepPatterns: z.number().min(3).max(12).describe('Average hours of sleep per night (scale 3-12).'),
  exerciseFrequency: z.enum(EXERCISE_FREQUENCY_OPTIONS).describe('Weekly exercise sessions.'),
  substanceUse: z.enum(['Yes often', 'Occasionally', 'No']).describe('Alcohol and smoking habits.'),
  currentStressLevel: z.number().min(1).max(10).describe('Stress level on a scale from 1 to 10.'),
  todayMood: z.string().describe('Emoji representing the user\'s mood today.'),
  frequentEmotions: z.array(z.string()).describe('List of frequent emotions experienced by the user.'),
  supportAreas: z.array(z.string()).describe('Areas in which the user seeks support (e.g., managing stress, building better habits).'),
  contentPreferences: z.array(z.string()).describe('Types of content the user prefers (e.g., text articles, guided meditations).'),
  checkInFrequency: z.enum(['Daily', 'Weekly', 'Only when I ask']).describe('Preferred frequency for check-ins.'),
  preferredTime: z.enum(['Morning', 'Afternoon', 'Evening', 'Night']).describe('Preferred time for check-ins.'),
  additionalInformation: z.string().optional().describe('Any additional information the user wants to share, which should be carefully considered for nuanced insights.'),
});
export type InitialIntakeInput = z.infer<typeof InitialIntakeInputSchema>;

const InitialIntakeOutputSchema = z.object({
  keyConcerns: z.array(z.string()).describe('List of 2-3 primary areas of concern or potential challenges for the user, identified from deep analysis of all intake data.'),
  suggestedSupportNeeds: z.array(z.string()).describe('List of 2-3 types of support or resources that might be beneficial for the user based on their concerns.'),
  personalizedRecommendations: z.array(z.string()).describe("List of 2-3 actionable, empathetic, and analytical recommendations specifically aimed at mood enhancement, stress reduction, or addressing key concerns. Each recommendation should be grounded in psychological principles/common research findings and briefly explain the 'why' or how it helps. These should be distinct from general advice and tailored to the user's profile."),
});
export type InitialIntakeOutput = z.infer<typeof InitialIntakeOutputSchema>;

export async function analyzeInitialIntake(input: InitialIntakeInput): Promise<InitialIntakeOutput> {
  return analyzeInitialIntakeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'initialIntakePrompt',
  input: {schema: InitialIntakeInputSchema},
  output: {schema: InitialIntakeOutputSchema},
  prompt: `You are an advanced AI assistant specialized in analyzing mental health intake forms. Your primary function is to provide deep, analytical insights and supportive, research-informed recommendations to help users understand themselves better and enhance their mood and overall well-being. You must process all provided information meticulously, paying close attention to 'Additional Information' for nuanced understanding and context. Your recommendations should be actionable and sound as if derived from reputable mental health research and advice (e.g., principles from CBT, mindfulness, positive psychology).

User's Intake Information:
Full Name: {{{fullName}}}
Age: {{{age}}}
Gender: {{{gender}}}
Location: {{{location}}}
Diagnosis History: {{{diagnosisHistory}}}
Diagnoses: {{#if diagnoses}}{{#each diagnoses}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}{{else}}None specified{{/if}}
Current Treatment: {{{currentTreatment}}}
Sleep Patterns: {{{sleepPatterns}}} hours
Exercise Frequency: {{{exerciseFrequency}}}
Substance Use: {{{substanceUse}}}
Current Stress Level: {{{currentStressLevel}}} (1-10 scale)
Today's Mood: {{{todayMood}}}
Frequent Emotions: {{#if frequentEmotions}}{{#each frequentEmotions}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}{{else}}None specified{{/if}}
Support Areas: {{#if supportAreas}}{{#each supportAreas}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}{{else}}None specified{{/if}}
Content Preferences: {{#if contentPreferences}}{{#each contentPreferences}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}{{else}}None specified{{/if}}
Check-in Frequency: {{{checkInFrequency}}}
Preferred Time: {{{preferredTime}}}
Additional Information: {{{additionalInformation}}}

Based on ALL the information above, including a careful review of any "Additional Information", please generate the following output strictly adhering to the output schema:
1.  keyConcerns: Identify 2-3 primary areas of concern or potential challenges for the user. Be specific and analytical.
2.  suggestedSupportNeeds: List 2-3 types of support or resources that might be beneficial for the user, directly linked to the identified key concerns.
3.  personalizedRecommendations: Provide 2-3 actionable, empathetic, and analytical recommendations specifically aimed at mood enhancement, stress reduction, or addressing key concerns. These recommendations must be grounded in well-established psychological principles and common research findings. For each recommendation, briefly explain the 'why' behind it or how it might help the user. Ensure these are distinct from generic advice and are clearly tailored to the user's specific profile as detailed in their intake.
  `,
});

const analyzeInitialIntakeFlow = ai.defineFlow(
  {
    name: 'analyzeInitialIntakeFlow',
    inputSchema: InitialIntakeInputSchema,
    outputSchema: InitialIntakeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

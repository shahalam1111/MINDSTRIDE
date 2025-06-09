'use server';
/**
 * @fileOverview Analyzes the user's initial intake form data to identify key areas of concern and potential support needs.
 *
 * - analyzeInitialIntake - A function that analyzes the initial intake data.
 * - InitialIntakeInput - The input type for the analyzeInitialIntake function.
 * - InitialIntakeOutput - The return type for the analyzeInitialIntake function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const InitialIntakeInputSchema = z.object({
  fullName: z.string().optional().describe('The full name of the user.'),
  age: z.number().describe('The age of the user. Must be 18 or older.'),
  gender: z.enum(['Male', 'Female', 'Non-binary', 'Prefer not to say']).describe('The gender of the user.'),
  location: z.string().describe('The city and timezone of the user.'),
  diagnosisHistory: z.enum(['Yes', 'No', 'Prefer not to say']).describe('Whether the user has been diagnosed with any mental health conditions.'),
  diagnoses: z.array(z.string()).optional().describe('List of mental health conditions the user has been diagnosed with.'),
  currentTreatment: z.enum(['Yes', 'No', 'Prefer not to say']).describe('Whether the user is currently seeing a therapist or mental health professional.'),
  sleepPatterns: z.number().describe('Average hours of sleep per night.'),
  exerciseFrequency: z.number().describe('Weekly exercise sessions.'),
  substanceUse: z.enum(['Yes often', 'Occasionally', 'No']).describe('Alcohol and smoking habits.'),
  currentStressLevel: z.number().min(1).max(10).describe('Stress level on a scale from 1 to 10.'),
  todayMood: z.string().describe('Emoji representing the user\'s mood today.'),
  frequentEmotions: z.array(z.string()).describe('List of frequent emotions experienced by the user.'),
  supportAreas: z.array(z.string()).describe('Areas in which the user seeks support (e.g., managing stress, building better habits).'),
  contentPreferences: z.array(z.string()).describe('Types of content the user prefers (e.g., text articles, guided meditations).'),
  checkInFrequency: z.enum(['Daily', 'Weekly', 'Only when I ask']).describe('Preferred frequency for check-ins.'),
  preferredTime: z.enum(['Morning', 'Afternoon', 'Evening', 'Night']).describe('Preferred time for check-ins.'),
  additionalInformation: z.string().optional().describe('Any additional information the user wants to share.'),
});
export type InitialIntakeInput = z.infer<typeof InitialIntakeInputSchema>;

const InitialIntakeOutputSchema = z.object({
  keyConcerns: z.array(z.string()).describe('List of key areas of concern identified from the intake data.'),
  suggestedSupportNeeds: z.array(z.string()).describe('List of suggested support needs based on the intake data.'),
  personalizedRecommendations: z.array(z.string()).describe('List of personalized recommendations for the user.'),
});
export type InitialIntakeOutput = z.infer<typeof InitialIntakeOutputSchema>;

export async function analyzeInitialIntake(input: InitialIntakeInput): Promise<InitialIntakeOutput> {
  return analyzeInitialIntakeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'initialIntakePrompt',
  input: {schema: InitialIntakeInputSchema},
  output: {schema: InitialIntakeOutputSchema},
  prompt: `You are an AI assistant specialized in analyzing mental health intake forms.

  Based on the following information provided by the user, identify key areas of concern, suggest support needs, and provide personalized recommendations.

  Full Name: {{{fullName}}}
  Age: {{{age}}}
  Gender: {{{gender}}}
  Location: {{{location}}}
  Diagnosis History: {{{diagnosisHistory}}}
  Diagnoses: {{#each diagnoses}}{{{this}}}, {{/each}}
  Current Treatment: {{{currentTreatment}}}
  Sleep Patterns: {{{sleepPatterns}}} hours
  Exercise Frequency: {{{exerciseFrequency}}} sessions per week
  Substance Use: {{{substanceUse}}}
  Current Stress Level: {{{currentStressLevel}}} (1-10 scale)
  Today's Mood: {{{todayMood}}}
  Frequent Emotions: {{#each frequentEmotions}}{{{this}}}, {{/each}}
  Support Areas: {{#each supportAreas}}{{{this}}}, {{/each}}
  Content Preferences: {{#each contentPreferences}}{{{this}}}, {{/each}}
  Check-in Frequency: {{{checkInFrequency}}}
  Preferred Time: {{{preferredTime}}}
  Additional Information: {{{additionalInformation}}}
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

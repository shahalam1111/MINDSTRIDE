// src/ai/flows/ai-chatbot-assistant.ts
'use server';

/**
 * @fileOverview AI Chatbot assistant that personalizes its responses based on user intake form data.
 *
 * - aiChatbotAssistant - A function that handles the chatbot interaction.
 * - AIChatbotAssistantInput - The input type for the aiChatbotAssistant function.
 * - AIChatbotAssistantOutput - The return type for the aiChatbotAssistant function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';


const AIChatbotAssistantInputSchema = z.object({
  message: z.string().describe('The user message to the chatbot.'),
  name: z.string().optional().describe('The user name.'),
  age: z.number().optional().describe('The user age.'),
  gender: z.string().optional().describe('The user gender.'),
  location: z.string().optional().describe('The user location.'),
  diagnosisHistory: z.string().optional().describe('The user diagnosis history.'),
  currentTreatment: z.string().optional().describe('The user current treatment.'),
  sleepPatterns: z.number().optional().describe('The user sleep patterns.'),
  exerciseFrequency: z.string().optional().describe('The user exercise frequency.'),
  substanceUse: z.string().optional().describe('The user substance use.'),
  currentStressLevel: z.number().optional().describe('The user current stress level.'),
  todayMood: z.string().optional().describe('The user current mood.'),
  frequentEmotions: z.string().optional().describe('The user frequent emotions.'),
  supportAreas: z.string().optional().describe('The user preferred support areas.'),
  contentPreferences: z.string().optional().describe('The user content preferences.'),
});

export type AIChatbotAssistantInput = z.infer<typeof AIChatbotAssistantInputSchema>;

const AIChatbotAssistantOutputSchema = z.object({
  response: z.string().describe('The chatbot response to the user message.'),
});

export type AIChatbotAssistantOutput = z.infer<typeof AIChatbotAssistantOutputSchema>;

export async function aiChatbotAssistant(input: AIChatbotAssistantInput): Promise<AIChatbotAssistantOutput> {
  return aiChatbotAssistantFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiChatbotAssistantPrompt',
  input: {schema: AIChatbotAssistantInputSchema},
  output: {schema: AIChatbotAssistantOutputSchema},
  prompt: `You are a mental health support chatbot designed to provide personalized assistance based on user data.

  Here is some information about the user:
  {{#if name}}Name: {{{name}}}{{/if}}
  {{#if age}}Age: {{{age}}}{{/if}}
  {{#if gender}}Gender: {{{gender}}}{{/if}}
  {{#if location}}Location: {{{location}}}{{/if}}
  {{#if diagnosisHistory}}Diagnosis History: {{{diagnosisHistory}}}{{/if}}
  {{#if currentTreatment}}Current Treatment: {{{currentTreatment}}}{{/if}}
  {{#if sleepPatterns}}Sleep Patterns: {{{sleepPatterns}}}{{/if}}
  {{#if exerciseFrequency}}Exercise Frequency: {{{exerciseFrequency}}}{{/if}}
  {{#if substanceUse}}Substance Use: {{{substanceUse}}}{{/if}}
  {{#if currentStressLevel}}Current Stress Level: {{{currentStressLevel}}}{{/if}}
  {{#if todayMood}}Today\'s Mood: {{{todayMood}}}{{/if}}
  {{#if frequentEmotions}}Frequent Emotions: {{{frequentEmotions}}}{{/if}}
  {{#if supportAreas}}Support Areas: {{{supportAreas}}}{{/if}}
  {{#if contentPreferences}}Content Preferences: {{{contentPreferences}}}{{/if}}

  Now, respond to the following message from the user, taking into account the user's information to provide personalized and relevant support:
  User Message: {{{message}}}
  `,
});

const aiChatbotAssistantFlow = ai.defineFlow(
  {
    name: 'aiChatbotAssistantFlow',
    inputSchema: AIChatbotAssistantInputSchema,
    outputSchema: AIChatbotAssistantOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

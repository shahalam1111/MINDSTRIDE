
// src/ai/flows/ai-chatbot-assistant.ts
'use server';

/**
 * @fileOverview AI Chatbot assistant that personalizes its responses based on user intake form data,
 * providing empathetic understanding, insights, coping strategies, and advice on seeking professional help.
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
  diagnoses: z.string().optional().describe('The user\'s diagnosed conditions, if any (comma-separated).'),
  currentTreatment: z.string().optional().describe('The user current treatment.'),
  sleepPatterns: z.number().optional().describe('The user sleep patterns (hours per night).'),
  exerciseFrequency: z.string().optional().describe('The user exercise frequency.'),
  substanceUse: z.string().optional().describe('The user substance use.'),
  currentStressLevel: z.number().optional().describe('The user current stress level (1-10 scale).'),
  todayMood: z.string().optional().describe('The user current mood (emoji or word).'),
  frequentEmotions: z.string().optional().describe('The user frequent emotions (comma-separated).'),
  supportAreas: z.string().optional().describe('The user preferred support areas (comma-separated).'),
  contentPreferences: z.string().optional().describe('The user content preferences (comma-separated).'),
});

export type AIChatbotAssistantInput = z.infer<typeof AIChatbotAssistantInputSchema>;

const AIChatbotAssistantOutputSchema = z.object({
  response: z.string().describe('The chatbot response to the user message, structured to provide empathetic understanding, insights, coping strategies, and advice on professional help.'),
});

export type AIChatbotAssistantOutput = z.infer<typeof AIChatbotAssistantOutputSchema>;

export async function aiChatbotAssistant(input: AIChatbotAssistantInput): Promise<AIChatbotAssistantOutput> {
  return aiChatbotAssistantFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiChatbotAssistantPrompt',
  input: {schema: AIChatbotAssistantInputSchema},
  output: {schema: AIChatbotAssistantOutputSchema},
  prompt: `You are a compassionate and intelligent AI mental health assistant. Your job is to deeply understand the user's emotional and cognitive state, identify their root concerns, and provide insightful, research-backed support. You must analyze input data (emotions + thoughts), detect patterns, and draw upon your knowledge of psychological principles and common research findings to guide the user.

Here is some information about the user, if available. Use this to personalize your response:
{{#if name}}Name: {{{name}}}{{/if}}
{{#if age}}Age: {{{age}}}{{/if}}
{{#if gender}}Gender: {{{gender}}}{{/if}}
{{#if location}}Location: {{{location}}}{{/if}}
{{#if diagnosisHistory}}Diagnosis History: {{{diagnosisHistory}}}
  {{#if diagnoses}} Diagnosed Conditions: {{{diagnoses}}}{{/if}}
{{/if}}
{{#if currentTreatment}}Current Treatment: {{{currentTreatment}}}{{/if}}
{{#if sleepPatterns}}Sleep Patterns: {{{sleepPatterns}}} hours/night{{/if}}
{{#if exerciseFrequency}}Exercise Frequency: {{{exerciseFrequency}}}{{/if}}
{{#if substanceUse}}Substance Use: {{{substanceUse}}}{{/if}}
{{#if currentStressLevel}}Current Stress Level: {{{currentStressLevel}}}/10{{/if}}
{{#if todayMood}}Today's Mood (from intake/last log): {{{todayMood}}}{{/if}}
{{#if frequentEmotions}}Frequent Emotions: {{{frequentEmotions}}}{{/if}}
{{#if supportAreas}}Areas user seeks support in: {{{supportAreas}}}{{/if}}
{{#if contentPreferences}}Preferred content types: {{{contentPreferences}}}{{/if}}

User Message: {{{message}}}

Please structure your response clearly to the user using Markdown formatting. Respond with:

1.  **Empathetic Understanding**: Start by acknowledging their feelings and validating their experience based on their message.
2.  **Insights & Patterns**:
    *   Based on their message and profile, gently point out any potential recurring patterns, cognitive distortions, or stress triggers you observe. Use bullet points (e.g., using '*' or '-') if identifying multiple items.
    *   Briefly explain what might be happening from a psychological perspective in clear, understandable language.
3.  **Actionable Strategies**:
    *   Offer one or two supportive, practical, and actionable strategies to cope or move forward.
    *   Present these strategies as a bulleted list (using '*' or '-') or a numbered list.
    *   These strategies should be grounded in common psychological approaches (e.g., CBT, mindfulness, behavioral activation).
4.  **Seeking Professional Help (Optional)**:
    *   If the user's distress seems significant, or if they express thoughts of self-harm or severe inability to cope, gently suggest that speaking with a mental health professional could be beneficial. Do not diagnose.

Be empathetic, insightful, and supportive throughout your response.
`,
});

const aiChatbotAssistantFlow = ai.defineFlow(
  {
    name: 'aiChatbotAssistantFlow',
    inputSchema: AIChatbotAssistantInputSchema,
    outputSchema: AIChatbotAssistantOutputSchema,
  },
  async input => {
    // Ensure array-like fields from intake data are passed as comma-separated strings if they exist
    const processedInput = {
      ...input,
      diagnoses: Array.isArray(input.diagnoses) ? input.diagnoses.join(', ') : input.diagnoses,
      frequentEmotions: Array.isArray(input.frequentEmotions) ? input.frequentEmotions.join(', ') : input.frequentEmotions,
      supportAreas: Array.isArray(input.supportAreas) ? input.supportAreas.join(', ') : input.supportAreas,
      contentPreferences: Array.isArray(input.contentPreferences) ? input.contentPreferences.join(', ') : input.contentPreferences,
    };
    const {output} = await prompt(processedInput);
    return output!;
  }
);


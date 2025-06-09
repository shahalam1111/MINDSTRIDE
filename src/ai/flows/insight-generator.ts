'use server';
/**
 * @fileOverview Generates personalized insights from user's mood, stress levels, and sleep patterns.
 *
 * - generateInsights - A function that generates personalized insights.
 * - InsightGeneratorInput - The input type for the generateInsights function.
 * - InsightGeneratorOutput - The return type for the generateInsights function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const InsightGeneratorInputSchema = z.object({
  moodTimeline: z.string().describe('A timeline of the user\'s mood.'),
  stressLevelPatterns: z.string().describe('The user\'s stress level patterns.'),
  sleepCorrelation: z.string().describe('The correlation between sleep quality and mood patterns.'),
});
export type InsightGeneratorInput = z.infer<typeof InsightGeneratorInputSchema>;

const InsightGeneratorOutputSchema = z.object({
  insights: z.string().describe('Personalized insights generated from the user\'s data.'),
});
export type InsightGeneratorOutput = z.infer<typeof InsightGeneratorOutputSchema>;

export async function generateInsights(input: InsightGeneratorInput): Promise<InsightGeneratorOutput> {
  return insightGeneratorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'insightGeneratorPrompt',
  input: {schema: InsightGeneratorInputSchema},
  output: {schema: InsightGeneratorOutputSchema},
  prompt: `You are an AI assistant specialized in providing personalized mental health insights.

  Based on the user's tracked data, generate insights that can help them understand potential triggers, their progress, and make informed decisions about their well-being.

  Mood Timeline: {{{moodTimeline}}}
  Stress Level Patterns: {{{stressLevelPatterns}}}
  Sleep Correlation: {{{sleepCorrelation}}}

  Provide concise and actionable insights.`,
});

const insightGeneratorFlow = ai.defineFlow(
  {
    name: 'insightGeneratorFlow',
    inputSchema: InsightGeneratorInputSchema,
    outputSchema: InsightGeneratorOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);


'use server';
/**
 * @fileOverview Generates personalized insights from user's intake data, mood, and stress levels.
 *
 * - generateInsights - A function that generates personalized insights.
 * - InsightGeneratorInput - The input type for the generateInsights function.
 * - InsightGeneratorOutput - The return type for the generateInsights function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const InsightGeneratorInputSchema = z.object({
  intakeSummary: z.string().describe('A summary of key points from the user\'s intake data, like interests, reported mood, or concerns.'),
  lastMood: z.string().optional().describe('The user\'s last logged mood (e.g., an emoji or a word).'),
  currentStressLevel: z.number().optional().describe('The user\'s self-reported current stress level (e.g., on a scale of 1-10).'),
});
export type InsightGeneratorInput = z.infer<typeof InsightGeneratorInputSchema>;

const InsightGeneratorOutputSchema = z.object({
  insightText: z.string().describe('A short, personalized, and encouraging insight or tip based on the user\'s data (1-2 sentences).'),
});
export type InsightGeneratorOutput = z.infer<typeof InsightGeneratorOutputSchema>;

export async function generateInsights(input: InsightGeneratorInput): Promise<InsightGeneratorOutput> {
  return insightGeneratorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'insightGeneratorPrompt',
  input: {schema: InsightGeneratorInputSchema},
  output: {schema: InsightGeneratorOutputSchema},
  prompt: `You are a supportive AI companion. Based on the following user information, provide a short, personalized, and encouraging insight or tip to help them with their well-being today.

User Profile Summary: {{{intakeSummary}}}
{{#if lastMood}}Their last recorded mood was: {{{lastMood}}}{{/if}}
{{#if currentStressLevel}}Their current stress level is reported as: {{{currentStressLevel}}} out of 10.{{/if}}

Generate a single, concise insight (1-2 sentences). Aim for a positive and actionable tone.
For example, if they are stressed and interested in meditation, you might suggest a brief mindfulness exercise.
If they are feeling good, you might encourage them to savor the moment or plan something enjoyable.
If no specific mood or stress is mentioned, offer a general wellness tip based on their intake summary.
`,
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


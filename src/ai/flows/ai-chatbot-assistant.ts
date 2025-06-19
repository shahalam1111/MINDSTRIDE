
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

// Re-using some enums might be good if they are stable, or define them here if they can diverge
const YES_NO_OPTIONS = ['Yes', 'No'] as const;
const PANIC_ANXIETY_FREQUENCY_OPTIONS = ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'] as const;
const DETAILED_MOOD_OPTIONS = ['Happy', 'Sad', 'Anxious', 'Overwhelmed', 'Numb', 'Other'] as const;
const AVG_SLEEP_HOURS_OPTIONS = ['Less than 4', '4-6', '6-8', 'More than 8'] as const;
const APPETITE_CHANGE_OPTIONS = ['Increased', 'Decreased', 'No Change'] as const;
const EXERCISE_FREQUENCY_DETAILED_OPTIONS = ['Daily', '2-3/week', 'Rarely', 'Never'] as const;
const SUBSTANCE_COPING_OPTIONS = ['Never', 'Occasionally', 'Frequently'] as const;
const SOCIAL_SUPPORT_OPTIONS = ['Yes', 'No', 'Sometimes'] as const;


const AIChatbotAssistantInputSchema = z.object({
  message: z.string().describe('The user message to the chatbot.'),
  // Existing profile fields
  name: z.string().optional().describe('The user name.'),
  age: z.number().optional().describe('The user age.'),
  gender: z.string().optional().describe('The user gender.'),
  location: z.string().optional().describe('The user location.'),
  diagnosisHistory: z.string().optional().describe('The user diagnosis history.'),
  diagnoses: z.string().optional().describe('The user\'s diagnosed conditions, if any (comma-separated).'),
  currentTreatment: z.string().optional().describe('The user current treatment.'),
  sleepPatterns: z.number().optional().describe('The user sleep patterns (hours per night - original measure).'),
  exerciseFrequency: z.string().optional().describe('The user exercise frequency (original measure).'),
  substanceUse: z.string().optional().describe('The user substance use (original measure).'),
  currentStressLevel: z.number().optional().describe('The user current stress level (1-10 scale).'),
  todayMood: z.string().optional().describe('The user current mood (emoji or word - quick check).'),
  frequentEmotions: z.string().optional().describe('The user frequent emotions (comma-separated).'),
  supportAreas: z.string().optional().describe('The user preferred support areas (comma-separated).'),
  contentPreferences: z.string().optional().describe('The user content preferences (comma-separated).'),
  
  // New fields from expanded intake form (all optional for chat context)
  sadnessFrequencyWeekly: z.number().optional().describe('Frequency of feeling sad/low in the past week (1-10).'),
  panicAttackFrequency: z.enum(PANIC_ANXIETY_FREQUENCY_OPTIONS).optional().describe('Frequency of sudden panic or anxiety feelings.'),
  moodTodayDetailed: z.enum(DETAILED_MOOD_OPTIONS).optional().describe('Detailed description of mood today.'),
  otherMoodToday: z.string().optional().describe('Specification if "Other" mood was selected.'),
  hopelessPastTwoWeeks: z.enum(YES_NO_OPTIONS).optional().describe('Whether the user felt hopeless or unmotivated in the past two weeks.'),
  hopelessDescription: z.string().optional().describe('Description if user felt hopeless.'),
  currentWorryIntensity: z.number().optional().describe('Intensity of current worry or stress (1-10).'),
  averageSleepHoursNightly: z.enum(AVG_SLEEP_HOURS_OPTIONS).optional().describe('Average hours of sleep per night (detailed measure).'),
  appetiteChanges: z.enum(APPETITE_CHANGE_OPTIONS).optional().describe('Recent changes in appetite or eating habits.'),
  socialAvoidanceFrequency: z.number().optional().describe('Frequency of avoiding social interactions (1:Never-5:Always).'),
  repetitiveBehaviors: z.enum(YES_NO_OPTIONS).optional().describe('Whether the user engages in repetitive behaviors.'),
  repetitiveBehaviorsDescription: z.string().optional().describe('Description of repetitive behaviors if any.'),
  exerciseFrequencyDetailed: z.enum(EXERCISE_FREQUENCY_DETAILED_OPTIONS).optional().describe('Frequency of exercise or physical activity (detailed measure).'),
  physicalSymptomsFrequency: z.number().optional().describe('Frequency of physical symptoms like headaches or fatigue (1:Never-5:Always).'),
  substanceUseCoping: z.enum(SUBSTANCE_COPING_OPTIONS).optional().describe('Frequency of using substances to cope with stress.'),
  workSchoolStressLevel: z.number().optional().describe('Stress level at work/school (1-10).'),
  concentrationDifficultyFrequency: z.number().optional().describe('Frequency of difficulty concentrating or making decisions (1:Never-5:Always).'),
  recurringNegativeThoughts: z.enum(YES_NO_OPTIONS).optional().describe('Whether the user has recurring negative thoughts or worries.'),
  negativeThoughtsDescription: z.string().optional().describe('Description of recurring negative thoughts if any.'),
  overwhelmedByTasksFrequency: z.number().optional().describe('Frequency of feeling overwhelmed by daily tasks (1:Never-5:Always).'),
  hopefulnessFuture: z.number().optional().describe('Level of hopefulness about the future (1-10).'),
  mentalHealthMedication: z.enum(YES_NO_OPTIONS).optional().describe('Whether the user currently takes mental health medication.'),
  medicationDetails: z.string().optional().describe('Details about mental health medication if taken.'),
  socialSupportAvailability: z.enum(SOCIAL_SUPPORT_OPTIONS).optional().describe('Availability of someone to talk to about feelings.'),
  recentLifeChanges: z.enum(YES_NO_OPTIONS).optional().describe('Whether the user experienced major life changes recently.'),
  lifeChangesDescription: z.string().optional().describe('Brief description of recent major life changes.'),
  additionalInformation: z.string().optional().describe('Any additional information shared by the user in their intake.'),
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
**Basic Information:**
{{#if name}}Name: {{{name}}}{{/if}}
{{#if age}}Age: {{{age}}}{{/if}}
{{#if gender}}Gender: {{{gender}}}{{/if}}
{{#if location}}Location: {{{location}}}{{/if}}

**Mental Health Background (from intake):**
{{#if diagnosisHistory}}Diagnosis History: {{{diagnosisHistory}}}
  {{#if diagnoses}} Diagnosed Conditions: {{{diagnoses}}}{{/if}}
{{/if}}
{{#if currentTreatment}}Current Treatment: {{{currentTreatment}}}{{/if}}
{{#if mentalHealthMedication}}Taking Mental Health Medication: {{{mentalHealthMedication}}}
  {{#if medicationDetails}} Details: {{{medicationDetails}}}{{/if}}
{{/if}}

**Recent Emotional State & Patterns (from intake, if available):**
{{#if sadnessFrequencyWeekly}}Sadness Frequency (past week, 1-10): {{{sadnessFrequencyWeekly}}}{{/if}}
{{#if panicAttackFrequency}}Panic/Anxiety Attack Frequency: {{{panicAttackFrequency}}}{{/if}}
{{#if moodTodayDetailed}}Mood Today (Detailed from intake): {{{moodTodayDetailed}}}
  {{#if otherMoodToday}} (Specified: {{{otherMoodToday}}}){{/if}}
{{/if}}
{{#if hopelessPastTwoWeeks}}Felt Hopeless (past 2 weeks): {{{hopelessPastTwoWeeks}}}
  {{#if hopelessDescription}} (Description: {{{hopelessDescription}}}){{/if}}
{{/if}}
{{#if currentWorryIntensity}}Current Worry/Stress Intensity (1-10): {{{currentWorryIntensity}}}{{/if}}
{{#if frequentEmotions}}Frequent Emotions (from intake): {{{frequentEmotions}}}{{/if}}
{{#if todayMood}}Today's Mood (quick check from intake): {{{todayMood}}}{{/if}}

**Behavioral Patterns (from intake):**
{{#if sleepPatterns}}Sleep (original measure): {{{sleepPatterns}}} hours/night{{/if}}
{{#if averageSleepHoursNightly}}Sleep (detailed measure): {{{averageSleepHoursNightly}}} per night{{/if}}
{{#if appetiteChanges}}Appetite Changes: {{{appetiteChanges}}}{{/if}}
{{#if socialAvoidanceFrequency}}Social Avoidance Frequency (1:Never-5:Always): {{{socialAvoidanceFrequency}}}{{/if}}
{{#if repetitiveBehaviors}}Engaging in Repetitive Behaviors: {{{repetitiveBehaviors}}}
  {{#if repetitiveBehaviorsDescription}} (Description: {{{repetitiveBehaviorsDescription}}}){{/if}}
{{/if}}

**Physical & Lifestyle (from intake):**
{{#if exerciseFrequency}}Exercise (original measure): {{{exerciseFrequency}}}{{/if}}
{{#if exerciseFrequencyDetailed}}Exercise (detailed measure): {{{exerciseFrequencyDetailed}}}{{/if}}
{{#if physicalSymptomsFrequency}}Physical Symptoms Frequency (1:Never-5:Always): {{{physicalSymptomsFrequency}}}{{/if}}
{{#if substanceUse}}Substance Use (general habits): {{{substanceUse}}}{{/if}}
{{#if substanceUseCoping}}Substance Use for Coping: {{{substanceUseCoping}}}{{/if}}
{{#if currentStressLevel}}Overall Stress Level (1-10 from intake): {{{currentStressLevel}}}/10{{/if}}
{{#if workSchoolStressLevel}}Work/School Stress Level (1-10 from intake): {{{workSchoolStressLevel}}}/10{{/if}}

**Cognitive Patterns (from intake):**
{{#if concentrationDifficultyFrequency}}Difficulty Concentrating/Making Decisions (1:Never-5:Always): {{{concentrationDifficultyFrequency}}}{{/if}}
{{#if recurringNegativeThoughts}}Recurring Negative Thoughts: {{{recurringNegativeThoughts}}}
  {{#if negativeThoughtsDescription}} (Description: {{{negativeThoughtsDescription}}}){{/if}}
{{/if}}
{{#if overwhelmedByTasksFrequency}}Overwhelmed by Daily Tasks (1:Never-5:Always): {{{overwhelmedByTasksFrequency}}}{{/if}}
{{#if hopefulnessFuture}}Hopefulness about Future (1-10 from intake): {{{hopefulnessFuture}}}/10{{/if}}

**Support System & History (from intake):**
{{#if socialSupportAvailability}}Social Support Availability: {{{socialSupportAvailability}}}{{/if}}
{{#if recentLifeChanges}}Recent Major Life Changes: {{{recentLifeChanges}}}
  {{#if lifeChangesDescription}} (Description: {{{lifeChangesDescription}}}){{/if}}
{{/if}}

**Preferences (from intake):**
{{#if supportAreas}}Areas user seeks support in: {{{supportAreas}}}{{/if}}
{{#if contentPreferences}}Preferred content types: {{{contentPreferences}}}{{/if}}

{{#if additionalInformation}}
**Additional Information Provided by User (from intake):**
{{{additionalInformation}}}
{{/if}}

User Message: {{{message}}}

Please structure your response clearly to the user using Markdown formatting. Respond with:

1.  **Empathetic Understanding**: Start by acknowledging their feelings and validating their experience based on their message.
2.  **Insights & Patterns**:
    *   Based on their message and profile (especially the detailed intake if available), gently point out any potential recurring patterns, cognitive distortions, or stress triggers you observe. Use bullet points (e.g., using '*' or '-') if identifying multiple items.
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


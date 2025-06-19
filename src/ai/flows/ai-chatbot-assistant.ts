
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
const YES_NO_OPTIONS_CHAT = ['Yes', 'No'] as const;
const PANIC_ANXIETY_FREQUENCY_OPTIONS_CHAT = ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'] as const;
const DETAILED_MOOD_OPTIONS_CHAT = ['Happy', 'Sad', 'Anxious', 'Overwhelmed', 'Numb', 'Other'] as const;
const AVG_SLEEP_HOURS_OPTIONS_CHAT = ['Less than 4', '4-6', '6-8', 'More than 8'] as const;
const APPETITE_CHANGE_OPTIONS_CHAT = ['Increased', 'Decreased', 'No Change'] as const;
const EXERCISE_FREQUENCY_DETAILED_OPTIONS_CHAT = ['Daily', '2-3/week', 'Rarely', 'Never'] as const;
const SUBSTANCE_COPING_OPTIONS_CHAT = ['Never', 'Occasionally', 'Frequently'] as const;
const SOCIAL_SUPPORT_OPTIONS_CHAT = ['Yes', 'No', 'Sometimes'] as const;
const ORIGINAL_EXERCISE_FREQ_OPTIONS_CHAT = ['None', '1-2 times per week', '3-4 times per week', '5-6 times per week', 'Daily'] as const;
const ORIGINAL_SUBSTANCE_USE_OPTIONS_CHAT = ['Yes often', 'Occasionally', 'No'] as const;


const AIChatbotAssistantInputSchema = z.object({
  message: z.string().describe('The user message to the chatbot.'),
  // Fields from StoredIntakeData (localStorage version of form values)
  name: z.string().optional().describe('The user name (from intake).'), // Corresponds to fullName
  age: z.number().optional().describe('The user age (from intake).'),
  gender: z.string().optional().describe('The user gender (from intake).'),
  location: z.string().optional().describe('The user location (city, timezone from intake).'),
  diagnosisHistory: z.string().optional().describe('User\'s stated history of mental health diagnoses (from intake).'),
  diagnoses: z.string().optional().describe('User\'s diagnosed conditions, if any (comma-separated from intake).'),
  currentTreatment: z.string().optional().describe('Whether the user is currently in treatment (from intake).'),
  
  // Original specific fields if they are distinct or provide different nuance
  sleepPatterns: z.number().optional().describe('User\'s originally reported sleep patterns (hours per night, 3-12 scale from intake).'), // Corresponds to sleepPatterns_original
  exerciseFrequency: z.string().optional().describe('User\'s originally reported exercise frequency (e.g., 1-2 times/week from intake).'), // Corresponds to exerciseFrequency_original
  substanceUse: z.string().optional().describe('User\'s originally reported general substance use habits (from intake).'), // Corresponds to substanceUse_original
  currentStressLevel: z.number().optional().describe('User\'s originally reported overall stress level (1-10 scale from intake).'), // Corresponds to currentStressLevel_original
  todayMood: z.string().optional().describe('User\'s originally reported quick mood check (emoji from intake).'), // Corresponds to todayMood_original_emoji

  frequentEmotions: z.string().optional().describe('User\'s frequently experienced emotions (comma-separated from intake).'),
  supportAreas: z.string().optional().describe('Areas where the user seeks support (comma-separated from intake).'),
  contentPreferences: z.string().optional().describe('User\'s preferred content types (comma-separated from intake).'),
  additionalInformation: z.string().optional().describe('Any additional information shared by the user in their intake form.'),
  
  // Mapped Q1-Q20 fields (more detailed from intake form)
  sadnessFrequencyWeekly: z.number().optional().describe('Frequency of feeling sad/low in the past week (1-10 from intake q1).'),
  panicAttackFrequency: z.enum(PANIC_ANXIETY_FREQUENCY_OPTIONS_CHAT).optional().describe('Frequency of sudden panic or anxiety feelings (from intake q2).'),
  moodTodayDetailed: z.string().optional().describe('Detailed description of mood today (e.g. Happy, Sad, or specified Other from intake q3).'),
  // otherMoodToday: z.string().optional().describe('Specification if "Other" mood was selected (from intake q3 - combined into moodTodayDetailed for chat).'),
  hopelessPastTwoWeeks: z.enum(YES_NO_OPTIONS_CHAT).optional().describe('Whether the user felt hopeless or unmotivated in the past two weeks (from intake q4).'),
  hopelessDescription: z.string().optional().describe('Description if user felt hopeless (from intake q4).'),
  currentWorryIntensity: z.number().optional().describe('Intensity of current worry or stress (1-10 from intake q5).'),
  averageSleepHoursNightly: z.enum(AVG_SLEEP_HOURS_OPTIONS_CHAT).optional().describe('Average hours of sleep per night (detailed measure from intake q6).'),
  appetiteChanges: z.enum(APPETITE_CHANGE_OPTIONS_CHAT).optional().describe('Recent changes in appetite or eating habits (from intake q7).'),
  socialAvoidanceFrequency: z.enum(PANIC_ANXIETY_FREQUENCY_OPTIONS_CHAT).optional().describe('Frequency of avoiding social interactions (mapped from 1-5 scale to enum for intake q8).'),
  repetitiveBehaviors: z.enum(YES_NO_OPTIONS_CHAT).optional().describe('Whether the user engages in repetitive behaviors (from intake q9).'),
  repetitiveBehaviorsDescription: z.string().optional().describe('Description of repetitive behaviors if any (from intake q9).'),
  exerciseFrequencyDetailed: z.enum(EXERCISE_FREQUENCY_DETAILED_OPTIONS_CHAT).optional().describe('Frequency of exercise or physical activity (detailed measure from intake q10).'),
  physicalSymptomsFrequency: z.enum(PANIC_ANXIETY_FREQUENCY_OPTIONS_CHAT).optional().describe('Frequency of physical symptoms like headaches or fatigue (mapped from 1-5 scale to enum for intake q11).'),
  substanceUseCoping: z.enum(SUBSTANCE_COPING_OPTIONS_CHAT).optional().describe('Frequency of using substances to cope with stress (from intake q12).'),
  workSchoolStressLevel: z.number().optional().describe('Stress level at work/school (1-10 from intake q13).'),
  concentrationDifficultyFrequency: z.enum(PANIC_ANXIETY_FREQUENCY_OPTIONS_CHAT).optional().describe('Frequency of difficulty concentrating or making decisions (mapped from 1-5 scale to enum for intake q14).'),
  recurringNegativeThoughts: z.enum(YES_NO_OPTIONS_CHAT).optional().describe('Whether the user has recurring negative thoughts or worries (from intake q15).'),
  negativeThoughtsDescription: z.string().optional().describe('Description of recurring negative thoughts if any (from intake q15).'),
  overwhelmedByTasksFrequency: z.enum(PANIC_ANXIETY_FREQUENCY_OPTIONS_CHAT).optional().describe('Frequency of feeling overwhelmed by daily tasks (mapped from 1-5 scale to enum for intake q16).'),
  hopefulnessFuture: z.number().optional().describe('Level of hopefulness about the future (1-10 from intake q17).'),
  mentalHealthMedication: z.enum(YES_NO_OPTIONS_CHAT).optional().describe('Whether the user currently takes mental health medication (from intake q18).'),
  medicationDetails: z.string().optional().describe('Details about mental health medication if taken (from intake q18).'),
  socialSupportAvailability: z.enum(SOCIAL_SUPPORT_OPTIONS_CHAT).optional().describe('Availability of someone to talk to about feelings (from intake q19).'),
  recentLifeChanges: z.enum(YES_NO_OPTIONS_CHAT).optional().describe('Whether the user experienced major life changes recently (from intake q20).'),
  lifeChangesDescription: z.string().optional().describe('Brief description of recent major life changes (from intake q20).'),
});

export type AIChatbotAssistantInput = z.infer<typeof AIChatbotAssistantInputSchema>;

const AIChatbotAssistantOutputSchema = z.object({
  response: z.string().describe('The chatbot response to the user message, structured to be short, clear, and practical.'),
});

export type AIChatbotAssistantOutput = z.infer<typeof AIChatbotAssistantOutputSchema>;

export async function aiChatbotAssistant(input: AIChatbotAssistantInput): Promise<AIChatbotAssistantOutput> {
  return aiChatbotAssistantFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiChatbotAssistantPrompt',
  input: {schema: AIChatbotAssistantInputSchema},
  output: {schema: AIChatbotAssistantOutputSchema},
  prompt: `You are a mental health AI assistant. Your role is to provide **short, clear, and practical responses** to user questions about their emotional state, coping strategies, or self-care practices.

Constraints:
- Respond in **under 50 words**.
- **Avoid storytelling, empathy statements, or long explanations.**
- **Never say “I understand”, “you may feel”, or “based on your profile”.**
- Skip context-building. Go straight to the answer.
- If the question requires medical advice, say:
  → “I'm not a doctor, but you should consult a licensed professional for medication guidance.”
- If it’s emotional or behavioral, offer 1 actionable recommendation only.

Example:
Q: What medicine should I take for my current situation?
A: I'm not a doctor, but consider speaking with a licensed psychiatrist about anti-anxiety or mood-stabilizing options based on your symptoms.

---
User Profile Information (Use this for context, but do not refer to it directly in your response with phrases like "based on your profile"):
{{#if name}}Name: {{{name}}}{{/if}}
{{#if age}}Age: {{{age}}}{{/if}}
{{#if gender}}Gender: {{{gender}}}{{/if}}
{{#if location}}Location: {{{location}}}{{/if}}
{{#if diagnosisHistory}}Diagnosis History: {{{diagnosisHistory}}}{{/if}}
{{#if diagnoses}} Diagnosed Conditions: {{{diagnoses}}}{{/if}}
{{#if currentTreatment}}Currently in Treatment: {{{currentTreatment}}}{{/if}}
{{#if mentalHealthMedication}}Taking Mental Health Medication: {{{mentalHealthMedication}}}{{/if}}
{{#if medicationDetails}} Medication Details: {{{medicationDetails}}}{{/if}}
{{#if sadnessFrequencyWeekly}}Sadness Frequency (past week, 1-10): {{{sadnessFrequencyWeekly}}}{{/if}}
{{#if panicAttackFrequency}}Panic/Anxiety Attack Frequency: {{{panicAttackFrequency}}}{{/if}}
{{#if moodTodayDetailed}}Mood Today (Detailed from intake): {{{moodTodayDetailed}}}{{/if}}
{{#if hopelessPastTwoWeeks}}Felt Hopeless (past 2 weeks): {{{hopelessPastTwoWeeks}}}{{/if}}
{{#if hopelessDescription}} (Description: {{{hopelessDescription}}}){{/if}}
{{#if currentWorryIntensity}}Current Worry/Stress Intensity (1-10): {{{currentWorryIntensity}}}{{/if}}
{{#if workSchoolStressLevel}}Work/School Stress Level (1-10 from intake): {{{workSchoolStressLevel}}}{{/if}}
{{#if currentStressLevel}}Overall Original Stress Level (1-10 from intake): {{{currentStressLevel}}}{{/if}}
{{#if todayMood}}Original Quick Mood (emoji from intake): {{{todayMood}}}{{/if}}
{{#if frequentEmotions}}Frequently Felt Emotions (from intake): {{{frequentEmotions}}}{{/if}}
{{#if averageSleepHoursNightly}}Average Sleep (detailed measure): {{{averageSleepHoursNightly}}} per night{{/if}}
{{#if sleepPatterns}}Original Sleep (hours scale): {{{sleepPatterns}}} hours/night{{/if}}
{{#if appetiteChanges}}Appetite Changes: {{{appetiteChanges}}}{{/if}}
{{#if socialAvoidanceFrequency}}Social Avoidance Frequency: {{{socialAvoidanceFrequency}}}{{/if}}
{{#if repetitiveBehaviors}}Engaging in Repetitive Behaviors: {{{repetitiveBehaviors}}}{{/if}}
{{#if repetitiveBehaviorsDescription}} (Description: {{{repetitiveBehaviorsDescription}}}){{/if}}
{{#if exerciseFrequencyDetailed}}Exercise (detailed measure): {{{exerciseFrequencyDetailed}}}{{/if}}
{{#if exerciseFrequency}}Original Exercise (weekly): {{{exerciseFrequency}}}{{/if}}
{{#if physicalSymptomsFrequency}}Physical Symptoms Frequency: {{{physicalSymptomsFrequency}}}{{/if}}
{{#if substanceUseCoping}}Substance Use for Coping: {{{substanceUseCoping}}}{{/if}}
{{#if substanceUse}}Original Substance Use (general habits): {{{substanceUse}}}{{/if}}
{{#if concentrationDifficultyFrequency}}Difficulty Concentrating/Making Decisions: {{{concentrationDifficultyFrequency}}}{{/if}}
{{#if recurringNegativeThoughts}}Recurring Negative Thoughts: {{{recurringNegativeThoughts}}}{{/if}}
{{#if negativeThoughtsDescription}} (Description: {{{negativeThoughtsDescription}}}){{/if}}
{{#if overwhelmedByTasksFrequency}}Overwhelmed by Daily Tasks: {{{overwhelmedByTasksFrequency}}}{{/if}}
{{#if hopefulnessFuture}}Hopefulness about Future (1-10 from intake): {{{hopefulnessFuture}}}/10{{/if}}
{{#if socialSupportAvailability}}Social Support Availability: {{{socialSupportAvailability}}}{{/if}}
{{#if recentLifeChanges}}Recent Major Life Changes: {{{recentLifeChanges}}}{{/if}}
{{#if lifeChangesDescription}} (Description: {{{lifeChangesDescription}}}){{/if}}
{{#if supportAreas}}Areas user seeks support in: {{{supportAreas}}}{{/if}}
{{#if contentPreferences}}Preferred content types: {{{contentPreferences}}}{{/if}}
{{#if additionalInformation}}Additional Information Provided by User (from intake): {{{additionalInformation}}}{{/if}}
---

User's current question: {{{message}}}

Based on the user's question and the profile information (for implicit context only), provide a short, clear, and practical response adhering to all constraints.
`,
});

const aiChatbotAssistantFlow = ai.defineFlow(
  {
    name: 'aiChatbotAssistantFlow',
    inputSchema: AIChatbotAssistantInputSchema,
    outputSchema: AIChatbotAssistantOutputSchema,
  },
  async (input) => {
    // Process input if necessary (e.g., ensure array-like fields are strings)
    // This logic might need adjustment depending on how StoredIntakeData is structured when read from LS in AIChatAssistantDialog
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

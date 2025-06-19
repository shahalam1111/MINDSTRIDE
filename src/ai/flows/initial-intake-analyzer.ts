
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

const GENDERS = ['Male', 'Female', 'Non-binary', 'Prefer not to say'] as const;
const TIMEZONE_OPTIONS = [
  'Eastern Time (EST)', 'Central Time (CST)', 'Mountain Time (MST)', 'Pacific Time (PST)',
  'Greenwich Mean Time (GMT)', 'Central European Time (CET)', 'Japan Standard Time (JST)', 'India Standard Time (IST)'
] as const;
const DIAGNOSIS_HISTORY_OPTIONS = ['Yes', 'No', 'Prefer not to say'] as const;
const CURRENT_TREATMENT_OPTIONS = ['Yes', 'No', 'Prefer not to say'] as const;
const EXERCISE_FREQUENCY_OPTIONS = [
  'None', '1-2 times per week', '3-4 times per week', '5-6 times per week', 'Daily'
] as const;
const SUBSTANCE_USE_OPTIONS = ['Yes often', 'Occasionally', 'No'] as const;
const CHECKIN_FREQUENCY_OPTIONS = ['Daily', 'Weekly', 'Only when I ask'] as const;
const PREFERRED_TIME_OPTIONS = ['Morning', 'Afternoon', 'Evening', 'Night'] as const;

// New options for added questions
const YES_NO_OPTIONS = ['Yes', 'No'] as const;
const PANIC_ANXIETY_FREQUENCY_OPTIONS = ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'] as const;
const DETAILED_MOOD_OPTIONS = ['Happy', 'Sad', 'Anxious', 'Overwhelmed', 'Numb', 'Other'] as const;
const AVG_SLEEP_HOURS_OPTIONS = ['Less than 4', '4-6', '6-8', 'More than 8'] as const;
const APPETITE_CHANGE_OPTIONS = ['Increased', 'Decreased', 'No Change'] as const;
const EXERCISE_FREQUENCY_DETAILED_OPTIONS = ['Daily', '2-3/week', 'Rarely', 'Never'] as const;
const SUBSTANCE_COPING_OPTIONS = ['Never', 'Occasionally', 'Frequently'] as const;
const SOCIAL_SUPPORT_OPTIONS = ['Yes', 'No', 'Sometimes'] as const;

const InitialIntakeInputSchema = z.object({
  // Existing fields
  fullName: z.string().optional().describe('The full name of the user.'),
  age: z.number().describe('The age of the user. Must be 18 or older.'),
  gender: z.enum(GENDERS).describe('The gender of the user.'),
  location: z.string().describe('The city and timezone of the user.'),
  diagnosisHistory: z.enum(DIAGNOSIS_HISTORY_OPTIONS).describe('Whether the user has been diagnosed with any mental health conditions.'),
  diagnoses: z.array(z.string()).optional().describe('List of mental health conditions the user has been diagnosed with.'),
  currentTreatment: z.enum(CURRENT_TREATMENT_OPTIONS).describe('Whether the user is currently seeing a therapist or mental health professional.'),
  sleepPatterns: z.number().min(3).max(12).describe('Average hours of sleep per night (scale 3-12).'), // Existing
  exerciseFrequency: z.enum(EXERCISE_FREQUENCY_OPTIONS).describe('Weekly exercise sessions (original measure).'), // Existing
  substanceUse: z.enum(SUBSTANCE_USE_OPTIONS).describe('General alcohol and smoking habits (original measure).'), // Existing
  currentStressLevel: z.number().min(1).max(10).describe('Overall stress level on a scale from 1 to 10.'),
  todayMood: z.string().describe('Emoji representing the user\'s mood today (quick check).'),
  frequentEmotions: z.array(z.string()).describe('List of frequent emotions experienced by the user.'),
  supportAreas: z.array(z.string()).describe('Areas in which the user seeks support (e.g., managing stress, building better habits).'),
  contentPreferences: z.array(z.string()).describe('Types of content the user prefers (e.g., text articles, guided meditations).'),
  checkInFrequency: z.enum(CHECKIN_FREQUENCY_OPTIONS).describe('Preferred frequency for check-ins.'),
  preferredTime: z.enum(PREFERRED_TIME_OPTIONS).describe('Preferred time for check-ins.'),
  additionalInformation: z.string().optional().describe('Any additional information the user wants to share, which should be carefully considered for nuanced insights.'),

  // New fields: Emotional State
  sadnessFrequencyWeekly: z.number().min(1).max(10).describe('Frequency of feeling sad/low in the past week (1: Not at all, 10: Constantly).'),
  panicAttackFrequency: z.enum(PANIC_ANXIETY_FREQUENCY_OPTIONS).describe('Frequency of sudden panic or anxiety feelings.'),
  moodTodayDetailed: z.enum(DETAILED_MOOD_OPTIONS).describe('Detailed description of mood today.'),
  otherMoodToday: z.string().optional().describe('Specification if "Other" mood was selected.'),
  hopelessPastTwoWeeks: z.enum(YES_NO_OPTIONS).describe('Whether the user felt hopeless or unmotivated in the past two weeks.'),
  hopelessDescription: z.string().optional().describe('Description if user felt hopeless.'),
  currentWorryIntensity: z.number().min(1).max(10).describe('Intensity of current worry or stress (1: Not at all intense, 10: Extremely intense).'),

  // New fields: Behavioral Patterns
  averageSleepHoursNightly: z.enum(AVG_SLEEP_HOURS_OPTIONS).describe('Average hours of sleep per night (detailed measure).'),
  appetiteChanges: z.enum(APPETITE_CHANGE_OPTIONS).describe('Recent changes in appetite or eating habits.'),
  socialAvoidanceFrequency: z.number().min(1).max(5).describe('Frequency of avoiding social interactions (1: Never, 5: Always).'),
  repetitiveBehaviors: z.enum(YES_NO_OPTIONS).describe('Whether the user engages in repetitive behaviors.'),
  repetitiveBehaviorsDescription: z.string().optional().describe('Description of repetitive behaviors if any.'),
  
  // New fields: Physical and Lifestyle Factors
  exerciseFrequencyDetailed: z.enum(EXERCISE_FREQUENCY_DETAILED_OPTIONS).describe('Frequency of exercise or physical activity (detailed measure).'),
  physicalSymptomsFrequency: z.number().min(1).max(5).describe('Frequency of physical symptoms like headaches or fatigue (1: Never, 5: Always).'),
  substanceUseCoping: z.enum(SUBSTANCE_COPING_OPTIONS).describe('Frequency of using substances to cope with stress.'),
  workSchoolStressLevel: z.number().min(1).max(10).describe('Stress level at work/school (1: Low, 10: High).'),

  // New fields: Cognitive Patterns
  concentrationDifficultyFrequency: z.number().min(1).max(5).describe('Frequency of difficulty concentrating or making decisions (1: Never, 5: Always).'),
  recurringNegativeThoughts: z.enum(YES_NO_OPTIONS).describe('Whether the user has recurring negative thoughts or worries.'),
  negativeThoughtsDescription: z.string().optional().describe('Description of recurring negative thoughts if any.'),
  overwhelmedByTasksFrequency: z.number().min(1).max(5).describe('Frequency of feeling overwhelmed by daily tasks (1: Never, 5: Always).'),
  hopefulnessFuture: z.number().min(1).max(10).describe('Level of hopefulness about the future (1: Not at all, 10: Extremely hopeful).'),

  // New fields: Support System and History
  mentalHealthMedication: z.enum(YES_NO_OPTIONS).describe('Whether the user currently takes mental health medication.'),
  medicationDetails: z.string().optional().describe('Details about mental health medication if taken.'),
  socialSupportAvailability: z.enum(SOCIAL_SUPPORT_OPTIONS).describe('Availability of someone to talk to about feelings.'),
  recentLifeChanges: z.enum(YES_NO_OPTIONS).describe('Whether the user experienced major life changes recently.'),
  lifeChangesDescription: z.string().optional().describe('Brief description of recent major life changes.'),
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
  prompt: `You are an advanced AI assistant specialized in analyzing mental health intake forms. Your primary function is to provide deep, analytical insights and supportive, research-informed recommendations to help users understand themselves better and enhance their mood and overall well-being. You must process all provided information meticulously, paying close attention to 'Additional Information' and any free-text descriptions for nuanced understanding and context. Your recommendations should be actionable and sound as if derived from reputable mental health research and advice (e.g., principles from CBT, mindfulness, positive psychology).

User's Intake Information:
**Basic Information:**
{{#if fullName}}Full Name: {{{fullName}}}{{/if}}
Age: {{{age}}}
Gender: {{{gender}}}
Location: {{{location}}}

**Mental Health Background:**
Diagnosis History: {{{diagnosisHistory}}}
{{#if diagnoses}}Diagnoses: {{#each diagnoses}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}{{else}}None specified{{/if}}
Current Treatment: {{{currentTreatment}}}
Mental Health Medication: {{{mentalHealthMedication}}}
{{#if medicationDetails}}  Medication Details: {{{medicationDetails}}}{{/if}}

**Emotional State:**
Sadness Frequency (past week, 1-10): {{{sadnessFrequencyWeekly}}}
Panic/Anxiety Attack Frequency: {{{panicAttackFrequency}}}
Mood Today (Detailed): {{{moodTodayDetailed}}}
{{#if otherMoodToday}}  Specified Other Mood: {{{otherMoodToday}}}{{/if}}
Felt Hopeless (past 2 weeks): {{{hopelessPastTwoWeeks}}}
{{#if hopelessDescription}}  Hopelessness Description: {{{hopelessDescription}}}{{/if}}
Current Worry/Stress Intensity (1-10): {{{currentWorryIntensity}}}
Frequent Emotions: {{#if frequentEmotions}}{{#each frequentEmotions}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}{{else}}None specified{{/if}}
Quick Mood Check (Emoji): {{{todayMood}}}

**Behavioral Patterns:**
Average Sleep (original measure, 3-12h): {{{sleepPatterns}}} hours
Average Sleep (detailed measure): {{{averageSleepHoursNightly}}}
Appetite Changes: {{{appetiteChanges}}}
Social Avoidance Frequency (1:Never-5:Always): {{{socialAvoidanceFrequency}}}
Engaging in Repetitive Behaviors: {{{repetitiveBehaviors}}}
{{#if repetitiveBehaviorsDescription}}  Repetitive Behaviors Description: {{{repetitiveBehaviorsDescription}}}{{/if}}

**Physical and Lifestyle Factors:**
Exercise Frequency (original measure): {{{exerciseFrequency}}}
Exercise Frequency (detailed measure): {{{exerciseFrequencyDetailed}}}
Physical Symptoms Frequency (headaches, fatigue; 1:Never-5:Always): {{{physicalSymptomsFrequency}}}
Substance Use (general habits): {{{substanceUse}}}
Substance Use for Coping: {{{substanceUseCoping}}}
Overall Stress Level (1-10): {{{currentStressLevel}}}
Work/School Stress Level (1-10): {{{workSchoolStressLevel}}}

**Cognitive Patterns:**
Difficulty Concentrating/Making Decisions (1:Never-5:Always): {{{concentrationDifficultyFrequency}}}
Recurring Negative Thoughts: {{{recurringNegativeThoughts}}}
{{#if negativeThoughtsDescription}}  Negative Thoughts Description: {{{negativeThoughtsDescription}}}{{/if}}
Overwhelmed by Daily Tasks (1:Never-5:Always): {{{overwhelmedByTasksFrequency}}}
Hopefulness about Future (1-10): {{{hopefulnessFuture}}}

**Support System and History:**
Social Support Availability: {{{socialSupportAvailability}}}
Recent Major Life Changes: {{{recentLifeChanges}}}
{{#if lifeChangesDescription}}  Life Changes Description: {{{lifeChangesDescription}}}{{/if}}

**Preferences:**
Support Areas Sought: {{#if supportAreas}}{{#each supportAreas}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}{{else}}None specified{{/if}}
Content Preferences: {{#if contentPreferences}}{{#each contentPreferences}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}{{else}}None specified{{/if}}
Check-in Frequency: {{{checkInFrequency}}}
Preferred Time for Check-ins: {{{preferredTime}}}

**Additional Information Provided by User:**
{{{additionalInformation}}}

Based on ALL the information above, including a careful review of any "Additional Information" and free-text descriptions, please generate the following output strictly adhering to the output schema:
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


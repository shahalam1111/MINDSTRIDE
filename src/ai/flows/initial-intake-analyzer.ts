
'use server';
/**
 * @fileOverview Analyzes the user's initial intake form data to identify key areas of concern,
 * their severity, provide personalized recommendations, analyze mood trends, and generate analytics scores.
 * The output is a structured JSON report.
 *
 * - analyzeInitialIntake - A function that analyzes the initial intake data.
 * - InitialIntakeAnalyzerInput - The input type for the analyzeInitialIntake function.
 * - InitialIntakeAnalyzerOutput - The return type for the analyzeInitialIntake function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Define Enums for clarity and reusability in schemas
const FREQUENCY_OPTIONS_ENUM = ["Never", "Rarely", "Sometimes", "Often", "Always"] as const;
const YES_NO_OPTIONS_ENUM = ["Yes", "No"] as const;
const SLEEP_HOURS_OPTIONS_ENUM = ["Less than 4", "4-6", "6-8", "More than 8"] as const;
const APPETITE_CHANGE_OPTIONS_ENUM = ["Increased", "Decreased", "No Change"] as const;
const EXERCISE_FREQUENCY_OPTIONS_ENUM = ["Daily", "2-3/week", "Rarely", "Never"] as const;
const SUBSTANCE_USE_COPING_OPTIONS_ENUM = ["Never", "Occasionally", "Frequently"] as const;
const SOCIAL_SUPPORT_OPTIONS_ENUM = ["Yes", "No", "Sometimes"] as const;


const IntakeResponsesSchema = z.object({
  q1_sadnessLevel: z.number().min(1).max(10).describe("Sadness level (1-10)"),
  q2_anxietyFrequency: z.enum(FREQUENCY_OPTIONS_ENUM).describe("Frequency of panic/anxiety"),
  q3_mood: z.string().describe("Current mood description (e.g. Sad, Happy, Anxious, or user-specified 'Other' mood)"),
  q4_hopelessness: z.enum(YES_NO_OPTIONS_ENUM).describe("Felt hopeless in the past two weeks"),
  q4_hopelessnessDesc: z.string().optional().describe("Description if user felt hopeless"),
  q5_stressLevel: z.number().min(1).max(10).describe("Current worry/stress intensity (1-10)"),
  q6_sleepHours: z.enum(SLEEP_HOURS_OPTIONS_ENUM).describe("Average sleep hours per night"),
  q7_appetiteChange: z.enum(APPETITE_CHANGE_OPTIONS_ENUM).describe("Recent changes in appetite or eating habits"),
  q8_socialAvoidance: z.enum(FREQUENCY_OPTIONS_ENUM).describe("Frequency of avoiding social interactions (mapped from 1-5 scale)"),
  q9_repetitiveBehaviors: z.enum(YES_NO_OPTIONS_ENUM).describe("Whether the user engages in repetitive behaviors"),
  q9_repetitiveBehaviorsDesc: z.string().optional().describe("Description of repetitive behaviors if any"),
  q10_exerciseFrequency: z.enum(EXERCISE_FREQUENCY_OPTIONS_ENUM).describe("Frequency of exercise or physical activity"),
  q11_physicalSymptoms: z.enum(FREQUENCY_OPTIONS_ENUM).describe("Frequency of physical symptoms like headaches or fatigue (mapped from 1-5 scale)"),
  q12_substanceUse: z.enum(SUBSTANCE_USE_COPING_OPTIONS_ENUM).describe("Frequency of using substances to cope with stress"),
  q13_workStress: z.number().min(1).max(10).describe("Stress level at work/school (1-10)"),
  q14_concentrationDifficulty: z.enum(FREQUENCY_OPTIONS_ENUM).describe("Frequency of difficulty concentrating or making decisions (mapped from 1-5 scale)"),
  q15_negativeThoughts: z.enum(YES_NO_OPTIONS_ENUM).describe("Whether the user has recurring negative thoughts or worries"),
  q15_negativeThoughtsDesc: z.string().optional().describe("Description of recurring negative thoughts if any"),
  q16_overwhelmFrequency: z.enum(FREQUENCY_OPTIONS_ENUM).describe("Frequency of feeling overwhelmed by daily tasks (mapped from 1-5 scale)"),
  q17_hopefulness: z.number().min(1).max(10).describe("Level of hopefulness about the future (1-10)"),
  q18_medication: z.enum(YES_NO_OPTIONS_ENUM).describe("Whether the user currently takes mental health medication"),
  q18_medicationDesc: z.string().optional().describe("Details about mental health medication if taken"),
  q19_supportSystem: z.enum(SOCIAL_SUPPORT_OPTIONS_ENUM).describe("Availability of someone to talk to about feelings"),
  q20_lifeChanges: z.enum(YES_NO_OPTIONS_ENUM).describe("Whether the user experienced major life changes recently"),
  q20_lifeChangesDesc: z.string().optional().describe("Brief description of recent major life changes"),

  // Include other original form fields for richer context if the LLM can use them.
  // These were part of the old InitialIntakeInputSchema and are not explicitly in q1-q20.
  fullName: z.string().optional().describe('The full name of the user.'),
  age: z.number().optional().describe('The age of the user.'),
  gender: z.string().optional().describe('The gender of the user.'),
  location: z.string().optional().describe('The city and timezone of the user.'),
  diagnosisHistory: z.string().optional().describe('Whether the user has been diagnosed with any mental health conditions.'),
  diagnoses: z.array(z.string()).optional().describe('List of mental health conditions the user has been diagnosed with.'),
  currentTreatment: z.string().optional().describe('Whether the user is currently seeing a therapist or mental health professional.'),
  // Original form field names:
  original_sleepPatterns_hours_3_12_scale: z.number().optional().describe('Original average hours of sleep per night (scale 3-12).'),
  original_exerciseFrequency_weekly_options: z.string().optional().describe('Original weekly exercise sessions.'),
  original_substanceUse_habits: z.string().optional().describe('Original general alcohol and smoking habits.'),
  original_currentStressLevel_1_10_scale: z.number().optional().describe('Original overall stress level on a scale from 1 to 10.'),
  original_todayMood_emoji: z.string().optional().describe('Original emoji representing the user\'s mood today (quick check).'),
  
  frequentEmotions: z.array(z.string()).optional().describe('List of frequent emotions experienced by the user.'),
  supportAreas: z.array(z.string()).optional().describe('Areas in which the user seeks support.'),
  contentPreferences: z.array(z.string()).optional().describe('Types of content the user prefers.'),
  checkInFrequency: z.string().optional().describe('Preferred frequency for check-ins.'),
  preferredTime: z.string().optional().describe('Preferred time for check-ins.'),
  additionalInformation: z.string().optional().describe('Any additional information the user wants to share.'),
});

const PastResponseSchema = z.object({
  timestamp: z.string().datetime({ message: "Invalid datetime string. Must be an ISO 8601 date-time string." }),
  responses: IntakeResponsesSchema.partial(), // Past responses might not have all q_ fields or other fields
});

const InitialIntakeAnalyzerInputSchema = z.object({
  userId: z.string(),
  timestamp: z.string().datetime({ message: "Invalid datetime string. Must be an ISO 8601 date-time string." }),
  responses: IntakeResponsesSchema,
  pastResponses: z.array(PastResponseSchema).optional(),
});
export type InitialIntakeAnalyzerInput = z.infer<typeof InitialIntakeAnalyzerInputSchema>;


const MentalHealthConcernSchema = z.object({
  condition: z.string().describe("Identified mental health condition or concern (e.g., Depression, Anxiety, Stress)."),
  severity: z.enum(["Low", "Moderate", "High"]).describe("Assigned severity level for the concern."),
  details: z.string().describe("Brief explanation or supporting details for the identified concern and its severity, based on user responses."),
});

const RecommendationSchema = z.object({
  type: z.enum(["Immediate", "Lifestyle", "Long-term"]).describe("Category of the recommendation."),
  action: z.string().describe("Specific, actionable recommendation tailored to the user."),
});

const MoodTrendDataPointSchema = z.object({
  date: z.string().describe("Date of the mood data point (YYYY-MM-DD format)."),
  mood: z.string().describe("User-reported mood for that date."),
  sadnessLevel: z.number().optional().describe("Sadness level (1-10) if available for that date."),
  // Potentially add other key metrics for trending here, e.g., stressLevel
});

const MoodTrendSchema = z.object({
  pastWeek: z.array(MoodTrendDataPointSchema).describe("Array of mood data points from the past week if available."),
  summary: z.string().describe("A brief textual summary of observed mood trends or 'No historical data available.' if pastResponses is empty/missing."),
});

const AnalyticsSchema = z.object({
  sadnessScore: z.number().optional().describe("Overall sadness score (1-10) based on q1_sadnessLevel."),
  anxietyScore: z.number().optional().describe("Overall anxiety score (derived, 1-10 equivalent) based on q2_anxietyFrequency and potentially other anxiety-related questions."),
  stressScore: z.number().optional().describe("Overall stress score (derived, 1-10 equivalent) based on q5_stressLevel, q13_workStress, and potentially other stress-related questions."),
  hopefulnessScore: z.number().optional().describe("Hopefulness score (1-10) based on q17_hopefulness."),
  sleepQuality: z.string().optional().describe("Categorical sleep quality (e.g., Poor, Fair, Good) based on q6_sleepHours."),
  socialEngagement: z.string().optional().describe("Categorical social engagement level (e.g., Low, Moderate, High) based on q8_socialAvoidance and q19_supportSystem."),
  // Allow other dynamic scores the LLM might generate based on the prompt
}).catchall(z.any().optional());


const InitialIntakeAnalyzerOutputSchema = z.object({
  userId: z.string().describe("The user's ID, passed from input."),
  reportId: z.string().describe("A unique identifier for this report (e.g., 'report_YYYYMMDD_HHMMSS')."),
  timestamp: z.string().datetime({ message: "Invalid datetime string. Must be an ISO 8601 date-time string." }).describe("Timestamp of when the report was generated."),
  mentalHealthConcerns: z.array(MentalHealthConcernSchema).describe("List of identified mental health concerns with their severity and details."),
  recommendations: z.array(RecommendationSchema).describe("List of personalized recommendations categorized by type."),
  moodTrend: MoodTrendSchema.describe("Analysis of mood trends if past data is available."),
  analytics: AnalyticsSchema.describe("Key analytics scores derived from responses for visualization purposes."),
});
export type InitialIntakeAnalyzerOutput = z.infer<typeof InitialIntakeAnalyzerOutputSchema>;


export async function analyzeInitialIntake(input: InitialIntakeAnalyzerInput): Promise<InitialIntakeAnalyzerOutput> {
  // Validate input strictly against the schema before sending to AI
  const validatedInput = InitialIntakeAnalyzerInputSchema.parse(input);
  return analyzeInitialIntakeFlow(validatedInput);
}

const promptContent = `
You are an AI mental health assistant tasked with analyzing user responses from a 20-question mental health intake form. The input is a JSON object containing user responses, with keys like "q1_sadnessLevel", "q2_anxietyFrequency", etc., representing emotional, behavioral, physical, cognitive, and support-related data. Your goal is to generate a structured JSON report that identifies mental health concerns, their severity, personalized recommendations, mood trends (if past data is provided), and analytics scores for visualization.

*Instructions*:
1. Analyze the input JSON ("responses" object) to identify key mental health concerns (e.g., depression, anxiety, stress, low motivation) based on responses. Use the full context of all responses, including the "additionalInformation" and free-text descriptions like "q4_hopelessnessDesc", "q9_repetitiveBehaviorsDesc", "q15_negativeThoughtsDesc", "q18_medicationDesc", "q20_lifeChangesDesc" to provide nuanced "details" for each concern.
2. Assign severity levels (Low, Moderate, High) for each identified "condition" using these rules:
   - Scale-based (1-10 for sadness, stress, hopefulness, etc.): 1-3 = Low, 4-7 = Moderate, 8-10 = High.
   - Multiple-choice frequency (for anxiety, social avoidance, physical symptoms, concentration, overwhelm): Never/Rarely = Low, Sometimes = Moderate, Often/Always = High.
   - For "Yes/No" questions (hopelessness, repetitive behaviors, negative thoughts, medication, life changes): "Yes" often indicates a concern; severity should be judged based on accompanying descriptions or related scale answers. E.g., "Yes" to hopelessness + high sadnessLevel suggests higher severity.
   - Text inputs: Flag keywords like "worthless", "hopeless", "panic", "suicidal", "can't cope", "overwhelmed" in description fields (e.g., q4_hopelessnessDesc, q15_negativeThoughtsDesc, additionalInformation) as indicators for potentially higher severity for related concerns.
3. Provide personalized recommendations categorized as "Immediate", "Lifestyle", or "Long-term". Recommendations should be practical, empathetic, and directly tailored to the user’s specific responses and identified concerns.
   - Immediate: Quick actions for current distress (e.g., breathing exercises for anxiety, short mindfulness for overwhelm).
   - Lifestyle: Long-term habits (e.g., sleep routine if q6_sleepHours is low, exercise if q10_exerciseFrequency is low, journaling for negative thoughts).
   - Long-term: Suggesting professional help, therapy, or specific types of support groups, especially if multiple high-severity concerns are present or if user mentions significant distress or life changes.
4. If past data is provided (in "pastResponses" array, which contains objects similar to the main "responses" object but potentially partial), analyze mood trends. Focus on q1_sadnessLevel, q3_mood, and q5_stressLevel from past and current responses.
   - Populate "moodTrend.pastWeek" with an array of data points: {"date": "YYYY-MM-DD", "mood": "user_mood", "sadnessLevel": user_sadness_level}. Use the timestamp from each pastResponse to derive the date.
   - "moodTrend.summary" should be a brief textual summary (e.g., "Sadness has slightly increased over the past week.", "Stress levels appear stable."). If "pastResponses" is empty or not provided, set "moodTrend.pastWeek" to [] and "moodTrend.summary" to "No historical data available."
5. Generate "analytics" scores. These should generally reflect the severity rules.
   - "sadnessScore": Directly from q1_sadnessLevel.
   - "anxietyScore": Derive an equivalent 1-10 score. E.g., "Never"=1, "Rarely"=3, "Sometimes"=5, "Often"=8, "Always"=10. Consider q2_anxietyFrequency.
   - "stressScore": Derive an equivalent 1-10 score. Consider q5_stressLevel (current worry) and q13_workStress. You might average them or take the max if both are high.
   - "hopefulnessScore": Directly from q17_hopefulness.
   - "sleepQuality": Categorize based on q6_sleepHours (e.g., "Less than 4" -> "Poor", "4-6" -> "Fair", "6-8" -> "Good", "More than 8" -> "Good/Excessive").
   - "socialEngagement": Categorize based on q8_socialAvoidance and q19_supportSystem (e.g., "Low", "Moderate", "High").
6. The output MUST be a single, valid JSON object adhering to the provided Output Format. Ensure "userId" and "timestamp" from the input are copied to the output. Generate a "reportId" (e.g., "report_YYYYMMDD_HHMMSS_userId").
7. Do not include any non-JSON text, explanations, apologies, or conversational filler before or after the JSON output.

The user's full input is:
\`\`\`json
{{{jsonEncode input}}}
\`\`\`
Produce ONLY the JSON output.
`;

const analyzeInitialIntakeFlow = ai.defineFlow(
  {
    name: 'analyzeInitialIntakeFlow',
    inputSchema: InitialIntakeAnalyzerInputSchema,
    outputSchema: InitialIntakeAnalyzerOutputSchema,
  },
  async (input) => {
    const {output} = await ai.generate({
        prompt: promptContent,
        input: input, // Pass the validated input directly
        output: { schema: InitialIntakeAnalyzerOutputSchema },
        // Consider adding safety settings if needed, though this prompt is analytical
        // config: {
        //   safetySettings: [{ category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' }] 
        // }
    });
    
    // The 'output' here should already be parsed by Genkit if the LLM respected the JSON output instruction and schema.
    // If it's null or Genkit couldn't parse, it means the LLM didn't produce valid JSON according to the schema.
    if (!output) {
      throw new Error("AI failed to produce a valid JSON report according to the schema. The response might have been empty or malformed.");
    }
    return output;
  }
);

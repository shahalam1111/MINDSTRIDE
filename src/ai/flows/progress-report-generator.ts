
'use server';
/**
 * @fileOverview An AI analytics engine to analyze a user’s historical intake data,
 * generate a mental health progress report, and provide structured chart data.
 *
 * - generateProgressReport - A function that handles the progress report generation.
 * - ProgressReportGeneratorInput - The input type for the generateProgressReport function.
 * - ProgressReportGeneratorOutput - The return type for the generateProgressReport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Enums for specific question responses - must match intake form options
const ANXIETY_FREQUENCY_OPTIONS_ENUM = ["Never", "Rarely", "Sometimes", "Often", "Always"] as const;
const SLEEP_HOURS_OPTIONS_ENUM = ["Less than 4", "4-6", "6-8", "More than 8"] as const;

const IntakeResponseItemSchema = z.object({
  timestamp: z.string().datetime({ message: "Invalid datetime string. Must be an ISO 8601 date-time string." }),
  responses: z.object({
    q1_sadnessLevel: z.number().min(1).max(10).describe("Sadness level (1-10)"),
    q2_anxietyFrequency: z.enum(ANXIETY_FREQUENCY_OPTIONS_ENUM).describe("Frequency of panic/anxiety"),
    q5_stressLevel: z.number().min(1).max(10).describe("Current worry/stress intensity (1-10)"),
    q6_sleepHours: z.enum(SLEEP_HOURS_OPTIONS_ENUM).describe("Average sleep hours per night"),
    q17_hopefulness: z.number().min(1).max(10).describe("Level of hopefulness about the future (1-10)"),
    // Allow other q_ fields to be present but not explicitly analyzed by this specific prompt.
  }).catchall(z.any().optional()),
});

const ProgressReportGeneratorInputSchema = z.object({
  userId: z.string(),
  history: z.array(IntakeResponseItemSchema).min(1, {message: "History must contain at least one entry."}),
});
export type ProgressReportGeneratorInput = z.infer<typeof ProgressReportGeneratorInputSchema>;


const DailyChartDataPointSchema = z.object({
  date: z.string().describe("Date in YYYY-MM-DD format."),
  sadness: z.number().optional().describe("Sadness level for the day."),
  anxiety: z.number().optional().describe("Numerical anxiety score for the day (1-5)."),
  stress: z.number().optional().describe("Stress level for the day."),
  hopefulness: z.number().optional().describe("Hopefulness level for the day."),
  sleep: z.number().optional().describe("Numerical sleep score for the day (1-4)."),
});

const WeeklyAverageDataPointSchema = z.object({
  week: z.string().describe("Week in YYYY-Www format (e.g., 2025-W23)."),
  sadnessAvg: z.number().optional().describe("Average sadness level for the week."),
  anxietyAvg: z.number().optional().describe("Average numerical anxiety score for the week."),
  stressAvg: z.number().optional().describe("Average stress level for the week."),
  hopefulnessAvg: z.number().optional().describe("Average hopefulness level for the week."),
  sleepAvg: z.number().optional().describe("Average numerical sleep score for the week."),
});

const MonthlyInsightEntrySchema = z.object({
  month: z.string().describe("Month in 'Month YYYY' format (e.g., June 2025)."),
  trend: z.string().optional().describe("Overall trend summary for the month for key indicators."),
  status: z.string().optional().describe("Overall status for the month (e.g., Improving, Declining, Stable)."),
  sadnessAvg: z.number().optional(),
  anxietyAvg: z.number().optional(),
  stressAvg: z.number().optional(),
  hopefulnessAvg: z.number().optional(),
  sleepAvg: z.number().optional(),
});

const RecommendationSchema = z.object({
  type: z.enum(["Insight", "Action"]).describe("Type of recommendation: 'Insight' for observations, 'Action' for suggestions."),
  text: z.string().describe("The content of the insight or actionable suggestion."),
});

const ProgressReportGeneratorOutputSchema = z.object({
  userId: z.string().describe("The user's ID, passed from input."),
  reportId: z.string().describe("A unique identifier for this report (e.g., 'report_YYYYMMDD_HHMMSS_userId')."),
  timestamp: z.string().datetime().describe("Timestamp of when the report was generated."),
  summary: z.string().describe("A concise overall progress summary (3-4 sentences max)."),
  dailyChartData: z.array(DailyChartDataPointSchema).describe("Data for daily trends chart, showing the last 7 entries/days with data."),
  weeklyAverages: z.array(WeeklyAverageDataPointSchema).describe("Data for weekly averages chart, showing the last 4 weeks with data."),
  monthlyInsights: z.array(MonthlyInsightEntrySchema).describe("Summary and insights for the last 3 months with data."),
  recommendations: z.array(RecommendationSchema).max(5).describe("A list of 2-3 personalized insights based on trend shifts and 2 practical suggestions for improvement. Total 4-5 items max."),
});
export type ProgressReportGeneratorOutput = z.infer<typeof ProgressReportGeneratorOutputSchema>;


export async function generateProgressReport(input: ProgressReportGeneratorInput): Promise<ProgressReportGeneratorOutput> {
  const validatedInput = ProgressReportGeneratorInputSchema.parse(input);
  return progressReportGeneratorFlow(validatedInput);
}

const promptContent = `
You are an AI analytics engine for the "My Progress" section of a mental health application. Your task is to analyze a user’s historical intake data and generate a short, data-driven mental health progress report as a structured JSON object.

The input JSON includes a user's intake form history. Each submission is timestamped and contains responses to questions about emotional health (sadness, anxiety, stress, hopefulness), sleep, and cognitive behavior.

**Your Responsibilities & Instructions:**

1.  **Data Grouping & Aggregation:**
    *   Process the \`history\` array. Group responses by day, week, and month using the \`timestamp\` of each entry.
    *   When calculating weekly or monthly averages, if multiple entries exist within the same day, average them first for that day before including in weekly/monthly calculations.

2.  **Indicator Analysis:**
    *   Analyze trends across these specific indicators from the \`responses\` object of each history item:
        *   Sadness: \`q1_sadnessLevel\` (numeric 1-10)
        *   Anxiety: \`q2_anxietyFrequency\` (enum)
        *   Stress: \`q5_stressLevel\` (numeric 1-10)
        *   Hopefulness: \`q17_hopefulness\` (numeric 1-10)
        *   Sleep: \`q6_sleepHours\` (enum)
    *   **Scoring Rules for Averages & Numeric Conversion:**
        *   For \`q1_sadnessLevel\`, \`q5_stressLevel\`, \`q17_hopefulness\`: Use the provided numeric values directly.
        *   For \`q2_anxietyFrequency\`: Convert to a numeric scale for analysis and averaging: 'Never' = 1, 'Rarely' = 2, 'Sometimes' = 3, 'Often' = 4, 'Always' = 5.
        *   For \`q6_sleepHours\`: Convert to a numeric scale for analysis and averaging: 'Less than 4' = 1, '4-6' = 2, '6-8' = 3, 'More than 8' = 4.

3.  **Pattern Detection:**
    *   Identify improvements or declines in these indicators over time.
    *   Note any sudden spikes or significant changes.
    *   Determine the overall mood trajectory based on the analyzed indicators.

4.  **Generate Chart-Ready Data:**
    *   \`dailyChartData\`: Provide data for the **last 7 distinct dates** for which entries exist in the history. For each date, include the (potentially day-averaged) scores for sadness, anxiety (numeric), stress, hopefulness, and sleep (numeric). Format dates as "YYYY-MM-DD".
    *   \`weeklyAverages\`: Provide data for the **last 4 distinct weeks** for which entries exist. Calculate the average scores for sadness, anxiety (numeric), stress, hopefulness, and sleep (numeric) for each week. Format weeks as "YYYY-Www" (e.g., "2025-W23").
    *   \`monthlyInsights\`: Provide a summary for up to the **last 3 distinct months** for which entries exist. For each month, include average scores and a brief textual \`trend\` (e.g., "Sadness and stress levels have gradually declined.") and \`status\` (e.g., "Improving", "Declining", "Stable"). Format month as "Month YYYY" (e.g., "June 2025").

5.  **Generate Textual Report Components:**
    *   \`summary\`: A concise overall progress summary (strictly 3-4 sentences maximum). This should be a high-level overview.
    *   \`recommendations\`: A list containing:
        *   2-3 personalized insights (\`type: "Insight"\`) based on observed trend shifts or significant patterns (e.g., "Hopefulness score increased by 2 points over 2 weeks when sleep improved.").
        *   2 practical suggestions (\`type: "Action"\`) to support mental health improvement, tailored to the user's trends (e.g., "Maintain a consistent sleep routine and light exercise if stress levels are trending up."). Keep text concise.

6.  **Output Generation:**
    *   The **ENTIRE output MUST be a single, valid JSON object** adhering to the specified Output Format. Do NOT include any non-JSON text, explanations, apologies, or conversational filler before or after the JSON output.
    *   Generate a unique \`reportId\` (e.g., "report_YYYYMMDDHHMMSS_userId").
    *   The top-level \`timestamp\` in the output should be the current ISO 8601 datetime when the report is generated.
    *   Ensure all field names and data types in your JSON output strictly match the defined Output Schema.

**Input Format Example (Illustrative - actual input will have more history items):**
\`\`\`json
{{{jsonEncode inputExample}}}
\`\`\`

**Output Format (Your output must strictly follow this structure and field names):**
(The schema definition provided to you by the system defines this structure. Adhere to it.)

The user's full input to analyze is:
\`\`\`json
{{{jsonEncode input}}}
\`\`\`

Produce ONLY the JSON output.
`;

// Placeholder example for the prompt, actual input will be `input`
const inputExample = {
  userId: "user123",
  history: [
    {
      timestamp: "2025-06-01T10:00:00Z",
      responses: { q1_sadnessLevel: 6, q2_anxietyFrequency: "Often", q5_stressLevel: 7, q6_sleepHours: "4-6", q17_hopefulness: 3 }
    },
    {
      timestamp: "2025-06-08T11:00:00Z",
      responses: { q1_sadnessLevel: 5, q2_anxietyFrequency: "Sometimes", q5_stressLevel: 6, q6_sleepHours: "6-8", q17_hopefulness: 4 }
    }
  ]
};


const progressReportGeneratorFlow = ai.defineFlow(
  {
    name: 'progressReportGeneratorFlow',
    inputSchema: ProgressReportGeneratorInputSchema,
    outputSchema: ProgressReportGeneratorOutputSchema,
  },
  async (input) => {
    const {output} = await ai.generate({
        prompt: promptContent,
        input: {input, inputExample}, // Pass both actual input and the example for the prompt context
        output: { schema: ProgressReportGeneratorOutputSchema },
        config: {
          temperature: 0.3,
          topP: 0.8,
          maxOutputTokens: 2048, // Increased slightly for potentially complex JSON
        }
    });
    
    if (!output) {
      throw new Error("AI failed to produce a valid JSON progress report. The response might have been empty or malformed.");
    }
    return output;
  }
);

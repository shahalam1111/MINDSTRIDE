
"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase'; 
import { doc, setDoc, serverTimestamp } from "firebase/firestore"; 
import { analyzeInitialIntake, type InitialIntakeAnalyzerInput, type InitialIntakeAnalyzerOutput } from '@/ai/flows/initial-intake-analyzer';
import { Loader2 } from 'lucide-react';

const GENDERS = ['Male', 'Female', 'Non-binary', 'Prefer not to say'] as const;
const TIMEZONE_OPTIONS = [
  'Eastern Time (EST)', 'Central Time (CST)', 'Mountain Time (MST)', 'Pacific Time (PST)',
  'Greenwich Mean Time (GMT)', 'Central European Time (CET)', 'Japan Standard Time (JST)', 'India Standard Time (IST)'
] as const;
const DIAGNOSIS_HISTORY_OPTIONS = ['Yes', 'No', 'Prefer not to say'] as const;
const DIAGNOSES_CHECKBOX_OPTIONS = [
  { id: 'anxiety', label: 'Anxiety' },
  { id: 'depression', label: 'Depression' },
  { id: 'ptsd', label: 'PTSD' },
  { id: 'ocd', label: 'OCD' },
  { id: 'adhd', label: 'ADHD' },
  { id: 'bipolar', label: 'Bipolar Disorder' },
  { id: 'other', label: 'Other' },
] as const;
const CURRENT_TREATMENT_OPTIONS = ['Yes', 'No', 'Prefer not to say'] as const;
const EXERCISE_FREQUENCY_OPTIONS_ORIGINAL = [ // Renamed to avoid clash
  'None', '1-2 times per week', '3-4 times per week', '5-6 times per week', 'Daily'
] as const;
const SUBSTANCE_USE_OPTIONS_ORIGINAL = ['Yes often', 'Occasionally', 'No'] as const; // Renamed
const TODAY_MOOD_OPTIONS = [
  { emoji: '😊', label: 'Happy' },
  { emoji: '😐', label: 'Neutral' },
  { emoji: '😞', label: 'Sad' },
  { emoji: '😠', label: 'Angry' },
  { emoji: '😰', label: 'Anxious' },
  { emoji: '😴', label: 'Tired' },
] as const;
const CHECKIN_FREQUENCY_OPTIONS = ['Daily', 'Weekly', 'Only when I ask'] as const;
const PREFERRED_TIME_OPTIONS = ['Morning', 'Afternoon', 'Evening', 'Night'] as const;

const frequentEmotionsOptions = [
  { id: 'happy', label: 'Happy' }, { id: 'sad', label: 'Sad' }, { id: 'anxious', label: 'Anxious' },
  { id: 'angry', label: 'Angry' }, { id: 'calm', label: 'Calm' }, { id: 'stressed', label: 'Stressed' },
  { id: 'overwhelmed', label: 'Overwhelmed' }, { id: 'hopeful', label: 'Hopeful' },
];
const supportAreasOptions = [
  { id: 'stress', label: 'Managing Stress' }, { id: 'sleep', label: 'Improving Sleep' },
  { id: 'habits', label: 'Building Better Habits' }, { id: 'relationships', label: 'Relationship Issues' },
  { id: 'anxiety', label: 'Coping with Anxiety' }, { id: 'emotions', label: 'Understanding Emotions' },
  { id: 'motivation', label: 'Motivation' },
];
const contentPreferencesOptions = [
  { id: 'articles', label: 'Text Articles' }, { id: 'meditations', label: 'Guided Meditations' },
  { id: 'videos', label: 'Video Content' }, { id: 'exercises', label: 'Interactive Exercises' },
  { id: 'audio', label: 'Audio Talks' },
];

// New options for added questions (matching enums in initial-intake-analyzer)
const YES_NO_OPTIONS = ['Yes', 'No'] as const;
const PANIC_ANXIETY_FREQUENCY_OPTIONS = ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'] as const;
const DETAILED_MOOD_OPTIONS = ['Happy', 'Sad', 'Anxious', 'Overwhelmed', 'Numb', 'Other'] as const;
const AVG_SLEEP_HOURS_OPTIONS = ['Less than 4', '4-6', '6-8', 'More than 8'] as const;
const APPETITE_CHANGE_OPTIONS = ['Increased', 'Decreased', 'No Change'] as const;
const EXERCISE_FREQUENCY_DETAILED_OPTIONS = ['Daily', '2-3/week', 'Rarely', 'Never'] as const;
const SUBSTANCE_COPING_OPTIONS = ['Never', 'Occasionally', 'Frequently'] as const;
const SOCIAL_SUPPORT_OPTIONS = ['Yes', 'No', 'Sometimes'] as const;

const SCALE_1_5_LABELS: Record<number, "Never" | "Rarely" | "Sometimes" | "Often" | "Always"> = { 1: "Never", 2: "Rarely", 3: "Sometimes", 4: "Often", 5: "Always" };


const intakeFormSchema = z.object({
  // Existing fields (will be mapped to new schema or used as additional context)
  fullName: z.string().optional(),
  age: z.coerce.number().min(18, { message: "You must be at least 18 years old." }),
  gender: z.enum(GENDERS),
  city: z.string().min(1, { message: "City is required." }),
  timezone: z.enum(TIMEZONE_OPTIONS),
  diagnosisHistory: z.enum(DIAGNOSIS_HISTORY_OPTIONS),
  diagnoses: z.array(z.string()).optional(),
  otherDiagnosis: z.string().optional(),
  currentTreatment: z.enum(CURRENT_TREATMENT_OPTIONS),
  sleepPatterns_original: z.coerce.number().min(3).max(12), 
  exerciseFrequency_original: z.enum(EXERCISE_FREQUENCY_OPTIONS_ORIGINAL),
  substanceUse_original: z.enum(SUBSTANCE_USE_OPTIONS_ORIGINAL), 
  currentStressLevel_original: z.number().min(1).max(10),
  todayMood_original_emoji: z.string().min(1, { message: "Please select your mood." }), 
  frequentEmotions: z.array(z.string()).refine(value => value.some(item => item), { message: "You have to select at least one emotion." }),
  supportAreas: z.array(z.string()).refine(value => value.some(item => item), { message: "You have to select at least one support area." }),
  contentPreferences: z.array(z.string()).refine(value => value.some(item => item), { message: "You have to select at least one content preference." }),
  checkInFrequency: z.enum(CHECKIN_FREQUENCY_OPTIONS),
  preferredTime: z.enum(PREFERRED_TIME_OPTIONS),
  additionalInformation: z.string().optional(),

  // New Q1-Q20 fields (matching naming for easier mapping)
  sadnessFrequencyWeekly: z.number().min(1).max(10).default(1), // q1
  panicAttackFrequency: z.enum(PANIC_ANXIETY_FREQUENCY_OPTIONS).default('Never'), // q2
  moodTodayDetailed: z.enum(DETAILED_MOOD_OPTIONS).default('Happy'), // q3 part 1
  otherMoodToday: z.string().optional(), // q3 part 2
  hopelessPastTwoWeeks: z.enum(YES_NO_OPTIONS).default('No'), // q4 part 1
  hopelessDescription: z.string().optional(), // q4 part 2
  currentWorryIntensity: z.number().min(1).max(10).default(1), // q5
  averageSleepHoursNightly: z.enum(AVG_SLEEP_HOURS_OPTIONS).default('6-8'), // q6
  appetiteChanges: z.enum(APPETITE_CHANGE_OPTIONS).default('No Change'), // q7
  socialAvoidanceFrequency: z.number().min(1).max(5).default(1), // q8 (1-5 scale)
  repetitiveBehaviors: z.enum(YES_NO_OPTIONS).default('No'), // q9 part 1
  repetitiveBehaviorsDescription: z.string().optional(), // q9 part 2
  exerciseFrequencyDetailed: z.enum(EXERCISE_FREQUENCY_DETAILED_OPTIONS).default('Rarely'), // q10
  physicalSymptomsFrequency: z.number().min(1).max(5).default(1), // q11 (1-5 scale)
  substanceUseCoping: z.enum(SUBSTANCE_COPING_OPTIONS).default('Never'), // q12
  workSchoolStressLevel: z.number().min(1).max(10).default(1), // q13
  concentrationDifficultyFrequency: z.number().min(1).max(5).default(1), // q14 (1-5 scale)
  recurringNegativeThoughts: z.enum(YES_NO_OPTIONS).default('No'), // q15 part 1
  negativeThoughtsDescription: z.string().optional(), // q15 part 2
  overwhelmedByTasksFrequency: z.number().min(1).max(5).default(1), // q16 (1-5 scale)
  hopefulnessFuture: z.number().min(1).max(10).default(5), // q17
  mentalHealthMedication: z.enum(YES_NO_OPTIONS).default('No'), // q18 part 1
  medicationDetails: z.string().optional(), // q18 part 2
  socialSupportAvailability: z.enum(SOCIAL_SUPPORT_OPTIONS).default('Yes'), // q19
  recentLifeChanges: z.enum(YES_NO_OPTIONS).default('No'), // q20 part 1
  lifeChangesDescription: z.string().optional(), // q20 part 2
})
.refine(data => !(data.diagnosisHistory === 'Yes' && data.diagnoses?.includes('other') && !data.otherDiagnosis?.trim()), { message: "Please specify your diagnosis if 'Other' is selected.", path: ['otherDiagnosis']})
.refine(data => !(data.moodTodayDetailed === 'Other' && !data.otherMoodToday?.trim()), { message: "Please specify if 'Other' mood is selected.", path: ['otherMoodToday'] })
.refine(data => !(data.hopelessPastTwoWeeks === 'Yes' && !data.hopelessDescription?.trim()), { message: "Please describe if you felt hopeless.", path: ['hopelessDescription'] })
.refine(data => !(data.repetitiveBehaviors === 'Yes' && !data.repetitiveBehaviorsDescription?.trim()), { message: "Please describe the repetitive behaviors.", path: ['repetitiveBehaviorsDescription'] })
.refine(data => !(data.recurringNegativeThoughts === 'Yes' && !data.negativeThoughtsDescription?.trim()), { message: "Please describe the negative thoughts.", path: ['negativeThoughtsDescription'] })
.refine(data => !(data.mentalHealthMedication === 'Yes' && !data.medicationDetails?.trim()), { message: "Please specify your medication.", path: ['medicationDetails'] })
.refine(data => !(data.recentLifeChanges === 'Yes' && !data.lifeChangesDescription?.trim()), { message: "Please describe the recent life changes.", path: ['lifeChangesDescription'] });

type IntakeFormValues = z.infer<typeof intakeFormSchema>;

const USER_ID_PLACEHOLDER = "mockUserId"; 
const INTAKE_ANALYSIS_LS_KEY = 'wellspringIntakeAnalysisResults'; // Will store the new JSON report
const INTAKE_DATA_LS_KEY = 'wellspringUserIntakeData'; // Will store the raw form values

export default function IntakeFormPage() {
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<IntakeFormValues>({
    resolver: zodResolver(intakeFormSchema),
    defaultValues: {
      fullName: '',
      age: 18,
      gender: 'Prefer not to say',
      city: '',
      timezone: TIMEZONE_OPTIONS[3], 
      diagnosisHistory: 'Prefer not to say',
      diagnoses: [],
      otherDiagnosis: '',
      currentTreatment: 'Prefer not to say',
      sleepPatterns_original: 7,
      exerciseFrequency_original: '1-2 times per week',
      substanceUse_original: 'No',
      currentStressLevel_original: 5,
      todayMood_original_emoji: '',
      frequentEmotions: [],
      supportAreas: [],
      contentPreferences: [],
      checkInFrequency: 'Weekly',
      preferredTime: 'Afternoon',
      additionalInformation: '',
      // Defaults for new fields
      sadnessFrequencyWeekly: 1,
      panicAttackFrequency: 'Never',
      moodTodayDetailed: 'Happy',
      otherMoodToday: '',
      hopelessPastTwoWeeks: 'No',
      hopelessDescription: '',
      currentWorryIntensity: 1,
      averageSleepHoursNightly: '6-8',
      appetiteChanges: 'No Change',
      socialAvoidanceFrequency: 1,
      repetitiveBehaviors: 'No',
      repetitiveBehaviorsDescription: '',
      exerciseFrequencyDetailed: 'Rarely',
      physicalSymptomsFrequency: 1,
      substanceUseCoping: 'Never',
      workSchoolStressLevel: 1,
      concentrationDifficultyFrequency: 1,
      recurringNegativeThoughts: 'No',
      negativeThoughtsDescription: '',
      overwhelmedByTasksFrequency: 1,
      hopefulnessFuture: 5,
      mentalHealthMedication: 'No',
      medicationDetails: '',
      socialSupportAvailability: 'Yes',
      recentLifeChanges: 'No',
      lifeChangesDescription: '',
    },
  });

  const diagnosisHistoryValue = form.watch('diagnosisHistory');
  const diagnosesValue = form.watch('diagnoses');
  const selectedTodayMood_original_emoji = form.watch('todayMood_original_emoji'); 
  const selectedDetailedMood = form.watch('moodTodayDetailed');
  const selectedHopeless = form.watch('hopelessPastTwoWeeks');
  const selectedRepetitiveBehaviors = form.watch('repetitiveBehaviors');
  const selectedRecurringNegativeThoughts = form.watch('recurringNegativeThoughts');
  const selectedMentalHealthMedication = form.watch('mentalHealthMedication');
  const selectedRecentLifeChanges = form.watch('recentLifeChanges');

  const onSubmit = async (data: IntakeFormValues) => {
    try {
      let finalDiagnosesList: string[] = data.diagnoses || [];
      if (data.diagnosisHistory === 'Yes' && data.diagnoses?.includes('other') && data.otherDiagnosis?.trim()) {
        finalDiagnosesList = finalDiagnosesList.filter(d => d !== 'other');
        finalDiagnosesList.push(data.otherDiagnosis.trim());
      }
      
      const rawDataForLocalStorage = { // Save the form values as they are
        ...data,
        location: `${data.city}, ${data.timezone}`, // combine city and timezone for original location field
        diagnoses: finalDiagnosesList, // use the processed list
        updatedAt: new Date().toISOString(), 
      };
      localStorage.setItem(INTAKE_DATA_LS_KEY, JSON.stringify(rawDataForLocalStorage));
      console.log("Raw Intake data saved to localStorage for potential AI Chat use.");

      if (db) {
        const firestorePayload = { ...rawDataForLocalStorage, updatedAt: serverTimestamp() };
        // Remove form-specific fields not directly part of the data model if necessary
        // For now, saving all enriched data.
        const { city, timezone, otherDiagnosis, ...payloadForFirestore } = firestorePayload;

        try {
          const userIntakeDocRef = doc(db, "intakeForms", USER_ID_PLACEHOLDER);
          await setDoc(userIntakeDocRef, payloadForFirestore, { merge: true }); 
          console.log("Intake data also saved to Firestore.");
        } catch (firestoreError: any) {
            console.warn("MINDSTRIDE: Failed to save intake data to Firestore:", firestoreError.message);
            toast({
                title: "Cloud Save Issue",
                description: "Could not save data to the cloud, but it's saved locally.",
                variant: "default",
                duration: 7000,
            });
        }
      } else {
        console.warn("MINDSTRIDE: Firestore not configured. Intake data saved locally only.");
      }
      
      // Prepare data for the new analyzeInitialIntake flow
      const payloadForAnalysis: InitialIntakeAnalyzerInput = {
        userId: USER_ID_PLACEHOLDER,
        timestamp: new Date().toISOString(),
        responses: {
          q1_sadnessLevel: data.sadnessFrequencyWeekly,
          q2_anxietyFrequency: data.panicAttackFrequency,
          q3_mood: data.moodTodayDetailed === 'Other' ? data.otherMoodToday || 'Other' : data.moodTodayDetailed,
          q4_hopelessness: data.hopelessPastTwoWeeks,
          q4_hopelessnessDesc: data.hopelessDescription,
          q5_stressLevel: data.currentWorryIntensity,
          q6_sleepHours: data.averageSleepHoursNightly,
          q7_appetiteChange: data.appetiteChanges,
          q8_socialAvoidance: SCALE_1_5_LABELS[data.socialAvoidanceFrequency] || "Sometimes",
          q9_repetitiveBehaviors: data.repetitiveBehaviors,
          q9_repetitiveBehaviorsDesc: data.repetitiveBehaviorsDescription,
          q10_exerciseFrequency: data.exerciseFrequencyDetailed,
          q11_physicalSymptoms: SCALE_1_5_LABELS[data.physicalSymptomsFrequency] || "Sometimes",
          q12_substanceUse: data.substanceUseCoping,
          q13_workStress: data.workSchoolStressLevel,
          q14_concentrationDifficulty: SCALE_1_5_LABELS[data.concentrationDifficultyFrequency] || "Sometimes",
          q15_negativeThoughts: data.recurringNegativeThoughts,
          q15_negativeThoughtsDesc: data.negativeThoughtsDescription,
          q16_overwhelmFrequency: SCALE_1_5_LABELS[data.overwhelmedByTasksFrequency] || "Sometimes",
          q17_hopefulness: data.hopefulnessFuture,
          q18_medication: data.mentalHealthMedication,
          q18_medicationDesc: data.medicationDetails,
          q19_supportSystem: data.socialSupportAvailability,
          q20_lifeChanges: data.recentLifeChanges,
          q20_lifeChangesDesc: data.lifeChangesDescription,

          // Pass original/additional fields
          fullName: data.fullName,
          age: data.age,
          gender: data.gender,
          location: `${data.city}, ${data.timezone}`,
          diagnosisHistory: data.diagnosisHistory,
          diagnoses: finalDiagnosesList,
          currentTreatment: data.currentTreatment,
          original_sleepPatterns_hours_3_12_scale: data.sleepPatterns_original,
          original_exerciseFrequency_weekly_options: data.exerciseFrequency_original,
          original_substanceUse_habits: data.substanceUse_original,
          original_currentStressLevel_1_10_scale: data.currentStressLevel_original,
          original_todayMood_emoji: data.todayMood_original_emoji,
          frequentEmotions: data.frequentEmotions,
          supportAreas: data.supportAreas,
          contentPreferences: data.contentPreferences,
          checkInFrequency: data.checkInFrequency,
          preferredTime: data.preferredTime,
          additionalInformation: data.additionalInformation,
        },
        pastResponses: [], // No past responses for initial intake
      };

      console.log("Starting Intake Analysis with new structured input...");
      const analysisOutput: InitialIntakeAnalyzerOutput = await analyzeInitialIntake(payloadForAnalysis);
      localStorage.setItem(INTAKE_ANALYSIS_LS_KEY, JSON.stringify(analysisOutput)); // Store the new JSON report
      console.log("Intake Analysis Complete. JSON report stored for AI Chat.", analysisOutput);
      
      toast({
        title: "Intake Information Saved & Analyzed!",
        description: "Your detailed report is ready. Redirecting to dashboard...",
        duration: 5000,
      });
      
      router.push('/dashboard'); 

    } catch (error: any) {
      console.error("Failed to save intake form or analyze:", error);
      let description = "Failed to save or analyze your intake form. Please try again.";
      if (error.message) {
        description += ` Details: ${error.message}`;
      } else if (typeof error === 'string') {
        description += ` Details: ${error}`;
      }
      if (error.stack) {
        console.error(error.stack);
      }
      toast({
        title: "Error During Submission",
        description: description,
        variant: "destructive",
        duration: 10000, // Longer duration for error messages
      });
    }
  };
  
  const renderSliderDescription = (value: number, labels: Record<number, string>) => {
    return labels[value] || String(value);
  };

  return (
    <div className="flex justify-center py-8 px-4">
      <Card className="w-full max-w-3xl shadow-xl rounded-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-headline text-center">Mental Wellness Intake Form</CardTitle>
          <CardDescription className="text-center text-muted-foreground">
            Help us understand your needs to provide personalized support. All information is kept confidential.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
              
              {/* Basic Information Section (Existing) */}
              <Card className="p-4 sm:p-6">
                <CardHeader className="px-0 pt-0">
                  <CardTitle className="text-xl">Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="px-0 pb-0 space-y-6">
                    <FormField control={form.control} name="fullName" render={({ field }) => (
                        <FormItem>
                        <FormLabel>Full Name (Optional)</FormLabel>
                        <FormControl><Input placeholder="Your full name" {...field} disabled={form.formState.isSubmitting} /></FormControl>
                        <FormMessage />
                        </FormItem>
                    )}/>

                    <FormField control={form.control} name="age" render={({ field }) => (
                        <FormItem>
                        <FormLabel>Age</FormLabel>
                        <FormControl><Input type="number" placeholder="Your age" {...field} disabled={form.formState.isSubmitting} /></FormControl>
                        <FormMessage />
                        </FormItem>
                    )}/>

                    <FormField control={form.control} name="gender" render={({ field }) => (
                        <FormItem>
                        <FormLabel>Gender</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={form.formState.isSubmitting}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select your gender" /></SelectTrigger></FormControl>
                            <SelectContent>
                            {GENDERS.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}/>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField control={form.control} name="city" render={({ field }) => (
                        <FormItem>
                            <FormLabel>City</FormLabel>
                            <FormControl><Input placeholder="e.g., San Francisco" {...field} disabled={form.formState.isSubmitting} /></FormControl>
                            <FormMessage />
                        </FormItem>
                        )}/>
                        <FormField control={form.control} name="timezone" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Timezone</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value} disabled={form.formState.isSubmitting}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select your timezone" /></SelectTrigger></FormControl>
                            <SelectContent>
                                {TIMEZONE_OPTIONS.map(tz => <SelectItem key={tz} value={tz}>{tz}</SelectItem>)}
                            </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                        )}/>
                    </div>
                </CardContent>
              </Card>

              {/* Section: Emotional State */}
              <Card className="p-4 sm:p-6">
                <CardHeader className="px-0 pt-0">
                  <CardTitle className="text-xl">Emotional State</CardTitle>
                </CardHeader>
                <CardContent className="px-0 pb-0 space-y-6">
                  <FormField control={form.control} name="sadnessFrequencyWeekly" render={({ field }) => ( //q1
                    <FormItem>
                      <FormLabel>On a scale of 1–10, how often did you feel sad or low in the past week? (1: Not at all, 10: Constantly)</FormLabel>
                      <FormControl>
                        <div className="flex items-center space-x-4 pt-2">
                          <Slider defaultValue={[field.value]} min={1} max={10} step={1} onValueChange={(value) => field.onChange(value[0])} className="w-[90%]" disabled={form.formState.isSubmitting} />
                          <span className="w-[10%] text-center text-lg font-semibold">{field.value}</span>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}/>
                  <FormField control={form.control} name="panicAttackFrequency" render={({ field }) => ( //q2
                    <FormItem>
                      <FormLabel>Do you experience sudden feelings of panic or anxiety?</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} disabled={form.formState.isSubmitting}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select frequency" /></SelectTrigger></FormControl>
                        <SelectContent>
                          {PANIC_ANXIETY_FREQUENCY_OPTIONS.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}/>
                  <FormField control={form.control} name="moodTodayDetailed" render={({ field }) => ( //q3
                    <FormItem>
                      <FormLabel>What best describes your mood today?</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} disabled={form.formState.isSubmitting}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select mood" /></SelectTrigger></FormControl>
                        <SelectContent>
                          {DETAILED_MOOD_OPTIONS.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}/>
                  {selectedDetailedMood === 'Other' && ( //q3
                    <FormField control={form.control} name="otherMoodToday" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Please specify your mood:</FormLabel>
                        <FormControl><Input placeholder="Specify other mood" {...field} disabled={form.formState.isSubmitting} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}/>
                  )}
                  <FormField control={form.control} name="hopelessPastTwoWeeks" render={({ field }) => ( //q4
                    <FormItem className="space-y-3">
                      <FormLabel>Have you felt hopeless or unmotivated in the past two weeks?</FormLabel>
                      <FormControl>
                        <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex space-x-4" disabled={form.formState.isSubmitting}>
                          {YES_NO_OPTIONS.map(opt => (
                            <FormItem key={opt} className="flex items-center space-x-2 space-y-0">
                              <FormControl><RadioGroupItem value={opt} /></FormControl>
                              <FormLabel className="font-normal">{opt}</FormLabel>
                            </FormItem>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}/>
                  {selectedHopeless === 'Yes' && ( //q4
                    <FormField control={form.control} name="hopelessDescription" render={({ field }) => (
                      <FormItem>
                        <FormLabel>If yes, please describe briefly:</FormLabel>
                        <FormControl><Textarea placeholder="Describe your feelings..." {...field} rows={3} disabled={form.formState.isSubmitting} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}/>
                  )}
                  <FormField control={form.control} name="currentWorryIntensity" render={({ field }) => ( //q5
                    <FormItem>
                      <FormLabel>How intense are your feelings of worry or stress right now? (1: Not at all intense, 10: Extremely intense)</FormLabel>
                      <FormControl>
                        <div className="flex items-center space-x-4 pt-2">
                          <Slider defaultValue={[field.value]} min={1} max={10} step={1} onValueChange={(value) => field.onChange(value[0])} className="w-[90%]" disabled={form.formState.isSubmitting} />
                          <span className="w-[10%] text-center text-lg font-semibold">{field.value}</span>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}/>
                </CardContent>
              </Card>
              
              {/* Section: Behavioral Patterns */}
              <Card className="p-4 sm:p-6">
                <CardHeader className="px-0 pt-0">
                  <CardTitle className="text-xl">Behavioral Patterns</CardTitle>
                </CardHeader>
                <CardContent className="px-0 pb-0 space-y-6">
                    <FormField control={form.control} name="averageSleepHoursNightly" render={({ field }) => ( //q6
                        <FormItem>
                        <FormLabel>How many hours do you sleep on average per night?</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={form.formState.isSubmitting}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select hours" /></SelectTrigger></FormControl>
                            <SelectContent>
                            {AVG_SLEEP_HOURS_OPTIONS.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}/>
                     <FormField control={form.control} name="appetiteChanges" render={({ field }) => ( //q7
                        <FormItem>
                        <FormLabel>Have you noticed changes in your appetite or eating habits?</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={form.formState.isSubmitting}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select change" /></SelectTrigger></FormControl>
                            <SelectContent>
                            {APPETITE_CHANGE_OPTIONS.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}/>
                    <FormField control={form.control} name="socialAvoidanceFrequency" render={({ field }) => ( //q8
                        <FormItem>
                        <FormLabel>Do you avoid social interactions or activities you used to enjoy? (1: Never, 5: Always)</FormLabel>
                        <FormControl>
                            <div className="flex items-center space-x-4 pt-2">
                            <Slider defaultValue={[field.value]} min={1} max={5} step={1} onValueChange={(value) => field.onChange(value[0])} className="w-[90%]" disabled={form.formState.isSubmitting} />
                            <span className="w-[10%] text-center text-md font-semibold">{renderSliderDescription(field.value, SCALE_1_5_LABELS)}</span>
                            </div>
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}/>
                    <FormField control={form.control} name="repetitiveBehaviors" render={({ field }) => ( //q9
                        <FormItem className="space-y-3">
                        <FormLabel>Are you engaging in repetitive behaviors?</FormLabel>
                        <FormControl>
                            <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex space-x-4" disabled={form.formState.isSubmitting}>
                            {YES_NO_OPTIONS.map(opt => (
                                <FormItem key={opt} className="flex items-center space-x-2 space-y-0">
                                <FormControl><RadioGroupItem value={opt} /></FormControl>
                                <FormLabel className="font-normal">{opt}</FormLabel>
                                </FormItem>
                            ))}
                            </RadioGroup>
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}/>
                    {selectedRepetitiveBehaviors === 'Yes' && ( //q9
                        <FormField control={form.control} name="repetitiveBehaviorsDescription" render={({ field }) => (
                        <FormItem>
                            <FormLabel>If yes, please describe:</FormLabel>
                            <FormControl><Textarea placeholder="Describe behaviors..." {...field} rows={3} disabled={form.formState.isSubmitting} /></FormControl>
                            <FormMessage />
                        </FormItem>
                        )}/>
                    )}
                </CardContent>
              </Card>

              {/* Section: Physical and Lifestyle Factors */}
                <Card className="p-4 sm:p-6">
                    <CardHeader className="px-0 pt-0">
                    <CardTitle className="text-xl">Physical and Lifestyle Factors</CardTitle>
                    </CardHeader>
                    <CardContent className="px-0 pb-0 space-y-6">
                        <FormField control={form.control} name="exerciseFrequencyDetailed" render={({ field }) => ( // q10
                            <FormItem>
                            <FormLabel>How often do you exercise or engage in physical activity?</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value} disabled={form.formState.isSubmitting}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Select frequency" /></SelectTrigger></FormControl>
                                <SelectContent>
                                {EXERCISE_FREQUENCY_DETAILED_OPTIONS.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                            </FormItem>
                        )}/>
                        <FormField control={form.control} name="physicalSymptomsFrequency" render={({ field }) => ( //q11
                            <FormItem>
                            <FormLabel>Do you experience physical symptoms like headaches or fatigue? (1: Never, 5: Always)</FormLabel>
                            <FormControl>
                                <div className="flex items-center space-x-4 pt-2">
                                <Slider defaultValue={[field.value]} min={1} max={5} step={1} onValueChange={(value) => field.onChange(value[0])} className="w-[90%]" disabled={form.formState.isSubmitting} />
                                <span className="w-[10%] text-center text-md font-semibold">{renderSliderDescription(field.value, SCALE_1_5_LABELS)}</span>
                                </div>
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}/>
                         <FormField control={form.control} name="substanceUseCoping" render={({ field }) => ( // q12
                            <FormItem>
                            <FormLabel>Are you using any substances (alcohol, drugs, etc.) to cope with stress?</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value} disabled={form.formState.isSubmitting}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Select frequency" /></SelectTrigger></FormControl>
                                <SelectContent>
                                {SUBSTANCE_COPING_OPTIONS.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                            </FormItem>
                        )}/>
                        <FormField control={form.control} name="workSchoolStressLevel" render={({ field }) => ( // q13
                            <FormItem>
                            <FormLabel>How would you rate your stress level at work/school? (1: Low, 10: High)</FormLabel>
                            <FormControl>
                                <div className="flex items-center space-x-4 pt-2">
                                <Slider defaultValue={[field.value]} min={1} max={10} step={1} onValueChange={(value) => field.onChange(value[0])} className="w-[90%]" disabled={form.formState.isSubmitting} />
                                <span className="w-[10%] text-center text-lg font-semibold">{field.value}</span>
                                </div>
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}/>
                    </CardContent>
                </Card>

                {/* Section: Cognitive Patterns */}
                <Card className="p-4 sm:p-6">
                    <CardHeader className="px-0 pt-0">
                        <CardTitle className="text-xl">Cognitive Patterns</CardTitle>
                    </CardHeader>
                    <CardContent className="px-0 pb-0 space-y-6">
                        <FormField control={form.control} name="concentrationDifficultyFrequency" render={({ field }) => ( //q14
                            <FormItem>
                            <FormLabel>Do you find it hard to concentrate or make decisions? (1: Never, 5: Always)</FormLabel>
                            <FormControl>
                                <div className="flex items-center space-x-4 pt-2">
                                <Slider defaultValue={[field.value]} min={1} max={5} step={1} onValueChange={(value) => field.onChange(value[0])} className="w-[90%]" disabled={form.formState.isSubmitting} />
                                <span className="w-[10%] text-center text-md font-semibold">{renderSliderDescription(field.value, SCALE_1_5_LABELS)}</span>
                                </div>
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}/>
                        <FormField control={form.control} name="recurringNegativeThoughts" render={({ field }) => ( //q15
                            <FormItem className="space-y-3">
                            <FormLabel>Do you have recurring negative thoughts or worries?</FormLabel>
                            <FormControl>
                                <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex space-x-4" disabled={form.formState.isSubmitting}>
                                {YES_NO_OPTIONS.map(opt => (
                                    <FormItem key={opt} className="flex items-center space-x-2 space-y-0">
                                    <FormControl><RadioGroupItem value={opt} /></FormControl>
                                    <FormLabel className="font-normal">{opt}</FormLabel>
                                    </FormItem>
                                ))}
                                </RadioGroup>
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}/>
                        {selectedRecurringNegativeThoughts === 'Yes' && ( //q15
                            <FormField control={form.control} name="negativeThoughtsDescription" render={({ field }) => (
                            <FormItem>
                                <FormLabel>If yes, please describe:</FormLabel>
                                <FormControl><Textarea placeholder="Describe thoughts..." {...field} rows={3} disabled={form.formState.isSubmitting} /></FormControl>
                                <FormMessage />
                            </FormItem>
                            )}/>
                        )}
                        <FormField control={form.control} name="overwhelmedByTasksFrequency" render={({ field }) => ( //q16
                            <FormItem>
                            <FormLabel>How often do you feel overwhelmed by daily tasks? (1: Never, 5: Always)</FormLabel>
                            <FormControl>
                                <div className="flex items-center space-x-4 pt-2">
                                <Slider defaultValue={[field.value]} min={1} max={5} step={1} onValueChange={(value) => field.onChange(value[0])} className="w-[90%]" disabled={form.formState.isSubmitting} />
                                <span className="w-[10%] text-center text-md font-semibold">{renderSliderDescription(field.value, SCALE_1_5_LABELS)}</span>
                                </div>
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}/>
                        <FormField control={form.control} name="hopefulnessFuture" render={({ field }) => ( //q17
                            <FormItem>
                            <FormLabel>Do you feel hopeful about the future? (1: Not at all, 10: Extremely hopeful)</FormLabel>
                            <FormControl>
                                <div className="flex items-center space-x-4 pt-2">
                                <Slider defaultValue={[field.value]} min={1} max={10} step={1} onValueChange={(value) => field.onChange(value[0])} className="w-[90%]" disabled={form.formState.isSubmitting} />
                                <span className="w-[10%] text-center text-lg font-semibold">{field.value}</span>
                                </div>
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}/>
                    </CardContent>
                </Card>

                {/* Section: Support System and History */}
                <Card className="p-4 sm:p-6">
                    <CardHeader className="px-0 pt-0">
                    <CardTitle className="text-xl">Support System and History</CardTitle>
                    </CardHeader>
                    <CardContent className="px-0 pb-0 space-y-6">
                         {/* Existing Mental Health History Fields Moved Here */}
                        <FormField control={form.control} name="diagnosisHistory" render={({ field }) => (
                            <FormItem className="space-y-3">
                            <FormLabel>Have you been diagnosed with any mental health conditions?</FormLabel>
                            <FormControl>
                                <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col space-y-1" disabled={form.formState.isSubmitting}>
                                {DIAGNOSIS_HISTORY_OPTIONS.map(opt => (
                                    <FormItem key={opt} className="flex items-center space-x-3 space-y-0">
                                    <FormControl><RadioGroupItem value={opt} /></FormControl>
                                    <FormLabel className="font-normal">{opt}</FormLabel>
                                    </FormItem>
                                ))}
                                </RadioGroup>
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}/>
                        {diagnosisHistoryValue === 'Yes' && (
                            <FormField control={form.control} name="diagnoses" render={() => (
                            <FormItem>
                                <FormLabel>Please select any conditions you've been diagnosed with:</FormLabel>
                                <FormDescription>Select all that apply.</FormDescription>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-2">
                                {DIAGNOSES_CHECKBOX_OPTIONS.map((item) => (
                                    <FormField key={item.id} control={form.control} name="diagnoses"
                                    render={({ field }) => (
                                        <FormItem key={item.id} className="flex flex-row items-center space-x-3 space-y-0 p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                                        <FormControl>
                                            <Checkbox checked={field.value?.includes(item.id)}
                                            onCheckedChange={(checked) => checked ? field.onChange([...(field.value || []), item.id]) : field.onChange((field.value || []).filter((value) => value !== item.id))}
                                            disabled={form.formState.isSubmitting}/>
                                        </FormControl>
                                        <FormLabel className="font-normal cursor-pointer">{item.label}</FormLabel>
                                        </FormItem>
                                    )} /> ))}
                                </div>
                                <FormMessage />
                                {diagnosesValue?.includes('other') && (
                                <FormField control={form.control} name="otherDiagnosis" render={({ field }) => (
                                    <FormItem className="mt-4">
                                    <FormLabel>If "Other", please specify:</FormLabel>
                                    <FormControl><Input placeholder="Specify other diagnosis" {...field} disabled={form.formState.isSubmitting} /></FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}/>
                                )}
                            </FormItem>
                            )}/>
                        )}
                        <FormField control={form.control} name="currentTreatment" render={({ field }) => (
                            <FormItem className="space-y-3">
                            <FormLabel>Are you currently seeing a therapist or mental health professional?</FormLabel>
                            <FormControl>
                                <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col space-y-1" disabled={form.formState.isSubmitting}>
                                {CURRENT_TREATMENT_OPTIONS.map(opt => (
                                    <FormItem key={opt} className="flex items-center space-x-3 space-y-0">
                                    <FormControl><RadioGroupItem value={opt} /></FormControl>
                                    <FormLabel className="font-normal">{opt}</FormLabel>
                                    </FormItem>
                                ))}
                                </RadioGroup>
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}/>
                        <FormField control={form.control} name="mentalHealthMedication" render={({ field }) => ( //q18
                            <FormItem className="space-y-3">
                            <FormLabel>Do you take any medicine for your mental health currently?</FormLabel>
                            <FormControl>
                                <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex space-x-4" disabled={form.formState.isSubmitting}>
                                {YES_NO_OPTIONS.map(opt => (
                                    <FormItem key={opt} className="flex items-center space-x-2 space-y-0">
                                    <FormControl><RadioGroupItem value={opt} /></FormControl>
                                    <FormLabel className="font-normal">{opt}</FormLabel>
                                    </FormItem>
                                ))}
                                </RadioGroup>
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}/>
                        {selectedMentalHealthMedication === 'Yes' && ( //q18
                            <FormField control={form.control} name="medicationDetails" render={({ field }) => (
                            <FormItem>
                                <FormLabel>If yes, please specify:</FormLabel>
                                <FormControl><Textarea placeholder="Medication name and dosage if comfortable..." {...field} rows={3} disabled={form.formState.isSubmitting} /></FormControl>
                                <FormMessage />
                            </FormItem>
                            )}/>
                        )}
                        <FormField control={form.control} name="socialSupportAvailability" render={({ field }) => ( //q19
                            <FormItem>
                            <FormLabel>Do you have someone you can talk to about your feelings?</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value} disabled={form.formState.isSubmitting}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Select an option" /></SelectTrigger></FormControl>
                                <SelectContent>
                                {SOCIAL_SUPPORT_OPTIONS.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                            </FormItem>
                        )}/>
                        <FormField control={form.control} name="recentLifeChanges" render={({ field }) => ( //q20
                            <FormItem className="space-y-3">
                            <FormLabel>Have you experienced any major life changes recently (e.g., job loss, move, bereavement)?</FormLabel>
                            <FormControl>
                                <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex space-x-4" disabled={form.formState.isSubmitting}>
                                {YES_NO_OPTIONS.map(opt => (
                                    <FormItem key={opt} className="flex items-center space-x-2 space-y-0">
                                    <FormControl><RadioGroupItem value={opt} /></FormControl>
                                    <FormLabel className="font-normal">{opt}</FormLabel>
                                    </FormItem>
                                ))}
                                </RadioGroup>
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}/>
                        {selectedRecentLifeChanges === 'Yes' && ( //q20
                            <FormField control={form.control} name="lifeChangesDescription" render={({ field }) => (
                            <FormItem>
                                <FormLabel>If yes, please describe briefly:</FormLabel>
                                <FormControl><Textarea placeholder="Describe changes..." {...field} rows={3} disabled={form.formState.isSubmitting} /></FormControl>
                                <FormMessage />
                            </FormItem>
                            )}/>
                        )}
                    </CardContent>
                </Card>

              {/* Original Preferences & Other Info Section */}
              <Card className="p-4 sm:p-6">
                <CardHeader className="px-0 pt-0">
                  <CardTitle className="text-xl">Your Preferences & Other Information</CardTitle>
                </CardHeader>
                <CardContent className="px-0 pb-0 space-y-6">
                    <FormField control={form.control} name="sleepPatterns_original" render={({ field }) => ( 
                        <FormItem>
                        <FormLabel>On average, how many hours of sleep do you typically get per night? (Original Scale 3-12 hours)</FormLabel>
                        <FormControl>
                            <div className="flex items-center space-x-4 pt-2">
                            <Slider defaultValue={[field.value]} min={3} max={12} step={1} onValueChange={(value) => field.onChange(value[0])} className="w-[90%]" disabled={form.formState.isSubmitting}/>
                                <span className="w-[10%] text-center text-lg font-semibold">{field.value}</span>
                            </div>
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}/>
                    <FormField control={form.control} name="exerciseFrequency_original" render={({ field }) => (
                        <FormItem>
                        <FormLabel>How often do you engage in moderate physical exercise per week (e.g., brisk walking, jogging, gym)? (Original Options)</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={form.formState.isSubmitting}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select frequency" /></SelectTrigger></FormControl>
                            <SelectContent>{EXERCISE_FREQUENCY_OPTIONS_ORIGINAL.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}</SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}/>
                    <FormField control={form.control} name="substanceUse_original" render={({ field }) => (
                        <FormItem>
                        <FormLabel>What are your current alcohol and smoking habits? (Original Options)</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={form.formState.isSubmitting}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select an option" /></SelectTrigger></FormControl>
                            <SelectContent>{SUBSTANCE_USE_OPTIONS_ORIGINAL.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}</SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}/>
                    <FormField control={form.control} name="currentStressLevel_original" render={({ field }) => (
                        <FormItem>
                        <FormLabel>What is your current overall stress level? (Original Scale 1: Low, 10: High)</FormLabel>
                        <FormControl>
                            <div className="flex items-center space-x-4 pt-2">
                            <Slider defaultValue={[field.value]} min={1} max={10} step={1} onValueChange={(value) => field.onChange(value[0])} className="w-[90%]" disabled={form.formState.isSubmitting}/>
                                <span className="w-[10%] text-center text-lg font-semibold">{field.value}</span>
                            </div>
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}/>
                    <FormField control={form.control} name="todayMood_original_emoji" render={({ field }) => (
                        <FormItem>
                        <FormLabel>How are you feeling right now (quick emoji check)?</FormLabel>
                        <FormControl>
                            <div className="flex flex-wrap gap-2 pt-2">
                            {TODAY_MOOD_OPTIONS.map(mood => (
                                <Button key={mood.emoji} type="button" variant={selectedTodayMood_original_emoji === mood.emoji ? 'default' : 'outline'}
                                onClick={() => field.onChange(mood.emoji)} className="flex items-center gap-2 px-3 py-2 rounded-lg text-base" disabled={form.formState.isSubmitting}>
                                <span className="text-2xl">{mood.emoji}</span>{mood.label}
                                </Button>
                            ))}
                            </div>
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}/>
                    <FormField control={form.control} name="frequentEmotions" render={() => (
                        <FormItem>
                        <FormLabel>Which emotions do you experience frequently?</FormLabel>
                        <FormDescription>Select all that apply.</FormDescription>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-2">
                        {frequentEmotionsOptions.map((item) => (
                            <FormField key={item.id} control={form.control} name="frequentEmotions"
                            render={({ field }) => (
                                <FormItem key={item.id} className="flex flex-row items-center space-x-3 space-y-0 p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                                <FormControl>
                                    <Checkbox checked={field.value?.includes(item.id)}
                                    onCheckedChange={(checked) => checked ? field.onChange([...(field.value || []), item.id]) : field.onChange((field.value || []).filter((value) => value !== item.id))}
                                    disabled={form.formState.isSubmitting}/>
                                </FormControl>
                                <FormLabel className="font-normal cursor-pointer">{item.label}</FormLabel>
                                </FormItem>
                            )}/> ))}
                        </div>
                        <FormMessage />
                        </FormItem>
                    )}/>
                    <FormField control={form.control} name="supportAreas" render={() => (
                        <FormItem>
                        <FormLabel>In which areas do you seek support?</FormLabel>
                        <FormDescription>Select all that apply.</FormDescription>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-2">
                        {supportAreasOptions.map((item) => (
                            <FormField key={item.id} control={form.control} name="supportAreas"
                            render={({ field }) => (
                                <FormItem key={item.id} className="flex flex-row items-center space-x-3 space-y-0 p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                                <FormControl>
                                    <Checkbox checked={field.value?.includes(item.id)}
                                    onCheckedChange={(checked) => checked ? field.onChange([...(field.value || []), item.id]) : field.onChange((field.value || []).filter((value) => value !== item.id))}
                                    disabled={form.formState.isSubmitting}/>
                                </FormControl>
                                <FormLabel className="font-normal cursor-pointer">{item.label}</FormLabel>
                                </FormItem>
                            )}/>))}
                        </div>
                        <FormMessage />
                        </FormItem>
                    )}/>
                    <FormField control={form.control} name="contentPreferences" render={() => (
                        <FormItem>
                        <FormLabel>What types of content do you prefer?</FormLabel>
                        <FormDescription>Select all that apply.</FormDescription>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-2">
                        {contentPreferencesOptions.map((item) => (
                            <FormField key={item.id} control={form.control} name="contentPreferences"
                            render={({ field }) => (
                                <FormItem key={item.id} className="flex flex-row items-center space-x-3 space-y-0 p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                                <FormControl>
                                    <Checkbox checked={field.value?.includes(item.id)}
                                    onCheckedChange={(checked) => checked ? field.onChange([...(field.value || []), item.id]) : field.onChange((field.value || []).filter((value) => value !== item.id))}
                                    disabled={form.formState.isSubmitting}/>
                                </FormControl>
                                <FormLabel className="font-normal cursor-pointer">{item.label}</FormLabel>
                                </FormItem>
                            )}/> ))}
                        </div>
                        <FormMessage />
                        </FormItem>
                    )}/>
                    <FormField control={form.control} name="checkInFrequency" render={({ field }) => (
                        <FormItem>
                        <FormLabel>Preferred frequency for check-ins</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={form.formState.isSubmitting}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select frequency" /></SelectTrigger></FormControl>
                            <SelectContent>{CHECKIN_FREQUENCY_OPTIONS.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}</SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}/>
                    <FormField control={form.control} name="preferredTime" render={({ field }) => (
                        <FormItem>
                        <FormLabel>Preferred time for check-ins</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={form.formState.isSubmitting}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select time" /></SelectTrigger></FormControl>
                            <SelectContent>{PREFERRED_TIME_OPTIONS.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}</SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}/>
                    <FormField control={form.control} name="additionalInformation" render={({ field }) => (
                        <FormItem>
                        <FormLabel>Any additional information you want to share (Optional)</FormLabel>
                        <FormControl><Textarea placeholder="Share anything else that might be helpful..." {...field} rows={5} disabled={form.formState.isSubmitting} /></FormControl>
                        <FormMessage />
                        </FormItem>
                    )}/>
                </CardContent>
              </Card>

              <Button type="submit" size="lg" className="w-full text-lg py-3 rounded-lg shadow-md hover:shadow-lg transition-shadow" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Saving & Preparing Dashboard...
                  </>
                ) : "Save Intake Information & Get Analysis"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

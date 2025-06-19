
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
import { analyzeInitialIntake, type InitialIntakeInput } from '@/ai/flows/initial-intake-analyzer';
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
const EXERCISE_FREQUENCY_OPTIONS = [
  'None', '1-2 times per week', '3-4 times per week', '5-6 times per week', 'Daily'
] as const;
const SUBSTANCE_USE_OPTIONS = ['Yes often', 'Occasionally', 'No'] as const;
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

// New options for added questions
const YES_NO_OPTIONS = ['Yes', 'No'] as const;
const PANIC_ANXIETY_FREQUENCY_OPTIONS = ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'] as const;
const DETAILED_MOOD_OPTIONS = ['Happy', 'Sad', 'Anxious', 'Overwhelmed', 'Numb', 'Other'] as const;
const AVG_SLEEP_HOURS_OPTIONS = ['Less than 4', '4-6', '6-8', 'More than 8'] as const;
const APPETITE_CHANGE_OPTIONS = ['Increased', 'Decreased', 'No Change'] as const;
const EXERCISE_FREQUENCY_DETAILED_OPTIONS = ['Daily', '2-3/week', 'Rarely', 'Never'] as const;
const SUBSTANCE_COPING_OPTIONS = ['Never', 'Occasionally', 'Frequently'] as const;
const SOCIAL_SUPPORT_OPTIONS = ['Yes', 'No', 'Sometimes'] as const;

const SCALE_1_5_LABELS = { 1: "Never", 2: "Rarely", 3: "Sometimes", 4: "Often", 5: "Always" };


const intakeFormSchema = z.object({
  // Existing fields
  fullName: z.string().optional(),
  age: z.coerce.number().min(18, { message: "You must be at least 18 years old." }),
  gender: z.enum(GENDERS),
  city: z.string().min(1, { message: "City is required." }),
  timezone: z.enum(TIMEZONE_OPTIONS),
  diagnosisHistory: z.enum(DIAGNOSIS_HISTORY_OPTIONS),
  diagnoses: z.array(z.string()).optional(),
  otherDiagnosis: z.string().optional(),
  currentTreatment: z.enum(CURRENT_TREATMENT_OPTIONS),
  sleepPatterns: z.coerce.number().min(3).max(12), // Existing sleep slider
  exerciseFrequency: z.enum(EXERCISE_FREQUENCY_OPTIONS), // Existing exercise frequency
  substanceUse: z.enum(SUBSTANCE_USE_OPTIONS), // Existing substance use
  currentStressLevel: z.number().min(1).max(10),
  todayMood: z.string().min(1, { message: "Please select your mood." }), // Emoji mood
  frequentEmotions: z.array(z.string()).refine(value => value.some(item => item), { message: "You have to select at least one emotion." }),
  supportAreas: z.array(z.string()).refine(value => value.some(item => item), { message: "You have to select at least one support area." }),
  contentPreferences: z.array(z.string()).refine(value => value.some(item => item), { message: "You have to select at least one content preference." }),
  checkInFrequency: z.enum(CHECKIN_FREQUENCY_OPTIONS),
  preferredTime: z.enum(PREFERRED_TIME_OPTIONS),
  additionalInformation: z.string().optional(),

  // New fields: Emotional State
  sadnessFrequencyWeekly: z.number().min(1).max(10).default(1),
  panicAttackFrequency: z.enum(PANIC_ANXIETY_FREQUENCY_OPTIONS).default('Never'),
  moodTodayDetailed: z.enum(DETAILED_MOOD_OPTIONS).default('Happy'),
  otherMoodToday: z.string().optional(),
  hopelessPastTwoWeeks: z.enum(YES_NO_OPTIONS).default('No'),
  hopelessDescription: z.string().optional(),
  currentWorryIntensity: z.number().min(1).max(10).default(1),

  // New fields: Behavioral Patterns
  averageSleepHoursNightly: z.enum(AVG_SLEEP_HOURS_OPTIONS).default('6-8'),
  appetiteChanges: z.enum(APPETITE_CHANGE_OPTIONS).default('No Change'),
  socialAvoidanceFrequency: z.number().min(1).max(5).default(1), // 1=Never, 5=Always
  repetitiveBehaviors: z.enum(YES_NO_OPTIONS).default('No'),
  repetitiveBehaviorsDescription: z.string().optional(),
  
  // New fields: Physical and Lifestyle Factors
  exerciseFrequencyDetailed: z.enum(EXERCISE_FREQUENCY_DETAILED_OPTIONS).default('Rarely'),
  physicalSymptomsFrequency: z.number().min(1).max(5).default(1), // 1=Never, 5=Always
  substanceUseCoping: z.enum(SUBSTANCE_COPING_OPTIONS).default('Never'),
  workSchoolStressLevel: z.number().min(1).max(10).default(1),

  // New fields: Cognitive Patterns
  concentrationDifficultyFrequency: z.number().min(1).max(5).default(1), // 1=Never, 5=Always
  recurringNegativeThoughts: z.enum(YES_NO_OPTIONS).default('No'),
  negativeThoughtsDescription: z.string().optional(),
  overwhelmedByTasksFrequency: z.number().min(1).max(5).default(1), // 1=Never, 5=Always
  hopefulnessFuture: z.number().min(1).max(10).default(5),

  // New fields: Support System and History
  mentalHealthMedication: z.enum(YES_NO_OPTIONS).default('No'),
  medicationDetails: z.string().optional(),
  socialSupportAvailability: z.enum(SOCIAL_SUPPORT_OPTIONS).default('Yes'),
  recentLifeChanges: z.enum(YES_NO_OPTIONS).default('No'),
  lifeChangesDescription: z.string().optional(),
})
.refine(data => {
  if (data.diagnosisHistory === 'Yes' && data.diagnoses?.includes('other') && !data.otherDiagnosis?.trim()) {
    return false;
  }
  return true;
}, { message: "Please specify your diagnosis if 'Other' is selected.", path: ['otherDiagnosis']})
.refine(data => !(data.moodTodayDetailed === 'Other' && !data.otherMoodToday?.trim()), {
  message: "Please specify if 'Other' mood is selected.", path: ['otherMoodToday']
})
.refine(data => !(data.hopelessPastTwoWeeks === 'Yes' && !data.hopelessDescription?.trim()), {
  message: "Please describe if you felt hopeless.", path: ['hopelessDescription']
})
.refine(data => !(data.repetitiveBehaviors === 'Yes' && !data.repetitiveBehaviorsDescription?.trim()), {
  message: "Please describe the repetitive behaviors.", path: ['repetitiveBehaviorsDescription']
})
.refine(data => !(data.recurringNegativeThoughts === 'Yes' && !data.negativeThoughtsDescription?.trim()), {
  message: "Please describe the negative thoughts.", path: ['negativeThoughtsDescription']
})
.refine(data => !(data.mentalHealthMedication === 'Yes' && !data.medicationDetails?.trim()), {
  message: "Please specify your medication.", path: ['medicationDetails']
})
.refine(data => !(data.recentLifeChanges === 'Yes' && !data.lifeChangesDescription?.trim()), {
  message: "Please describe the recent life changes.", path: ['lifeChangesDescription']
});

type IntakeFormValues = z.infer<typeof intakeFormSchema>;

const USER_ID_PLACEHOLDER = "mockUserId"; 
const INTAKE_ANALYSIS_LS_KEY = 'wellspringIntakeAnalysisResults';

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
      sleepPatterns: 7,
      exerciseFrequency: '1-2 times per week',
      substanceUse: 'No',
      currentStressLevel: 5,
      todayMood: '',
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
  const selectedTodayMood = form.watch('todayMood'); // For existing emoji mood picker
  const selectedDetailedMood = form.watch('moodTodayDetailed');
  const selectedHopeless = form.watch('hopelessPastTwoWeeks');
  const selectedRepetitiveBehaviors = form.watch('repetitiveBehaviors');
  const selectedRecurringNegativeThoughts = form.watch('recurringNegativeThoughts');
  const selectedMentalHealthMedication = form.watch('mentalHealthMedication');
  const selectedRecentLifeChanges = form.watch('recentLifeChanges');

  const onSubmit = async (data: IntakeFormValues) => {
    try {
      let finalDiagnoses: string[] = data.diagnoses || [];
      if (data.diagnosisHistory === 'Yes' && data.diagnoses?.includes('other') && data.otherDiagnosis?.trim()) {
        finalDiagnoses = finalDiagnoses.filter(d => d !== 'other');
        finalDiagnoses.push(data.otherDiagnosis.trim());
      }
      
      const dataForLocalStorage = {
        ...data,
        location: `${data.city}, ${data.timezone}`,
        diagnoses: finalDiagnoses,
        age: Number(data.age),
        sleepPatterns: Number(data.sleepPatterns), // existing
        currentStressLevel: Number(data.currentStressLevel), // existing
        // Ensure new numeric fields are numbers
        sadnessFrequencyWeekly: Number(data.sadnessFrequencyWeekly),
        currentWorryIntensity: Number(data.currentWorryIntensity),
        socialAvoidanceFrequency: Number(data.socialAvoidanceFrequency),
        physicalSymptomsFrequency: Number(data.physicalSymptomsFrequency),
        workSchoolStressLevel: Number(data.workSchoolStressLevel),
        concentrationDifficultyFrequency: Number(data.concentrationDifficultyFrequency),
        overwhelmedByTasksFrequency: Number(data.overwhelmedByTasksFrequency),
        hopefulnessFuture: Number(data.hopefulnessFuture),
        updatedAt: new Date().toISOString(), 
      };
      // Remove fields not needed for storage or AI directly
      const { city, timezone, otherDiagnosis, ...payloadToStoreInLocalStorage } = dataForLocalStorage;
      
      localStorage.setItem('wellspringUserIntakeData', JSON.stringify(payloadToStoreInLocalStorage));
      console.log("Intake data saved to localStorage.");

      if (db) {
        const payloadForFirestore = {
          ...payloadToStoreInLocalStorage, 
          updatedAt: serverTimestamp(), 
        };
        try {
          const userIntakeDocRef = doc(db, "intakeForms", USER_ID_PLACEHOLDER);
          await setDoc(userIntakeDocRef, payloadForFirestore, { merge: true }); 
          console.log("Intake data also saved to Firestore.");
        } catch (firestoreError: any) {
            console.warn("MINDSTRIDE: Failed to save intake data to Firestore:", firestoreError.message);
            toast({
                title: "Cloud Save Issue",
                description: "Could not save data to the cloud, but it's saved locally.",
                variant: "default", // Less alarming than "destructive"
                duration: 7000,
            });
        }
      } else {
        console.warn("MINDSTRIDE: Firestore not configured. Intake data saved locally only.");
      }
      
      const payloadForAnalysis: InitialIntakeInput = {
        ...data, 
        location: `${data.city}, ${data.timezone}`, 
        diagnoses: finalDiagnoses,
        age: Number(data.age),
        sleepPatterns: Number(data.sleepPatterns),
        currentStressLevel: Number(data.currentStressLevel),
        // Pass new fields as numbers where appropriate
        sadnessFrequencyWeekly: Number(data.sadnessFrequencyWeekly),
        currentWorryIntensity: Number(data.currentWorryIntensity),
        socialAvoidanceFrequency: Number(data.socialAvoidanceFrequency),
        physicalSymptomsFrequency: Number(data.physicalSymptomsFrequency),
        workSchoolStressLevel: Number(data.workSchoolStressLevel),
        concentrationDifficultyFrequency: Number(data.concentrationDifficultyFrequency),
        overwhelmedByTasksFrequency: Number(data.overwhelmedByTasksFrequency),
        hopefulnessFuture: Number(data.hopefulnessFuture),
      };

      console.log("Starting Intake Analysis with extended data...");
      const analysisOutput = await analyzeInitialIntake(payloadForAnalysis);
      localStorage.setItem(INTAKE_ANALYSIS_LS_KEY, JSON.stringify(analysisOutput));
      console.log("Intake Analysis Complete. Results stored for AI Chat.", analysisOutput);
      
      toast({
        title: "Intake Information Saved & Analyzed!",
        description: "Your experience is now being personalized. Redirecting to dashboard...",
        duration: 5000,
      });
      
      router.push('/dashboard'); 

    } catch (error) {
      console.error("Failed to save intake form or analyze:", error);
      toast({
        title: "Error During Submission",
        description: "Failed to save or analyze your intake form. Please try again. Details: " + (error instanceof Error ? error.message : String(error)),
        variant: "destructive",
        duration: 7000,
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
              
              {/* Existing Demographics Section */}
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
                  <FormField control={form.control} name="sadnessFrequencyWeekly" render={({ field }) => (
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
                  <FormField control={form.control} name="panicAttackFrequency" render={({ field }) => (
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
                  <FormField control={form.control} name="moodTodayDetailed" render={({ field }) => (
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
                  {selectedDetailedMood === 'Other' && (
                    <FormField control={form.control} name="otherMoodToday" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Please specify your mood:</FormLabel>
                        <FormControl><Input placeholder="Specify other mood" {...field} disabled={form.formState.isSubmitting} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}/>
                  )}
                  <FormField control={form.control} name="hopelessPastTwoWeeks" render={({ field }) => (
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
                  {selectedHopeless === 'Yes' && (
                    <FormField control={form.control} name="hopelessDescription" render={({ field }) => (
                      <FormItem>
                        <FormLabel>If yes, please describe briefly:</FormLabel>
                        <FormControl><Textarea placeholder="Describe your feelings..." {...field} rows={3} disabled={form.formState.isSubmitting} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}/>
                  )}
                  <FormField control={form.control} name="currentWorryIntensity" render={({ field }) => (
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
                    <FormField control={form.control} name="averageSleepHoursNightly" render={({ field }) => (
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
                     <FormField control={form.control} name="appetiteChanges" render={({ field }) => (
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
                    <FormField control={form.control} name="socialAvoidanceFrequency" render={({ field }) => (
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
                    <FormField control={form.control} name="repetitiveBehaviors" render={({ field }) => (
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
                    {selectedRepetitiveBehaviors === 'Yes' && (
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
                        {/* Existing Mental Health History Section */}
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
                                    <FormField
                                    key={item.id}
                                    control={form.control}
                                    name="diagnoses"
                                    render={({ field }) => {
                                        return (
                                        <FormItem key={item.id} className="flex flex-row items-center space-x-3 space-y-0 p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                                            <FormControl>
                                            <Checkbox
                                                checked={field.value?.includes(item.id)}
                                                onCheckedChange={(checked) => {
                                                return checked
                                                    ? field.onChange([...(field.value || []), item.id])
                                                    : field.onChange((field.value || []).filter((value) => value !== item.id));
                                                }}
                                                disabled={form.formState.isSubmitting}
                                            />
                                            </FormControl>
                                            <FormLabel className="font-normal cursor-pointer">{item.label}</FormLabel>
                                        </FormItem>
                                        )
                                    }}
                                    />
                                ))}
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
                        
                        <FormField control={form.control} name="sleepPatterns" render={({ field }) => ( // Existing sleep
                            <FormItem>
                            <FormLabel>On average, how many hours of sleep do you typically get per night? (Scale 3-12 hours)</FormLabel>
                            <FormControl>
                                <div className="flex items-center space-x-4 pt-2">
                                <Slider
                                    defaultValue={[field.value]}
                                    min={3} max={12} step={1}
                                    onValueChange={(value) => field.onChange(value[0])}
                                    className="w-[90%]"
                                    disabled={form.formState.isSubmitting}
                                    />
                                    <span className="w-[10%] text-center text-lg font-semibold">{field.value}</span>
                                </div>
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}/>
                        
                        <FormField control={form.control} name="exerciseFrequency" render={({ field }) => ( // Existing exercise
                            <FormItem>
                            <FormLabel>How often do you engage in moderate physical exercise per week (e.g., brisk walking, jogging, gym)?</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value} disabled={form.formState.isSubmitting}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Select frequency" /></SelectTrigger></FormControl>
                                <SelectContent>
                                {EXERCISE_FREQUENCY_OPTIONS.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                            </FormItem>
                        )}/>

                        <FormField control={form.control} name="exerciseFrequencyDetailed" render={({ field }) => ( // New exercise
                            <FormItem>
                            <FormLabel>How often do you exercise or engage in physical activity (alternative measure)?</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value} disabled={form.formState.isSubmitting}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Select frequency" /></SelectTrigger></FormControl>
                                <SelectContent>
                                {EXERCISE_FREQUENCY_DETAILED_OPTIONS.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                            </FormItem>
                        )}/>

                        <FormField control={form.control} name="substanceUse" render={({ field }) => ( // Existing substance use
                            <FormItem>
                            <FormLabel>What are your current alcohol and smoking habits?</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value} disabled={form.formState.isSubmitting}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Select an option" /></SelectTrigger></FormControl>
                                <SelectContent>
                                {SUBSTANCE_USE_OPTIONS.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                            </FormItem>
                        )}/>
                         <FormField control={form.control} name="substanceUseCoping" render={({ field }) => ( // New substance use for coping
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


                        <FormField control={form.control} name="currentStressLevel" render={({ field }) => ( // Existing stress
                            <FormItem>
                            <FormLabel>What is your current overall stress level? (1: Low, 10: High)</FormLabel>
                            <FormControl>
                                <div className="flex items-center space-x-4 pt-2">
                                <Slider
                                    defaultValue={[field.value]}
                                    min={1} max={10} step={1}
                                    onValueChange={(value) => field.onChange(value[0])}
                                    className="w-[90%]"
                                    disabled={form.formState.isSubmitting}
                                    />
                                    <span className="w-[10%] text-center text-lg font-semibold">{field.value}</span>
                                </div>
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}/>
                        <FormField control={form.control} name="workSchoolStressLevel" render={({ field }) => ( // New work/school stress
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
                        <FormField control={form.control} name="physicalSymptomsFrequency" render={({ field }) => (
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
                    </CardContent>
                </Card>

                {/* Section: Cognitive Patterns */}
                <Card className="p-4 sm:p-6">
                    <CardHeader className="px-0 pt-0">
                        <CardTitle className="text-xl">Cognitive Patterns</CardTitle>
                    </CardHeader>
                    <CardContent className="px-0 pb-0 space-y-6">
                        <FormField control={form.control} name="concentrationDifficultyFrequency" render={({ field }) => (
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
                        <FormField control={form.control} name="recurringNegativeThoughts" render={({ field }) => (
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
                        {selectedRecurringNegativeThoughts === 'Yes' && (
                            <FormField control={form.control} name="negativeThoughtsDescription" render={({ field }) => (
                            <FormItem>
                                <FormLabel>If yes, please describe:</FormLabel>
                                <FormControl><Textarea placeholder="Describe thoughts..." {...field} rows={3} disabled={form.formState.isSubmitting} /></FormControl>
                                <FormMessage />
                            </FormItem>
                            )}/>
                        )}
                        <FormField control={form.control} name="overwhelmedByTasksFrequency" render={({ field }) => (
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
                        <FormField control={form.control} name="hopefulnessFuture" render={({ field }) => (
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
                        <FormField control={form.control} name="mentalHealthMedication" render={({ field }) => (
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
                        {selectedMentalHealthMedication === 'Yes' && (
                            <FormField control={form.control} name="medicationDetails" render={({ field }) => (
                            <FormItem>
                                <FormLabel>If yes, please specify:</FormLabel>
                                <FormControl><Textarea placeholder="Medication name and dosage if comfortable..." {...field} rows={3} disabled={form.formState.isSubmitting} /></FormControl>
                                <FormMessage />
                            </FormItem>
                            )}/>
                        )}
                        <FormField control={form.control} name="socialSupportAvailability" render={({ field }) => (
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
                        <FormField control={form.control} name="recentLifeChanges" render={({ field }) => (
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
                        {selectedRecentLifeChanges === 'Yes' && (
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

              {/* Existing Preferences Section */}
              <Card className="p-4 sm:p-6">
                <CardHeader className="px-0 pt-0">
                  <CardTitle className="text-xl">Your Preferences</CardTitle>
                </CardHeader>
                <CardContent className="px-0 pb-0 space-y-6">
                    <FormField control={form.control} name="todayMood" render={({ field }) => ( // Existing emoji mood
                        <FormItem>
                        <FormLabel>How are you feeling right now (quick check)?</FormLabel>
                        <FormControl>
                            <div className="flex flex-wrap gap-2 pt-2">
                            {TODAY_MOOD_OPTIONS.map(mood => (
                                <Button
                                key={mood.emoji}
                                type="button"
                                variant={selectedTodayMood === mood.emoji ? 'default' : 'outline'}
                                onClick={() => field.onChange(mood.emoji)}
                                className="flex items-center gap-2 px-3 py-2 rounded-lg text-base"
                                disabled={form.formState.isSubmitting}
                                >
                                <span className="text-2xl">{mood.emoji}</span>
                                {mood.label}
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
                            <FormField
                            key={item.id}
                            control={form.control}
                            name="frequentEmotions"
                            render={({ field }) => {
                                return (
                                <FormItem key={item.id} className="flex flex-row items-center space-x-3 space-y-0 p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                                    <FormControl>
                                    <Checkbox
                                        checked={field.value?.includes(item.id)}
                                        onCheckedChange={(checked) => {
                                        return checked
                                            ? field.onChange([...(field.value || []), item.id])
                                            : field.onChange((field.value || []).filter((value) => value !== item.id));
                                        }}
                                        disabled={form.formState.isSubmitting}
                                    />
                                    </FormControl>
                                    <FormLabel className="font-normal cursor-pointer">{item.label}</FormLabel>
                                </FormItem>
                                )
                            }}
                            />
                        ))}
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
                            <FormField
                            key={item.id}
                            control={form.control}
                            name="supportAreas"
                            render={({ field }) => {
                                return (
                                <FormItem key={item.id} className="flex flex-row items-center space-x-3 space-y-0 p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                                    <FormControl>
                                    <Checkbox
                                        checked={field.value?.includes(item.id)}
                                        onCheckedChange={(checked) => {
                                        return checked
                                            ? field.onChange([...(field.value || []), item.id])
                                            : field.onChange((field.value || []).filter((value) => value !== item.id));
                                        }}
                                        disabled={form.formState.isSubmitting}
                                    />
                                    </FormControl>
                                    <FormLabel className="font-normal cursor-pointer">{item.label}</FormLabel>
                                </FormItem>
                                )
                            }}
                            />
                        ))}
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
                            <FormField
                            key={item.id}
                            control={form.control}
                            name="contentPreferences"
                            render={({ field }) => {
                                return (
                                <FormItem key={item.id} className="flex flex-row items-center space-x-3 space-y-0 p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                                    <FormControl>
                                    <Checkbox
                                        checked={field.value?.includes(item.id)}
                                        onCheckedChange={(checked) => {
                                        return checked
                                            ? field.onChange([...(field.value || []), item.id])
                                            : field.onChange((field.value || []).filter((value) => value !== item.id));
                                        }}
                                        disabled={form.formState.isSubmitting}
                                    />
                                    </FormControl>
                                    <FormLabel className="font-normal cursor-pointer">{item.label}</FormLabel>
                                </FormItem>
                                )
                            }}
                            />
                        ))}
                        </div>
                        <FormMessage />
                        </FormItem>
                    )}/>

                    <FormField control={form.control} name="checkInFrequency" render={({ field }) => (
                        <FormItem>
                        <FormLabel>Preferred frequency for check-ins</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={form.formState.isSubmitting}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select frequency" /></SelectTrigger></FormControl>
                            <SelectContent>
                            {CHECKIN_FREQUENCY_OPTIONS.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}/>

                    <FormField control={form.control} name="preferredTime" render={({ field }) => (
                        <FormItem>
                        <FormLabel>Preferred time for check-ins</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={form.formState.isSubmitting}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select time" /></SelectTrigger></FormControl>
                            <SelectContent>
                            {PREFERRED_TIME_OPTIONS.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                            </SelectContent>
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
                ) : "Save Intake Information"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}


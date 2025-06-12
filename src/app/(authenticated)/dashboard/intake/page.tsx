
"use client";

import { useState } from 'react'; // Removed useState for isSubmittingIntake
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
import { analyzeInitialIntake, type InitialIntakeInput, type InitialIntakeOutput } from '@/ai/flows/initial-intake-analyzer';
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

const intakeFormSchema = z.object({
  fullName: z.string().optional(),
  age: z.coerce.number().min(18, { message: "You must be at least 18 years old." }),
  gender: z.enum(GENDERS),
  city: z.string().min(1, { message: "City is required." }),
  timezone: z.enum(TIMEZONE_OPTIONS),
  diagnosisHistory: z.enum(DIAGNOSIS_HISTORY_OPTIONS),
  diagnoses: z.array(z.string()).optional(),
  otherDiagnosis: z.string().optional(),
  currentTreatment: z.enum(CURRENT_TREATMENT_OPTIONS),
  sleepPatterns: z.coerce.number().min(3).max(12),
  exerciseFrequency: z.enum(EXERCISE_FREQUENCY_OPTIONS),
  substanceUse: z.enum(SUBSTANCE_USE_OPTIONS),
  currentStressLevel: z.number().min(1).max(10),
  todayMood: z.string().min(1, { message: "Please select your mood." }),
  frequentEmotions: z.array(z.string()).refine(value => value.some(item => item), { message: "You have to select at least one emotion." }),
  supportAreas: z.array(z.string()).refine(value => value.some(item => item), { message: "You have to select at least one support area." }),
  contentPreferences: z.array(z.string()).refine(value => value.some(item => item), { message: "You have to select at least one content preference." }),
  checkInFrequency: z.enum(CHECKIN_FREQUENCY_OPTIONS),
  preferredTime: z.enum(PREFERRED_TIME_OPTIONS),
  additionalInformation: z.string().optional(),
}).refine(data => {
  if (data.diagnosisHistory === 'Yes' && data.diagnoses?.includes('other') && !data.otherDiagnosis?.trim()) {
    return false;
  }
  return true;
}, {
  message: "Please specify your diagnosis if 'Other' is selected.",
  path: ['otherDiagnosis'],
});

type IntakeFormValues = z.infer<typeof intakeFormSchema>;

const USER_ID_PLACEHOLDER = "mockUserId"; 
const INTAKE_ANALYSIS_LS_KEY = 'wellspringIntakeAnalysisResults';

export default function IntakeFormPage() {
  const { toast } = useToast();
  const router = useRouter();
  // Removed isSubmittingIntake local state

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
    },
  });

  const diagnosisHistoryValue = form.watch('diagnosisHistory');
  const diagnosesValue = form.watch('diagnoses');
  const selectedTodayMood = form.watch('todayMood');

  const onSubmit = async (data: IntakeFormValues) => {
    // form.formState.isSubmitting will be true here
    try {
      let finalDiagnoses: string[] = data.diagnoses || [];
      if (data.diagnosisHistory === 'Yes' && data.diagnoses?.includes('other')) {
        finalDiagnoses = finalDiagnoses.filter(d => d !== 'other');
        if (data.otherDiagnosis?.trim()) {
          finalDiagnoses.push(data.otherDiagnosis.trim());
        }
      }
      
      const processedDataForStorage = {
        ...data,
        location: `${data.city}, ${data.timezone}`,
        diagnoses: finalDiagnoses,
        age: Number(data.age),
        sleepPatterns: Number(data.sleepPatterns),
        currentStressLevel: Number(data.currentStressLevel),
        updatedAt: serverTimestamp(), 
      };
      
      const { city, timezone, otherDiagnosis, ...payloadToStore } = processedDataForStorage;
      const payloadForAnalysis: InitialIntakeInput = {
        ...data, 
        location: `${data.city}, ${data.timezone}`, 
        diagnoses: finalDiagnoses,
        age: Number(data.age),
        sleepPatterns: Number(data.sleepPatterns),
        currentStressLevel: Number(data.currentStressLevel),
      };

      // Save to localStorage and Firestore
      localStorage.setItem('wellspringUserIntakeData', JSON.stringify(payloadToStore));
      const userIntakeDocRef = doc(db, "intakeForms", USER_ID_PLACEHOLDER);
      await setDoc(userIntakeDocRef, payloadToStore, { merge: true }); 

      // Now, AWAIT the AI Analysis
      console.log("Starting Intake Analysis...");
      const analysisOutput = await analyzeInitialIntake(payloadForAnalysis);
      localStorage.setItem(INTAKE_ANALYSIS_LS_KEY, JSON.stringify(analysisOutput));
      console.log("Intake Analysis Complete. Results stored for AI Chat.", analysisOutput);
      
      toast({
        title: "Intake Information Saved & Analyzed",
        description: "Your experience is now being personalized. Redirecting to dashboard.",
      });
      
      router.push('/dashboard'); 

    } catch (error) {
      console.error("Failed to save intake form or analyze:", error);
      toast({
        title: "Error",
        description: "Failed to save or analyze your intake form. Please try again. Details: " + (error instanceof Error ? error.message : String(error)),
        variant: "destructive",
        duration: 7000,
      });
      // react-hook-form automatically sets form.formState.isSubmitting to false on error
    }
    // react-hook-form automatically sets form.formState.isSubmitting to false on success/completion
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
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              
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
              
              <FormField control={form.control} name="sleepPatterns" render={({ field }) => (
                <FormItem>
                  <FormLabel>Average hours of sleep per night (3-12 hours)</FormLabel>
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
              
              <FormField control={form.control} name="exerciseFrequency" render={({ field }) => (
                <FormItem>
                  <FormLabel>Weekly exercise sessions (approx.)</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={form.formState.isSubmitting}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select frequency" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {EXERCISE_FREQUENCY_OPTIONS.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}/>

              <FormField control={form.control} name="substanceUse" render={({ field }) => (
                <FormItem>
                  <FormLabel>Alcohol and smoking habits</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={form.formState.isSubmitting}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select an option" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {SUBSTANCE_USE_OPTIONS.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}/>

              <FormField control={form.control} name="currentStressLevel" render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Stress Level (1: Low, 10: High)</FormLabel>
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

              <FormField control={form.control} name="todayMood" render={({ field }) => (
                <FormItem>
                  <FormLabel>How are you feeling today?</FormLabel>
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

    
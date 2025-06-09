
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

const GENDERS = ['Male', 'Female', 'Non-binary', 'Prefer not to say'] as const;
const DIAGNOSIS_HISTORY_OPTIONS = ['Yes', 'No', 'Prefer not to say'] as const;
const CURRENT_TREATMENT_OPTIONS = ['Yes', 'No', 'Prefer not to say'] as const;
const SUBSTANCE_USE_OPTIONS = ['Yes often', 'Occasionally', 'No'] as const;
const CHECKIN_FREQUENCY_OPTIONS = ['Daily', 'Weekly', 'Only when I ask'] as const;
const PREFERRED_TIME_OPTIONS = ['Morning', 'Afternoon', 'Evening', 'Night'] as const;

const frequentEmotionsOptions = [
  { id: 'happy', label: 'Happy' },
  { id: 'sad', label: 'Sad' },
  { id: 'anxious', label: 'Anxious' },
  { id: 'angry', label: 'Angry' },
  { id: 'calm', label: 'Calm' },
  { id: 'stressed', label: 'Stressed' },
  { id: 'overwhelmed', label: 'Overwhelmed' },
  { id: 'hopeful', label: 'Hopeful' },
];

const supportAreasOptions = [
  { id: 'stress', label: 'Managing Stress' },
  { id: 'sleep', label: 'Improving Sleep' },
  { id: 'habits', label: 'Building Better Habits' },
  { id: 'relationships', label: 'Relationship Issues' },
  { id: 'anxiety', label: 'Coping with Anxiety' },
  { id: 'emotions', label: 'Understanding Emotions' },
  { id: 'motivation', label: 'Motivation' },
];

const contentPreferencesOptions = [
  { id: 'articles', label: 'Text Articles' },
  { id: 'meditations', label: 'Guided Meditations' },
  { id: 'videos', label: 'Video Content' },
  { id: 'exercises', label: 'Interactive Exercises' },
  { id: 'audio', label: 'Audio Talks' },
];


const intakeFormSchema = z.object({
  fullName: z.string().optional(),
  age: z.coerce.number().min(18, { message: "You must be at least 18 years old." }),
  gender: z.enum(GENDERS),
  location: z.string().min(1, { message: "Location is required." }),
  diagnosisHistory: z.enum(DIAGNOSIS_HISTORY_OPTIONS),
  diagnoses: z.string().optional(), // Comma-separated for textarea, will be processed
  currentTreatment: z.enum(CURRENT_TREATMENT_OPTIONS),
  sleepPatterns: z.coerce.number().min(0, { message: "Sleep hours cannot be negative." }).max(24, { message: "Sleep hours cannot exceed 24." }),
  exerciseFrequency: z.coerce.number().min(0, { message: "Exercise frequency cannot be negative." }),
  substanceUse: z.enum(SUBSTANCE_USE_OPTIONS),
  currentStressLevel: z.number().min(1).max(10),
  todayMood: z.string().min(1, { message: "Please describe your mood." }), // Emoji or short description
  frequentEmotions: z.array(z.string()).refine(value => value.some(item => item), { message: "You have to select at least one emotion." }),
  supportAreas: z.array(z.string()).refine(value => value.some(item => item), { message: "You have to select at least one support area." }),
  contentPreferences: z.array(z.string()).refine(value => value.some(item => item), { message: "You have to select at least one content preference." }),
  checkInFrequency: z.enum(CHECKIN_FREQUENCY_OPTIONS),
  preferredTime: z.enum(PREFERRED_TIME_OPTIONS),
  additionalInformation: z.string().optional(),
});

type IntakeFormValues = z.infer<typeof intakeFormSchema>;

export default function IntakeFormPage() {
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<IntakeFormValues>({
    resolver: zodResolver(intakeFormSchema),
    defaultValues: {
      fullName: '',
      age: 18,
      gender: 'Prefer not to say',
      location: '',
      diagnosisHistory: 'Prefer not to say',
      diagnoses: '',
      currentTreatment: 'Prefer not to say',
      sleepPatterns: 7,
      exerciseFrequency: 2,
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

  const onSubmit = (data: IntakeFormValues) => {
    try {
      const processedData = {
        ...data,
        // Process diagnoses string into an array if needed by backend, or keep as string
        diagnoses: data.diagnoses ? data.diagnoses.split(',').map(d => d.trim()).filter(d => d) : [],
      };
      localStorage.setItem('wellspringUserIntakeData', JSON.stringify(processedData));
      console.log("Intake Form Data:", processedData);
      toast({
        title: "Intake Form Submitted",
        description: "Your information has been saved. We'll use this to personalize your experience.",
      });
      // Optionally, redirect or update UI
      router.push('/dashboard');
    } catch (error) {
      console.error("Failed to save intake form:", error);
      toast({
        title: "Error",
        description: "Failed to save your intake form. Please try again.",
        variant: "destructive",
      });
    }
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
                  <FormControl><Input placeholder="Your full name" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}/>

              <FormField control={form.control} name="age" render={({ field }) => (
                <FormItem>
                  <FormLabel>Age</FormLabel>
                  <FormControl><Input type="number" placeholder="Your age" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}/>

              <FormField control={form.control} name="gender" render={({ field }) => (
                <FormItem>
                  <FormLabel>Gender</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select your gender" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {GENDERS.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}/>

              <FormField control={form.control} name="location" render={({ field }) => (
                <FormItem>
                  <FormLabel>Location (City and Timezone)</FormLabel>
                  <FormControl><Input placeholder="e.g., San Francisco, PST" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}/>

              <FormField control={form.control} name="diagnosisHistory" render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Have you been diagnosed with any mental health conditions?</FormLabel>
                  <FormControl>
                    <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col space-y-1">
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
                <FormField control={form.control} name="diagnoses" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Please list any diagnoses (comma-separated)</FormLabel>
                    <FormControl><Textarea placeholder="e.g., Anxiety, Depression" {...field} rows={3} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}/>
              )}

              <FormField control={form.control} name="currentTreatment" render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Are you currently seeing a therapist or mental health professional?</FormLabel>
                  <FormControl>
                    <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col space-y-1">
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
                  <FormLabel>Average hours of sleep per night</FormLabel>
                  <FormControl><Input type="number" placeholder="e.g., 7" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}/>
              
              <FormField control={form.control} name="exerciseFrequency" render={({ field }) => (
                <FormItem>
                  <FormLabel>Weekly exercise sessions (approx.)</FormLabel>
                  <FormControl><Input type="number" placeholder="e.g., 3" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}/>

              <FormField control={form.control} name="substanceUse" render={({ field }) => (
                <FormItem>
                  <FormLabel>Alcohol and smoking habits</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                    <div className="flex items-center space-x-4">
                       <Slider
                          defaultValue={[field.value]}
                          min={1} max={10} step={1}
                          onValueChange={(value) => field.onChange(value[0])}
                          className="w-[90%]"
                        />
                        <span className="w-[10%] text-center text-lg font-semibold">{field.value}</span>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}/>

              <FormField control={form.control} name="todayMood" render={({ field }) => (
                <FormItem>
                  <FormLabel>How are you feeling today? (e.g., emoji or a word)</FormLabel>
                  <FormControl><Input placeholder="e.g., 😊 or Okay" {...field} /></FormControl>
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
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                  <FormControl><Textarea placeholder="Share anything else that might be helpful..." {...field} rows={5} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}/>

              <Button type="submit" size="lg" className="w-full text-lg py-3 rounded-lg shadow-md hover:shadow-lg transition-shadow" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Saving Information..." : "Save Intake Information"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

    
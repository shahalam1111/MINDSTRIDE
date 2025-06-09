
"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

const moodCheckinSchema = z.object({
  mood: z.string().min(1, { message: "Please select your mood." }),
  notes: z.string().optional(),
});

type MoodCheckinFormValues = z.infer<typeof moodCheckinSchema>;

const moods = [
  { emoji: '😄', label: 'Ecstatic' },
  { emoji: '😊', label: 'Happy' },
  { emoji: '😐', label: 'Neutral' },
  { emoji: '😟', label: 'Anxious' },
  { emoji: '😢', label: 'Sad' },
  { emoji: '😠', label: 'Angry' },
];

export default function MoodCheckinPage() {
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<MoodCheckinFormValues>({
    resolver: zodResolver(moodCheckinSchema),
    defaultValues: {
      mood: '',
      notes: '',
    },
  });

  const onSubmit = (data: MoodCheckinFormValues) => {
    try {
      const newEntry = {
        id: new Date().toISOString(), // Simple unique ID
        ...data,
        timestamp: new Date().toISOString(),
      };

      const existingEntriesString = localStorage.getItem('wellspringUserMoodLog');
      const existingEntries = existingEntriesString ? JSON.parse(existingEntriesString) : [];
      existingEntries.push(newEntry);
      localStorage.setItem('wellspringUserMoodLog', JSON.stringify(existingEntries));

      toast({
        title: "Mood Recorded",
        description: "Your mood has been successfully logged.",
      });
      form.reset(); 
      // Optionally, navigate back to dashboard or another page
      // router.push('/dashboard'); 
    } catch (error) {
      console.error("Failed to save mood:", error);
      toast({
        title: "Error",
        description: "Failed to record your mood. Please try again.",
        variant: "destructive",
      });
    }
  };

  const selectedMoodValue = form.watch('mood');

  return (
    <div className="flex justify-center py-8 px-4">
      <Card className="w-full max-w-2xl shadow-xl rounded-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-headline text-center">Mood Check-in</CardTitle>
          <CardDescription className="text-center text-muted-foreground">
            How are you feeling right now? Take a moment to reflect.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="mood"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg font-medium text-foreground">Select Your Current Mood</FormLabel>
                    <FormControl>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2">
                        {moods.map((mood) => (
                          <Button
                            key={mood.emoji}
                            type="button"
                            variant={selectedMoodValue === mood.emoji ? "default" : "outline"}
                            className="flex flex-col h-28 sm:h-32 items-center justify-center text-base p-3 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 ease-in-out"
                            onClick={() => {
                              field.onChange(mood.emoji);
                            }}
                          >
                            <span className="text-5xl mb-2">{mood.emoji}</span>
                            {mood.label}
                          </Button>
                        ))}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg font-medium text-foreground">Additional Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Any thoughts, feelings, or events related to your mood..."
                        className="resize-none rounded-lg shadow-sm"
                        {...field}
                        rows={5}
                      />
                    </FormControl>
                    <FormDescription>
                      Jotting down details can help you identify patterns over time.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" size="lg" className="w-full text-lg py-3 rounded-lg shadow-md hover:shadow-lg transition-shadow" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Saving Your Mood..." : "Save Mood"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}


"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { format, parseISO } from 'date-fns';
import { ArrowLeft, BarChart3, CalendarClock, Activity, ShieldCheck, Download, Share2, UserCheck, TrendingUp, ListChecks, Target, Repeat } from 'lucide-react';

interface MoodLogEntry {
  id: string;
  mood: string;
  notes?: string;
  timestamp: string; // ISO string
}

interface IntakeData {
  currentStressLevel?: number;
  sleepPatterns?: number;
  // Add other relevant fields from intake data if needed later
}

const MOOD_LOG_KEY = 'wellspringUserMoodLog';
const INTAKE_DATA_KEY = 'wellspringUserIntakeData';

export default function MyProgressPage() {
  const [moodLog, setMoodLog] = useState<MoodLogEntry[]>([]);
  const [intakeData, setIntakeData] = useState<IntakeData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load Mood Log
    const moodLogString = localStorage.getItem(MOOD_LOG_KEY);
    if (moodLogString) {
      try {
        const parsedLog: MoodLogEntry[] = JSON.parse(moodLogString);
        setMoodLog(parsedLog.sort((a, b) => parseISO(b.timestamp).getTime() - parseISO(a.timestamp).getTime()));
      } catch (e) {
        console.error("Error parsing mood log from localStorage", e);
      }
    }

    // Load Intake Data (for stress & sleep overview)
    const intakeDataString = localStorage.getItem(INTAKE_DATA_KEY);
    if (intakeDataString) {
      try {
        const parsedIntake: IntakeData = JSON.parse(intakeDataString);
        setIntakeData(parsedIntake);
      } catch (e) {
        console.error("Error parsing intake data from localStorage", e);
      }
    }
    setIsLoading(false);
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <CardTitle className="text-3xl font-headline flex items-center gap-2">
          <BarChart3 className="h-8 w-8 text-primary" />
          My Progress & Insights
        </CardTitle>
        <Button variant="outline" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
      </div>
      
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2"><CalendarClock className="text-primary h-6 w-6"/>Mood Timeline</CardTitle>
          <CardDescription>Track your mood fluctuations over time.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground">Loading mood data...</p>
          ) : moodLog.length > 0 ? (
            <>
              <div className="p-4 border rounded-lg bg-muted/30 text-center mb-4">
                <p className="text-muted-foreground">Mood chart/graph visualization will appear here in a future update.</p>
              </div>
              <ScrollArea className="h-[200px] pr-3 border rounded-md p-2">
                <ul className="space-y-2">
                  {moodLog.slice(0, 10).map(entry => ( // Show latest 10 entries for brevity
                    <li key={entry.id} className="text-sm p-2 bg-background rounded hover:bg-muted/50">
                      <span className="font-semibold">{format(parseISO(entry.timestamp), 'PPP p')}</span>: {entry.mood}
                      {entry.notes && <span className="text-muted-foreground text-xs block ml-2">- "{entry.notes}"</span>}
                    </li>
                  ))}
                </ul>
              </ScrollArea>
              {moodLog.length > 10 && <p className="text-xs text-muted-foreground text-center mt-2">Showing latest 10 of {moodLog.length} entries. Full history in Activity Log.</p>}
            </>
          ) : (
            <p className="text-muted-foreground text-center py-4">No mood entries logged yet. Start by using the "Mood Check-in" feature!</p>
          )}
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="shadow-md">
            <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2"><Activity className="text-primary h-6 w-6"/>Stress & Sleep Overview</CardTitle>
            <CardDescription>Summary from your intake form.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
            {isLoading ? (
                <p className="text-muted-foreground">Loading intake data...</p>
            ) : intakeData ? (
                <>
                <p>Initial Stress Level: <span className="font-semibold text-primary">{intakeData.currentStressLevel ? `${intakeData.currentStressLevel}/10` : 'Not specified'}</span></p>
                <p>Average Sleep: <span className="font-semibold text-primary">{intakeData.sleepPatterns ? `${intakeData.sleepPatterns} hours/night` : 'Not specified'}</span></p>
                <div className="p-3 border rounded-lg bg-muted/30 text-center mt-3">
                    <p className="text-xs text-muted-foreground">Stress patterns & sleep correlation charts coming soon.</p>
                </div>
                </>
            ) : (
                <p className="text-muted-foreground">Complete your <Link href="/dashboard/intake" className="underline hover:text-primary">intake form</Link> to see this overview.</p>
            )}
            </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2"><TrendingUp className="text-primary h-6 w-6"/>AI Generated Insights</CardTitle>
            <CardDescription>Summary of patterns and improvements.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-4 border rounded-lg bg-muted/30 text-center">
                <p className="text-muted-foreground">AI-generated weekly/monthly reports and insights summary will be available here in future updates.</p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Separator />

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2"><ListChecks className="text-primary h-6 w-6"/>Goals & Habits (Future Feature)</CardTitle>
          <CardDescription>Track your wellness goals and build positive habits.</CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3 p-4 border rounded-lg bg-muted/10">
                <h4 className="font-semibold flex items-center gap-1.5"><Target className="h-5 w-5 text-primary/80"/>Goal Progress</h4>
                <p className="text-sm text-muted-foreground">Visual progress bars for selected wellness goals will appear here.</p>
                <Button variant="outline" disabled>Set New Goal (Placeholder)</Button>
            </div>
             <div className="space-y-3 p-4 border rounded-lg bg-muted/10">
                <h4 className="font-semibold flex items-center gap-1.5"><Repeat className="h-5 w-5 text-primary/80"/>Habit Tracking</h4>
                <p className="text-sm text-muted-foreground">Streak counters and tracking for positive habits will be shown here.</p>
                <Button variant="outline" disabled>Add New Habit (Placeholder)</Button>
            </div>
        </CardContent>
        <CardContent>
             <div className="p-4 border rounded-lg bg-muted/30 text-center mt-4">
                <p className="text-muted-foreground">Milestone celebrations and achievements will be highlighted here.</p>
            </div>
        </CardContent>
      </Card>

      <Separator />

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2"><ShieldCheck className="text-primary h-6 w-6"/>Data & Sharing (Future Feature)</CardTitle>
          <CardDescription>Manage your personal data and sharing preferences.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
                 <Button variant="secondary" disabled className="flex-1">
                    <Download className="mr-2 h-4 w-4" /> Export My Data (Placeholder)
                </Button>
                <Button variant="secondary" disabled className="flex-1">
                    <Share2 className="mr-2 h-4 w-4" /> Share Progress (Placeholder)
                </Button>
            </div>
           <div className="p-4 border rounded-lg bg-muted/10">
                <h4 className="font-semibold flex items-center gap-1.5"><UserCheck className="h-5 w-5 text-primary/80"/>Therapist Access</h4>
                <p className="text-sm text-muted-foreground">Options to grant therapists access to relevant data (with consent) will be available here.</p>
            </div>
        </CardContent>
      </Card>

    </div>
  );
}

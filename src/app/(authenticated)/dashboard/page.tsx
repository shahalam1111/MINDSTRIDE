
"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Smile, BarChart3, MessageCircle, FileText, ShieldAlert, LifeBuoy, Zap, Users, Clock, CalendarDays, Sparkles, BookOpen, Activity, MessageSquare, Video, UserRound, Settings } from 'lucide-react';
import { EmergencySupportDialog } from '@/components/app/emergency-support-dialog';
import { AIChatAssistantDialog } from '@/components/app/AIChatAssistantDialog'; // Import the new dialog
import Image from 'next/image';


interface MoodLogEntry {
  id: string;
  mood: string;
  notes?: string;
  timestamp: string;
}

export default function DashboardPage() {
  const [userName, setUserName] = useState<string | null>(null);
  const [intakeDataExists, setIntakeDataExists] = useState<boolean | null>(null);
  const [lastMood, setLastMood] = useState<string | null>(null);
  const [isEmergencyDialogOpen, setIsEmergencyDialogOpen] = useState(false);
  const [isAIChatDialogOpen, setIsAIChatDialogOpen] = useState(false); // State for AI Chat Dialog

  useEffect(() => {
    const storedEmail = localStorage.getItem('wellspringUserEmail');
    if (storedEmail) {
      setUserName(storedEmail.split('@')[0]);
    }
    if (localStorage.getItem('wellspringUserIntakeData')) {
      setIntakeDataExists(true);
    } else {
      setIntakeDataExists(false);
    }

    const moodLogString = localStorage.getItem('wellspringUserMoodLog');
    if (moodLogString) {
      const moodLog: MoodLogEntry[] = JSON.parse(moodLogString);
      if (moodLog.length > 0) {
        // Sort by timestamp descending to get the latest
        moodLog.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setLastMood(moodLog[0].mood);
      }
    }
  }, []);


  return (
    <div className="space-y-8">
      <Card className="shadow-lg border-none bg-gradient-to-r from-primary/10 to-accent/10">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="text-3xl md:text-4xl font-headline text-foreground">
                Welcome{userName ? `, ${userName}` : ' to Wellspring'}!
              </CardTitle>
              <CardDescription className="text-lg text-muted-foreground mt-1">
                This is your personal space to nurture your mental well-being.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {lastMood && (
                <span className="text-3xl" title="Your last logged mood">{lastMood}</span>
              )}
              <Button variant="outline" size="icon" onClick={() => setIsAIChatDialogOpen(true)} title="AI Chat Assistant">
                <MessageCircle className="h-5 w-5" />
                <span className="sr-only">AI Chat Assistant</span>
              </Button>
              <Button variant="destructive" size="icon" onClick={() => setIsEmergencyDialogOpen(true)} title="Emergency Resources">
                <ShieldAlert className="h-5 w-5" />
                 <span className="sr-only">Emergency Resources</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="mb-2 text-foreground">
            Explore resources, track your progress, and connect with tools designed for your wellness journey.
          </p>
        </CardContent>
      </Card>

      {intakeDataExists === false && (
         <Card className="border-primary border-2 shadow-lg">
            <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl"><FileText className="h-6 w-6 text-primary" />Complete Your Profile</CardTitle>
            <CardDescription>Help us personalize your experience by completing the initial intake form. This will enable tailored insights and support.</CardDescription>
            </CardHeader>
            <CardContent>
            <Button asChild>
                <Link href="/dashboard/intake">Go to Intake Form</Link>
            </Button>
            </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        
        {/* Today's Wellness Check-in */}
        <Card className="hover:shadow-xl transition-shadow duration-300 flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Smile className="h-6 w-6 text-primary" />Today's Wellness</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow">
            <p className="text-muted-foreground mb-3">How are you feeling right now?</p>
            <div className="flex items-center gap-2 mb-4">
                 <span className="text-2xl p-2 bg-muted rounded-md">😌</span>
                 <span className="text-sm text-muted-foreground">Feeling Calm</span>
            </div>
            <div className="space-y-2">
                <p className="text-sm">Stress: <span className="font-semibold text-primary">Low</span> (Placeholder)</p>
                <p className="text-sm">Sleep: <span className="font-semibold text-primary">Good</span> (Placeholder)</p>
            </div>
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" className="w-full">
              <Link href="/dashboard/mood-checkin">Log Mood / Details</Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Personalized Recommendations */}
        <Card className="hover:shadow-xl transition-shadow duration-300 flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Sparkles className="h-6 w-6 text-primary" />Personalized For You</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow space-y-3">
            <p className="text-muted-foreground text-sm">Based on your profile, try these:</p>
            <Button variant="ghost" className="w-full justify-start gap-2"><Zap className="h-4 w-4 text-yellow-500"/> Quick 5-min Meditation</Button>
            <Button variant="ghost" className="w-full justify-start gap-2"><BookOpen className="h-4 w-4 text-green-500"/> Article: Managing Daily Stress</Button>
            <p className="text-xs text-muted-foreground pt-2">AI insights coming soon!</p>
          </CardContent>
           <CardFooter>
             <Button variant="outline" className="w-full" disabled>Explore More</Button>
          </CardFooter>
        </Card>

        {/* Quick Actions Panel */}
        <Card className="hover:shadow-xl transition-shadow duration-300 flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Zap className="h-6 w-6 text-primary" />Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow grid grid-cols-2 gap-3">
            <Button variant="secondary" className="h-auto py-3 flex-col" onClick={() => setIsAIChatDialogOpen(true)}>
              <MessageCircle className="h-6 w-6 mb-1" />
              Chat with AI
            </Button>
            <Button variant="secondary" className="h-auto py-3 flex-col" disabled>
              <Video className="h-6 w-6 mb-1" />
              Schedule (Premium)
            </Button>
             <Button variant="secondary" className="h-auto py-3 flex-col" disabled>
              <Users className="h-6 w-6 mb-1" />
              Community
            </Button>
             <Button variant="secondary" className="h-auto py-3 flex-col" disabled>
              <BarChart3 className="h-6 w-6 mb-1" />
              My Progress
            </Button>
          </CardContent>
           <CardFooter>
             {/* Optional: A main call to action or link */}
          </CardFooter>
        </Card>
        
        {/* Recent Activity Feed */}
        <Card className="hover:shadow-xl transition-shadow duration-300 flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Activity className="h-6 w-6 text-primary" />Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow space-y-3 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
                <MessageSquare className="h-4 w-4"/> <span>Last chat: AI helped with stress.</span>
            </div>
             <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="h-4 w-4"/> <span>Posted in 'Anxiety' forum.</span>
            </div>
             <div className="flex items-center gap-2 text-muted-foreground">
                <CalendarDays className="h-4 w-4"/> <span>Next appointment: Tomorrow.</span>
            </div>
            <p className="text-xs text-muted-foreground pt-2">Activity tracking coming soon!</p>
          </CardContent>
          <CardFooter>
             <Button variant="outline" className="w-full" disabled>View All Activity</Button>
          </CardFooter>
        </Card>

      </div>

      <EmergencySupportDialog open={isEmergencyDialogOpen} onOpenChange={setIsEmergencyDialogOpen} />
      <AIChatAssistantDialog open={isAIChatDialogOpen} onOpenChange={setIsAIChatDialogOpen} />
    </div>
  );
}


"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Smile, BarChart3, MessageCircle, FileText, ShieldAlert, LifeBuoy, Zap, Users, Clock, CalendarDays, Sparkles, BookOpen, Activity, MessageSquare, Video, UserRound, Settings, ListChecks } from 'lucide-react';
import { EmergencySupportDialog } from '@/components/app/emergency-support-dialog';
import { AIChatAssistantDialog } from '@/components/app/AIChatAssistantDialog';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow, parseISO } from 'date-fns';

interface MoodLogEntry {
  id: string;
  mood: string;
  notes?: string;
  timestamp: string; // ISO string
}

interface AiChatActivity {
  text: string;
  timestamp: string; // ISO string
}

interface ActivityItem {
  id: string;
  icon: React.ElementType;
  text: string;
  timestamp: string; // ISO string
  relativeTime: string;
  category: 'AI Chat' | 'Community' | 'Appointment' | 'Mood Log';
}

const LAST_AI_CHAT_ACTIVITY_KEY = 'wellspringUserLastAiChatActivity';
const MOOD_LOG_KEY = 'wellspringUserMoodLog';

export default function DashboardPage() {
  const [userName, setUserName] = useState<string | null>(null);
  const [intakeDataExists, setIntakeDataExists] = useState<boolean | null>(null);
  const [lastMood, setLastMood] = useState<string | null>(null);
  const [isEmergencyDialogOpen, setIsEmergencyDialogOpen] = useState(false);
  const [isAIChatDialogOpen, setIsAIChatDialogOpen] = useState(false);
  const [isPremiumUser, setIsPremiumUser] = useState<boolean>(false);
  const [recentActivities, setRecentActivities] = useState<ActivityItem[]>([]);

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

    const premiumStatus = localStorage.getItem('wellspringUserIsPremium');
    setIsPremiumUser(premiumStatus === 'true');

    // Load recent activities
    const activities: ActivityItem[] = [];

    // 1. AI Chat Activity
    const lastAiChatString = localStorage.getItem(LAST_AI_CHAT_ACTIVITY_KEY);
    if (lastAiChatString) {
      try {
        const lastAiChat: AiChatActivity = JSON.parse(lastAiChatString);
        activities.push({
          id: 'ai-chat-latest',
          icon: MessageSquare,
          text: `AI: "${lastAiChat.text.substring(0, 45)}${lastAiChat.text.length > 45 ? '...' : ''}"`,
          timestamp: lastAiChat.timestamp,
          relativeTime: formatDistanceToNow(parseISO(lastAiChat.timestamp), { addSuffix: true }),
          category: 'AI Chat'
        });
      } catch (e) { console.error("Error parsing AI chat activity", e); }
    }

    // 2. Mood Log Activity
    const moodLogString = localStorage.getItem(MOOD_LOG_KEY);
    let currentLastMood = null;
    if (moodLogString) {
      try {
        const moodLog: MoodLogEntry[] = JSON.parse(moodLogString);
        if (moodLog.length > 0) {
          const sortedMoodLog = moodLog.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
          const lastMoodEntry = sortedMoodLog[0];
          currentLastMood = lastMoodEntry.mood; // Update lastMood for header
          activities.push({
            id: `mood-log-${lastMoodEntry.id}`,
            icon: Smile,
            text: `Logged mood: ${lastMoodEntry.mood}${lastMoodEntry.notes ? ` - "${lastMoodEntry.notes.substring(0, 30)}${lastMoodEntry.notes.length > 30 ? '...' : ''}"` : ''}`,
            timestamp: lastMoodEntry.timestamp,
            relativeTime: formatDistanceToNow(parseISO(lastMoodEntry.timestamp), { addSuffix: true }),
            category: 'Mood Log'
          });
        }
      } catch (e) { console.error("Error parsing mood log", e); }
    }
    setLastMood(currentLastMood);


    // 3. Placeholder Community Activity
    activities.push({
      id: 'community-placeholder-1',
      icon: Users,
      text: "Feature: Posted in 'Anxiety Support' forum.",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // ~2 hours ago
      relativeTime: formatDistanceToNow(new Date(Date.now() - 2 * 60 * 60 * 1000), { addSuffix: true }),
      category: 'Community'
    });

    // 4. Placeholder Appointment Activity
    activities.push({
      id: 'appointment-placeholder-1',
      icon: CalendarDays,
      text: "Feature: Upcoming consultation with Dr. F.",
      timestamp: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // ~Tomorrow
      relativeTime: formatDistanceToNow(new Date(Date.now() + 24 * 60 * 60 * 1000), { addSuffix: true }),
      category: 'Appointment'
    });
    
    activities.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    setRecentActivities(activities.slice(0, 4)); // Show top 4 recent activities

  }, [isAIChatDialogOpen, open]); // Re-fetch activities when AI chat dialog closes, or on initial load.


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
          <div className="mt-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                const newPremiumStatus = !isPremiumUser;
                localStorage.setItem('wellspringUserIsPremium', String(newPremiumStatus));
                setIsPremiumUser(newPremiumStatus);
                window.location.reload(); 
              }}
            >
              Toggle Premium Status (Dev): {isPremiumUser ? "Active" : "Inactive"}
            </Button>
          </div>
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
        
        <Card className="hover:shadow-xl transition-shadow duration-300 flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Smile className="h-6 w-6 text-primary" />Today's Wellness</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow">
            <p className="text-muted-foreground mb-3">How are you feeling right now?</p>
            <div className="flex items-center gap-2 mb-4">
                 <span className="text-2xl p-2 bg-muted rounded-md">{lastMood || '🤔'}</span>
                 <span className="text-sm text-muted-foreground">{lastMood ? `Last mood: ${lastMood}` : 'Log your mood!'}</span>
            </div>
            <div className="space-y-2">
                <p className="text-sm">Stress: <span className="font-semibold text-primary">Moderate</span> (Placeholder)</p>
                <p className="text-sm">Sleep: <span className="font-semibold text-primary">7 hours</span> (Placeholder)</p>
            </div>
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" className="w-full">
              <Link href="/dashboard/mood-checkin">Log Mood / Details</Link>
            </Button>
          </CardFooter>
        </Card>

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

        <Card className="hover:shadow-xl transition-shadow duration-300 flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Zap className="h-6 w-6 text-primary" />Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow grid grid-cols-2 gap-3">
            <Button variant="secondary" className="h-auto py-3 flex-col" onClick={() => setIsAIChatDialogOpen(true)}>
              <MessageCircle className="h-6 w-6 mb-1" />
              Chat with AI
            </Button>
             <Button 
                variant="secondary" 
                className="h-auto py-3 flex-col relative" 
                asChild={isPremiumUser}
                onClick={() => !isPremiumUser && alert("This is a premium feature. Please upgrade.")}
             >
               {isPremiumUser ? (
                <Link href="/dashboard/consultations" className="flex flex-col items-center justify-center">
                    <Video className="h-6 w-6 mb-1" />
                    Schedule
                    <Badge variant="outline" className="absolute top-1 right-1 text-xs px-1 py-0.5 border-yellow-500 text-yellow-600">Premium</Badge>
                </Link>
               ) : (
                <>
                    <Video className="h-6 w-6 mb-1" />
                    Schedule
                    <Badge variant="outline" className="absolute top-1 right-1 text-xs px-1 py-0.5 border-muted-foreground text-muted-foreground">Premium</Badge>
                </>
               )}
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
          </CardFooter>
        </Card>
        
        <Card className="hover:shadow-xl transition-shadow duration-300 flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Activity className="h-6 w-6 text-primary" />Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow space-y-3 text-sm">
            {recentActivities.length > 0 ? (
              recentActivities.map(activity => (
                <div key={activity.id} className="flex items-start gap-3 text-muted-foreground hover:bg-muted/50 p-2 rounded-md transition-colors">
                  <activity.icon className="h-5 w-5 mt-0.5 flex-shrink-0 text-primary/80" />
                  <div className="flex-grow">
                    <p className="text-foreground leading-tight">{activity.text}</p>
                    <p className="text-xs text-muted-foreground/80">{activity.relativeTime}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-center py-4">No recent activity yet.</p>
            )}
          </CardContent>
          <CardFooter>
             <Button variant="outline" className="w-full" asChild>
                <Link href="/dashboard/activity">View All Activity</Link>
             </Button>
          </CardFooter>
        </Card>

      </div>

      <EmergencySupportDialog open={isEmergencyDialogOpen} onOpenChange={setIsEmergencyDialogOpen} />
      <AIChatAssistantDialog open={isAIChatDialogOpen} onOpenChange={setIsAIChatDialogOpen} />
    </div>
  );
}

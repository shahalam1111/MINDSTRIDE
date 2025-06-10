
"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Smile, BarChart3, MessageCircle, FileText, ShieldAlert, LifeBuoy, Zap, Users, Clock, CalendarDays, Sparkles, BookOpen, Activity, MessageSquare, Video, UserRound, Settings, ListChecks, Loader2 } from 'lucide-react';
import { EmergencySupportDialog } from '@/components/app/emergency-support-dialog';
import { AIChatAssistantDialog } from '@/components/app/AIChatAssistantDialog';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { generateInsights, type InsightGeneratorInput } from '@/ai/flows/insight-generator';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase'; // Import Firestore instance
import { doc, getDoc } from "firebase/firestore"; 

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

interface IntakeData {
  fullName?: string;
  age?: number;
  gender?: string;
  location?: string;
  diagnosisHistory?: string;
  diagnoses?: string[];
  currentTreatment?: string;
  sleepPatterns?: number;
  exerciseFrequency?: string;
  substanceUse?: string;
  currentStressLevel?: number;
  todayMood?: string; // Emoji
  frequentEmotions?: string[];
  supportAreas?: string[];
  contentPreferences?: string[];
  checkInFrequency?: string;
  preferredTime?: string;
  additionalInformation?: string;
  updatedAt?: any; // Can be Firestore Timestamp or Date string from localStorage
}


const LAST_AI_CHAT_ACTIVITY_KEY = 'wellspringUserLastAiChatActivity';
const MOOD_LOG_KEY = 'wellspringUserMoodLog';
const INTAKE_DATA_KEY = 'wellspringUserIntakeData'; // localStorage key
const USER_ID_PLACEHOLDER = "mockUserId"; // Replace with actual user ID from Firebase Auth later


export default function DashboardPage() {
  const [userName, setUserName] = useState<string | null>(null);
  const [intakeDataExists, setIntakeDataExists] = useState<boolean | null>(null);
  const [userIntakeData, setUserIntakeData] = useState<IntakeData | null>(null);
  const [lastMood, setLastMood] = useState<string | null>(null); // Store emoji for header
  const [lastMoodEntryForInsight, setLastMoodEntryForInsight] = useState<MoodLogEntry | null>(null); // Store full entry for insight
  const [isEmergencyDialogOpen, setIsEmergencyDialogOpen] = useState(false);
  const [isAIChatDialogOpen, setIsAIChatDialogOpen] = useState(false);
  const [isPremiumUser, setIsPremiumUser] = useState<boolean>(false);
  const [recentActivities, setRecentActivities] = useState<ActivityItem[]>([]);
  const [personalizedInsight, setPersonalizedInsight] = useState<string | null>(null);
  const [isLoadingInsight, setIsLoadingInsight] = useState<boolean>(false);
  const [displayStressLevel, setDisplayStressLevel] = useState<string>("Loading...");
  const [displaySleepHours, setDisplaySleepHours] = useState<string>("Loading...");

  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const storedEmail = localStorage.getItem('wellspringUserEmail');
    if (storedEmail) {
      setUserName(storedEmail.split('@')[0]);
    }
    
    const premiumStatus = localStorage.getItem('wellspringUserIsPremium');
    setIsPremiumUser(premiumStatus === 'true');

    // Function to process and set intake data related states
    const processIntakeData = (data: IntakeData | null) => {
        setUserIntakeData(data);
        if (data) {
            setIntakeDataExists(true);
            if (typeof data.currentStressLevel === 'number') {
                const level = data.currentStressLevel;
                if (level <= 3) setDisplayStressLevel(`Low (${level}/10)`);
                else if (level <= 7) setDisplayStressLevel(`Moderate (${level}/10)`);
                else setDisplayStressLevel(`High (${level}/10)`);
            } else {
                setDisplayStressLevel("Not logged in intake");
            }

            if (typeof data.sleepPatterns === 'number') {
                setDisplaySleepHours(`${data.sleepPatterns} hours`);
            } else {
                setDisplaySleepHours("Not logged in intake");
            }
            return data; // Return for insight generation
        } else {
            setIntakeDataExists(false);
            setDisplayStressLevel("Complete intake form");
            setDisplaySleepHours("Complete intake form");
            return null;
        }
    };
    
    // Function to fetch personalized insight
    const fetchInsight = async (currentIntakeData: IntakeData | null, currentLastMoodEntry: MoodLogEntry | null) => {
      if (!currentIntakeData) {
        setPersonalizedInsight(null); // No insight if no intake data
        setIsLoadingInsight(false);
        return;
      }
      setIsLoadingInsight(true);
      try {
        let summaryParts = [];
        if (currentIntakeData.fullName) summaryParts.push(`Name: ${currentIntakeData.fullName}`);
        if (currentIntakeData.age) summaryParts.push(`Age: ${currentIntakeData.age}`);
        if (currentIntakeData.supportAreas && currentIntakeData.supportAreas.length > 0) summaryParts.push(`Seeks support in: ${currentIntakeData.supportAreas.join(', ')}`);
        if (currentIntakeData.frequentEmotions && currentIntakeData.frequentEmotions.length > 0) summaryParts.push(`Often feels: ${currentIntakeData.frequentEmotions.join(', ')}`);
        if (currentIntakeData.todayMood) summaryParts.push(`Reported mood on intake: ${currentIntakeData.todayMood}`);
        
        const insightInput: InsightGeneratorInput = {
          intakeSummary: summaryParts.length > 0 ? summaryParts.join('. ') : "User has provided some intake information.",
          lastMood: currentLastMoodEntry?.mood || currentIntakeData.todayMood,
          currentStressLevel: currentIntakeData.currentStressLevel,
        };
        const result = await generateInsights(insightInput);
        setPersonalizedInsight(result.insightText);
      } catch (error) {
        console.error("Failed to generate insight:", error);
        setPersonalizedInsight("Could not load a personalized tip. Please try again later.");
        toast({
          title: "Insight Error",
          description: "Failed to generate a personalized insight.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingInsight(false);
      }
    };

    // Load intake data (try Firestore first, then localStorage)
    const loadIntakeAndInsights = async () => {
      let loadedIntakeData: IntakeData | null = null;
      try {
        // IMPORTANT: USER_ID_PLACEHOLDER must be replaced by actual Firebase Auth user.uid
        const docRef = doc(db, "intakeForms", USER_ID_PLACEHOLDER);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          console.log("Intake data loaded from Firestore");
          loadedIntakeData = docSnap.data() as IntakeData;
        } else {
          console.log("No intake data in Firestore, trying localStorage.");
          const storedIntakeDataString = localStorage.getItem(INTAKE_DATA_KEY);
          if (storedIntakeDataString) {
            loadedIntakeData = JSON.parse(storedIntakeDataString);
            console.log("Intake data loaded from localStorage");
          } else {
             console.log("No intake data in localStorage either.");
          }
        }
      } catch (error) {
        console.error("Error loading intake data:", error);
        // Fallback to localStorage if Firestore fails for any reason
        const storedIntakeDataString = localStorage.getItem(INTAKE_DATA_KEY);
        if (storedIntakeDataString) {
          loadedIntakeData = JSON.parse(storedIntakeDataString);
           console.log("Error loading from Firestore, intake data loaded from localStorage as fallback");
        }
      }
      
      const processedDataForInsight = processIntakeData(loadedIntakeData);

      // Load mood log for header and insights
      const moodLogString = localStorage.getItem(MOOD_LOG_KEY);
      let currentLastMoodEmoji: string | null = null;
      let currentLastMoodEntryForInsightState: MoodLogEntry | null = null;

      if (moodLogString) {
        try {
          const moodLog: MoodLogEntry[] = JSON.parse(moodLogString);
          if (moodLog.length > 0) {
            const sortedMoodLog = moodLog.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
            currentLastMoodEntryForInsightState = sortedMoodLog[0];
            currentLastMoodEmoji = currentLastMoodEntryForInsightState.mood;
          }
        } catch (e) { console.error("Error parsing mood log", e); }
      }
      setLastMood(currentLastMoodEmoji);
      setLastMoodEntryForInsight(currentLastMoodEntryForInsightState);

      // Fetch insight based on the loaded data
      fetchInsight(processedDataForInsight, currentLastMoodEntryForInsightState);

      // Load recent activities (this part remains the same, using localStorage for now)
      const activities: ActivityItem[] = [];
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

      if (currentLastMoodEntryForInsightState) {
          activities.push({
          id: `mood-log-${currentLastMoodEntryForInsightState.id}`,
          icon: Smile,
          text: `Logged mood: ${currentLastMoodEntryForInsightState.mood}${currentLastMoodEntryForInsightState.notes ? ` - "${currentLastMoodEntryForInsightState.notes.substring(0, 30)}${currentLastMoodEntryForInsightState.notes.length > 30 ? '...' : ''}"` : ''}`,
          timestamp: currentLastMoodEntryForInsightState.timestamp,
          relativeTime: formatDistanceToNow(parseISO(currentLastMoodEntryForInsightState.timestamp), { addSuffix: true }),
          category: 'Mood Log'
          });
      }
      
      activities.push({
        id: 'community-placeholder-1',
        icon: Users,
        text: "Feature: Posted in 'Anxiety Support' forum.",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        relativeTime: formatDistanceToNow(new Date(Date.now() - 2 * 60 * 60 * 1000), { addSuffix: true }),
        category: 'Community'
      });
      activities.push({
        id: 'appointment-placeholder-1',
        icon: CalendarDays,
        text: "Feature: Upcoming consultation with Dr. F.",
        timestamp: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        relativeTime: formatDistanceToNow(new Date(Date.now() + 24 * 60 * 60 * 1000), { addSuffix: true }),
        category: 'Appointment'
      });
      
      activities.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setRecentActivities(activities.slice(0, 4));
    };

    loadIntakeAndInsights();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAIChatDialogOpen, toast]); // Re-fetch activities/insights when AI chat dialog closes or on initial load.


  return (
    <div className="space-y-8">
      <Card className="shadow-lg border-none bg-gradient-to-r from-primary/10 to-accent/10">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="text-3xl md:text-4xl font-headline text-foreground">
                Welcome{userName ? `, ${userName}` : ' to MINDSTRIDE'}!
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
                <p className="text-sm">Stress: <span className="font-semibold text-primary">{displayStressLevel}</span></p>
                <p className="text-sm">Sleep: <span className="font-semibold text-primary">{displaySleepHours}</span></p>
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
            
            <div className="pt-2 text-sm">
              {isLoadingInsight && intakeDataExists !== false && ( // Only show loading if we expect data or are fetching
                <div className="flex items-center text-muted-foreground">
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating your personalized insight...
                </div>
              )}
              {!isLoadingInsight && personalizedInsight && intakeDataExists && (
                <p className="text-foreground italic">"{personalizedInsight}"</p>
              )}
              {!isLoadingInsight && !personalizedInsight && intakeDataExists === true && ( // Data exists but no insight
                 <p className="text-muted-foreground">Could not load an insight. Try refreshing.</p>
              )}
              {intakeDataExists === false && !isLoadingInsight && ( // No intake data
                 <p className="text-muted-foreground">
                  <Link href="/dashboard/intake" className="underline hover:text-primary">Complete your intake form</Link> for personalized insights.
                </p>
              )}
            </div>
          </CardContent>
           <CardFooter>
             <Button variant="outline" className="w-full" disabled>Explore More Content</Button>
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
                onClick={() => {
                    if (isPremiumUser) {
                        router.push("/dashboard/consultations");
                    } else {
                        toast({
                            title: "Premium Feature",
                            description: "Scheduling consultations is a premium feature. Please upgrade your plan.",
                            variant: "default"
                        });
                    }
                }}
             >
               <Video className="h-6 w-6 mb-1" />
                Schedule
                <Badge variant="outline" className={`absolute top-1 right-1 text-xs px-1 py-0.5 ${isPremiumUser ? 'border-yellow-500 text-yellow-600' : 'border-muted-foreground text-muted-foreground'}`}>Premium</Badge>
            </Button>
             <Button variant="secondary" className="h-auto py-3 flex-col" asChild>
                <Link href="/dashboard/community">
                    <Users className="h-6 w-6 mb-1" />
                    Community
                </Link>
            </Button>
             <Button variant="secondary" className="h-auto py-3 flex-col" asChild>
                <Link href="/dashboard/progress">
                    <BarChart3 className="h-6 w-6 mb-1" />
                    My Progress
                </Link>
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


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
import { db } from '@/lib/firebase'; 
import { doc, getDoc } from "firebase/firestore"; 
import type { InitialIntakeAnalyzerOutput } from '@/ai/flows/initial-intake-analyzer';


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

// This interface should align with StoredIntakeData in AIChatAssistantDialog
// and IntakeFormValues in intake/page.tsx
interface IntakeData {
  fullName?: string;
  age?: number;
  gender?: string;
  location?: string; // Combined city, timezone
  diagnosisHistory?: string;
  diagnoses?: string[] | string; 
  currentTreatment?: string;
  sleepPatterns_original?: number; 
  exerciseFrequency_original?: string;
  substanceUse_original?: string;
  currentStressLevel_original?: number; 
  todayMood_original_emoji?: string; 
  frequentEmotions?: string[] | string;
  supportAreas?: string[] | string;
  contentPreferences?: string[] | string;
  checkInFrequency?: string;
  preferredTime?: string;
  additionalInformation?: string;
  updatedAt?: any; 

  // New Q1-Q20 fields
  sadnessFrequencyWeekly?: number;
  panicAttackFrequency?: string;
  moodTodayDetailed?: string;
  otherMoodToday?: string;
  hopelessPastTwoWeeks?: string;
  hopelessDescription?: string;
  currentWorryIntensity?: number;
  averageSleepHoursNightly?: string; 
  appetiteChanges?: string;
  socialAvoidanceFrequency?: number; // 1-5 scale
  repetitiveBehaviors?: string;
  repetitiveBehaviorsDescription?: string;
  exerciseFrequencyDetailed?: string;
  physicalSymptomsFrequency?: number; // 1-5 scale
  substanceUseCoping?: string;
  workSchoolStressLevel?: number; 
  concentrationDifficultyFrequency?: number; // 1-5 scale
  recurringNegativeThoughts?: string;
  negativeThoughtsDescription?: string;
  overwhelmedByTasksFrequency?: number; // 1-5 scale
  hopefulnessFuture?: number; 
  mentalHealthMedication?: string;
  medicationDetails?: string;
  socialSupportAvailability?: string;
  recentLifeChanges?: string;
  lifeChangesDescription?: string;
}


const LAST_AI_CHAT_ACTIVITY_KEY = 'wellspringUserLastAiChatActivity';
const MOOD_LOG_KEY = 'wellspringUserMoodLog';
const INTAKE_DATA_KEY = 'wellspringUserIntakeData'; // For raw form values
const INTAKE_ANALYSIS_KEY = 'wellspringIntakeAnalysisResults'; // For the JSON report
const USER_ID_PLACEHOLDER = "mockUserId"; 


export default function DashboardPage() {
  const [userName, setUserName] = useState<string | null>(null);
  const [intakeDataExists, setIntakeDataExists] = useState<boolean | null>(null);
  const [userIntakeData, setUserIntakeData] = useState<IntakeData | null>(null); // Raw form data
  const [intakeAnalysisReport, setIntakeAnalysisReport] = useState<InitialIntakeAnalyzerOutput | null>(null); // Structured JSON report
  
  const [lastMood, setLastMood] = useState<string | null>(null); 
  const [lastMoodEntryForInsight, setLastMoodEntryForInsight] = useState<MoodLogEntry | null>(null); 
  const [isEmergencyDialogOpen, setIsEmergencyDialogOpen] = useState(false);
  const [isAIChatDialogOpen, setIsAIChatDialogOpen] = useState(false);
  const [isPremiumUser, setIsPremiumUser] = useState<boolean>(false);
  const [recentActivities, setRecentActivities] = useState<ActivityItem[]>([]);
  const [personalizedInsight, setPersonalizedInsight] = useState<string | null>(null);
  const [isLoadingInsight, setIsLoadingInsight] = useState<boolean>(false);
  const [displayStressLevel, setDisplayStressLevel] = useState<string>("Loading...");
  const [displaySleepHours, setDisplaySleepHours] = useState<string>("Loading...");
  const [displaySadnessLevel, setDisplaySadnessLevel] = useState<string>("Loading...");


  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const storedEmail = localStorage.getItem('wellspringUserEmail');
    if (storedEmail) {
      setUserName(storedEmail.split('@')[0]);
    }
    
    const premiumStatus = localStorage.getItem('wellspringUserIsPremium');
    setIsPremiumUser(premiumStatus === 'true');

    const processIntakeDataAndReport = (data: IntakeData | null, report: InitialIntakeAnalyzerOutput | null) => {
        setUserIntakeData(data);
        setIntakeAnalysisReport(report);

        if (data) { // Use raw form data for initial display if report not yet fully processed/available for this logic
            setIntakeDataExists(true);
            
            let stressToDisplay: number | undefined = data.workSchoolStressLevel ?? data.currentWorryIntensity ?? data.currentStressLevel_original;
            let stressSource: string = "";
            if (typeof data.workSchoolStressLevel === 'number') stressSource = " (Work/School)";
            else if (typeof data.currentWorryIntensity === 'number') stressSource = " (Worry)";
            else if (typeof data.currentStressLevel_original === 'number') stressSource = " (Overall)";

            if (typeof stressToDisplay === 'number') {
                if (stressToDisplay <= 3) setDisplayStressLevel(`Low (${stressToDisplay}/10)${stressSource}`);
                else if (stressToDisplay <= 7) setDisplayStressLevel(`Moderate (${stressToDisplay}/10)${stressSource}`);
                else setDisplayStressLevel(`High (${stressToDisplay}/10)${stressSource}`);
            } else {
                setDisplayStressLevel("Not logged in intake");
            }
            
            if (data.averageSleepHoursNightly) setDisplaySleepHours(`${data.averageSleepHoursNightly}`);
            else if (typeof data.sleepPatterns_original === 'number') setDisplaySleepHours(`${data.sleepPatterns_original} hours (avg)`);
            else setDisplaySleepHours("Not logged in intake");

            if(typeof data.sadnessFrequencyWeekly === 'number') setDisplaySadnessLevel(`${data.sadnessFrequencyWeekly}/10`);
            else setDisplaySadnessLevel("Not logged");

        } else {
            setIntakeDataExists(false);
            setDisplayStressLevel("Complete intake form");
            setDisplaySleepHours("Complete intake form");
            setDisplaySadnessLevel("Complete intake form");
        }

        // If report is available, potentially override/enhance display with analytics scores
        if (report?.analytics) {
            if(report.analytics.stressScore) {
                const score = report.analytics.stressScore;
                if (score <= 3) setDisplayStressLevel(`Low (${score}/10) (Analyzed)`);
                else if (score <= 7) setDisplayStressLevel(`Moderate (${score}/10) (Analyzed)`);
                else setDisplayStressLevel(`High (${score}/10) (Analyzed)`);
            }
            if(report.analytics.sleepQuality) setDisplaySleepHours(report.analytics.sleepQuality + " (Analyzed)");
            if(report.analytics.sadnessScore) setDisplaySadnessLevel(`${report.analytics.sadnessScore}/10 (Analyzed)`);
        }
        return data; 
    };
    
    const fetchInsightForDashboard = async (currentIntakeData: IntakeData | null, currentLastMoodEntry: MoodLogEntry | null) => {
      if (!currentIntakeData) {
        setPersonalizedInsight(null); 
        setIsLoadingInsight(false);
        return;
      }
      setIsLoadingInsight(true);
      try {
        // Prepare summary for insight generator using available intake fields
        let summaryParts = [];
        if (currentIntakeData.fullName) summaryParts.push(`Name: ${currentIntakeData.fullName}`);
        if (currentIntakeData.age) summaryParts.push(`Age: ${currentIntakeData.age}`);
        if (currentIntakeData.supportAreas && currentIntakeData.supportAreas.length > 0) {
             const support = Array.isArray(currentIntakeData.supportAreas) ? currentIntakeData.supportAreas.join(', ') : currentIntakeData.supportAreas;
             summaryParts.push(`Seeks support in: ${support}`);
        }
        if (currentIntakeData.moodTodayDetailed) summaryParts.push(`Reported detailed mood on intake: ${currentIntakeData.moodTodayDetailed}`);
        else if (currentIntakeData.todayMood_original_emoji) summaryParts.push(`Reported quick mood on intake: ${currentIntakeData.todayMood_original_emoji}`);
        
        const insightInput: InsightGeneratorInput = {
          intakeSummary: summaryParts.length > 0 ? summaryParts.join('. ') : "User has provided some intake information.",
          lastMood: currentLastMoodEntry?.mood || currentIntakeData.moodTodayDetailed || currentIntakeData.todayMood_original_emoji,
          currentStressLevel: currentIntakeData.workSchoolStressLevel ?? currentIntakeData.currentWorryIntensity ?? currentIntakeData.currentStressLevel_original,
        };
        const result = await generateInsights(insightInput);
        setPersonalizedInsight(result.insightText);
      } catch (error) {
        console.error("Failed to generate insight for dashboard:", error);
        setPersonalizedInsight("Could not load a personalized tip. Please try again later.");
        // Toast for insight error is optional here as it's a non-critical dashboard element
      } finally {
        setIsLoadingInsight(false);
      }
    };

    const loadDashboardData = async () => {
      let loadedIntakeData: IntakeData | null = null;
      let loadedAnalysisReport: InitialIntakeAnalyzerOutput | null = null;
      
      // Try loading raw intake data (e.g. from Firestore or LS)
      if (db) { 
        try {
          const docRef = doc(db, "intakeForms", USER_ID_PLACEHOLDER);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            loadedIntakeData = docSnap.data() as IntakeData;
          }
        } catch (error: any) {
          if (error.code === 'unavailable' || error.message?.toLowerCase().includes('offline')) {
            console.warn("MINDSTRIDE: Firestore is unavailable for intake data. Relying on localStorage.", error.message);
          } else {
            console.error("MINDSTRIDE: Error loading intake data from Firestore:", error);
          }
        }
      }

      if (!loadedIntakeData) {
        const storedIntakeDataString = localStorage.getItem(INTAKE_DATA_KEY);
        if (storedIntakeDataString) {
          try { loadedIntakeData = JSON.parse(storedIntakeDataString); } 
          catch (e) { console.error("MINDSTRIDE: Error parsing raw intake data from localStorage", e); }
        }
      }
      
      // Try loading the analyzed JSON report from LS
      const analysisReportString = localStorage.getItem(INTAKE_ANALYSIS_KEY);
      if (analysisReportString) {
          try { loadedAnalysisReport = JSON.parse(analysisReportString); }
          catch (e) { console.error("MINDSTRIDE: Error parsing analysis report from localStorage", e); }
      }
      
      processIntakeDataAndReport(loadedIntakeData, loadedAnalysisReport);

      // Mood Log for dashboard display and insight generation
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
      setLastMood(currentLastMoodEmoji || loadedIntakeData?.moodTodayDetailed || loadedIntakeData?.todayMood_original_emoji || null);
      setLastMoodEntryForInsight(currentLastMoodEntryForInsightState);

      fetchInsightForDashboard(loadedIntakeData, currentLastMoodEntryForInsightState);

      // Recent Activities
      const activities: ActivityItem[] = [];
      const lastAiChatString = localStorage.getItem(LAST_AI_CHAT_ACTIVITY_KEY);
      if (lastAiChatString) {
        try {
          const lastAiChat: AiChatActivity = JSON.parse(lastAiChatString);
          activities.push({
            id: 'ai-chat-latest', icon: MessageSquare,
            text: `AI: "${lastAiChat.text.substring(0, 45)}${lastAiChat.text.length > 45 ? '...' : ''}"`,
            timestamp: lastAiChat.timestamp,
            relativeTime: formatDistanceToNow(parseISO(lastAiChat.timestamp), { addSuffix: true }),
            category: 'AI Chat'
          });
        } catch (e) { console.error("Error parsing AI chat activity", e); }
      }

      if (currentLastMoodEntryForInsightState) {
          activities.push({
          id: `mood-log-${currentLastMoodEntryForInsightState.id}`, icon: Smile,
          text: `Logged mood: ${currentLastMoodEntryForInsightState.mood}${currentLastMoodEntryForInsightState.notes ? ` - "${currentLastMoodEntryForInsightState.notes.substring(0, 30)}${currentLastMoodEntryForInsightState.notes.length > 30 ? '...' : ''}"` : ''}`,
          timestamp: currentLastMoodEntryForInsightState.timestamp,
          relativeTime: formatDistanceToNow(parseISO(currentLastMoodEntryForInsightState.timestamp), { addSuffix: true }),
          category: 'Mood Log'
          });
      }
      
      activities.push({
        id: 'community-placeholder-1', icon: Users,
        text: "Feature: Posted in 'Anxiety Support' forum.",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        relativeTime: formatDistanceToNow(new Date(Date.now() - 2 * 60 * 60 * 1000), { addSuffix: true }),
        category: 'Community'
      });
      activities.push({
        id: 'appointment-placeholder-1', icon: CalendarDays,
        text: "Feature: Upcoming consultation with Dr. F.",
        timestamp: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        relativeTime: formatDistanceToNow(new Date(Date.now() + 24 * 60 * 60 * 1000), { addSuffix: true }),
        category: 'Appointment'
      });
      
      activities.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setRecentActivities(activities.slice(0, 4));
    };

    loadDashboardData();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAIChatDialogOpen]); // Reload dashboard relevant data if AI chat closes (e.g. it might have updated LS)


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
                <span className="text-3xl" title={`Your last logged mood: ${lastMood}`}>{lastMood.length > 2 ? lastMood.substring(0,2) : lastMood}</span>
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
            <p className="text-muted-foreground mb-1">Quick overview:</p>
            <div className="flex items-center gap-2 mb-3">
                 <span className="text-2xl p-2 bg-muted rounded-md" title={`Last mood: ${lastMood || 'Not logged'}`}>{lastMood ? (lastMood.length > 2 ? lastMood.substring(0,2) : lastMood) : '🤔'}</span>
                 <span className="text-sm text-muted-foreground">{lastMood ? `Last mood: ${lastMood}` : 'Log your mood!'}</span>
            </div>
            <div className="space-y-1.5">
                <p className="text-sm">Sadness: <span className="font-semibold text-primary">{displaySadnessLevel}</span></p>
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
              {isLoadingInsight && intakeDataExists !== false && ( 
                <div className="flex items-center text-muted-foreground">
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating your personalized insight...
                </div>
              )}
              {!isLoadingInsight && personalizedInsight && intakeDataExists && (
                <p className="text-foreground italic">"{personalizedInsight}"</p>
              )}
              {!isLoadingInsight && !personalizedInsight && intakeDataExists === true && ( 
                 <p className="text-muted-foreground">Could not load an insight. Try refreshing.</p>
              )}
              {intakeDataExists === false && !isLoadingInsight && ( 
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


"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { format, parseISO, subDays, subWeeks, subMonths, startOfWeek, startOfMonth, formatISO } from 'date-fns';
import { ArrowLeft, BarChart3, CalendarClock, Activity, ShieldCheck, Download, Share2, UserCheck, TrendingUp, ListChecks, Target, Repeat, AlertTriangle, Loader2, Info, LineChart, BarChart } from 'lucide-react';
import { ResponsiveContainer, LineChart as ReLineChart, Line, BarChart as ReBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { generateProgressReport, type ProgressReportGeneratorInput, type ProgressReportGeneratorOutput, type DailyChartDataPoint, type WeeklyAverageDataPoint, type MonthlyInsightEntry, type Recommendation } from '@/ai/flows/progress-report-generator';
import { useToast } from '@/hooks/use-toast';

// Mock historical data generator
const createMockIntakeResponse = (date: Date, baseScores: {sadness: number, anxiety: number, stress: number, hopefulness: number, sleep: number}) => {
  const randomFluctuation = (base: number, range: number = 2) => Math.max(1, Math.min(10, Math.round(base + (Math.random() * range * 2) - range)));
  const anxietyOptions: ("Never" | "Rarely" | "Sometimes" | "Often" | "Always")[] = ["Never", "Rarely", "Sometimes", "Often", "Always"];
  const sleepOptions: ("Less than 4" | "4-6" | "6-8" | "More than 8")[] = ["Less than 4", "4-6", "6-8", "More than 8"];
  
  return {
    timestamp: date.toISOString(),
    responses: {
      q1_sadnessLevel: randomFluctuation(baseScores.sadness),
      q2_anxietyFrequency: anxietyOptions[Math.min(anxietyOptions.length - 1, Math.max(0, Math.round(randomFluctuation(baseScores.anxiety, 1.5) / 2) -1))], // Map 1-5 to index 0-4
      q5_stressLevel: randomFluctuation(baseScores.stress),
      q6_sleepHours: sleepOptions[Math.min(sleepOptions.length - 1, Math.max(0, Math.round(randomFluctuation(baseScores.sleep, 1) / 2.5) -1 ))], // Map ~1-4 to index 0-3
      q17_hopefulness: randomFluctuation(baseScores.hopefulness),
    }
  };
};

const generateMockHistory = (numEntries: number = 20): ProgressReportGeneratorInput['history'] => {
  const history: ProgressReportGeneratorInput['history'] = [];
  let currentDate = new Date();
  const baseScores = {sadness: 5, anxiety: 6, stress: 7, hopefulness: 5, sleep: 2}; // sleep score based on options index

  for (let i = 0; i < numEntries; i++) {
    history.push(createMockIntakeResponse(currentDate, baseScores));
    currentDate = subDays(currentDate, Math.floor(Math.random() * 3) + 1); // 1-3 days apart
    // Slightly drift base scores over time for some trend
    if (i % 5 === 0 && i > 0) {
        baseScores.sadness = Math.max(1, baseScores.sadness - (Math.random() > 0.5 ? 1: -0.5));
        baseScores.stress = Math.max(1, baseScores.stress - (Math.random() > 0.5 ? 1: -0.5));
        baseScores.hopefulness = Math.min(10, baseScores.hopefulness + (Math.random() > 0.5 ? 1: -0.5));
    }
  }
  return history.reverse(); // Oldest first
};


export default function MyProgressPage() {
  const [reportData, setReportData] = useState<ProgressReportGeneratorOutput | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchReport = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // For demonstration, using mock historical data.
        // In a real app, this data would be fetched from a persistent store (e.g., Firestore history or localStorage list)
        const mockHistoricalIntake: ProgressReportGeneratorInput = {
          userId: "mockUser123",
          history: generateMockHistory(30), // Generate 30 mock entries for more data
        };

        if (mockHistoricalIntake.history.length === 0) {
             toast({
                title: "No Data for Report",
                description: "There's no historical intake data to generate a progress report. Please complete the intake form regularly.",
                variant: "default"
            });
            setReportData(null);
            setIsLoading(false);
            return;
        }
        
        const result = await generateProgressReport(mockHistoricalIntake);
        setReportData(result);

      } catch (e: any) {
        console.error("Failed to generate progress report:", e);
        setError("Could not load your progress report. Please try again later.");
        toast({
            title: "Error Generating Report",
            description: e.message || "An unexpected error occurred.",
            variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchReport();
  }, [toast]);
  
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-2 bg-background/80 border border-border rounded-md shadow-lg">
          <p className="label text-sm font-semibold text-foreground">{`${label}`}</p>
          {payload.map((entry: any) => (
            <p key={entry.name} style={{ color: entry.color }} className="text-xs">
              {`${entry.name}: ${entry.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };


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
      
      {isLoading && (
        <Card className="shadow-lg">
            <CardHeader><CardTitle>Loading Your Progress Report...</CardTitle></CardHeader>
            <CardContent className="flex justify-center items-center py-10">
                <Loader2 className="h-12 w-12 animate-spin text-primary"/>
            </CardContent>
        </Card>
      )}

      {error && !isLoading && (
         <Card className="shadow-lg border-destructive">
            <CardHeader><CardTitle className="text-destructive flex items-center gap-2"><AlertTriangle/>Error Loading Report</CardTitle></CardHeader>
            <CardContent>
                <p className="text-destructive-foreground">{error}</p>
                 <Button onClick={() => window.location.reload()} variant="destructive" className="mt-4">Try Reloading</Button>
            </CardContent>
        </Card>
      )}

      {!isLoading && !error && !reportData?.dailyChartData?.length && (
         <Card className="shadow-lg">
            <CardHeader><CardTitle className="flex items-center gap-2"><Info className="text-primary h-6 w-6"/>Not Enough Data</CardTitle></CardHeader>
            <CardContent>
                <p className="text-muted-foreground">There isn't enough historical data to generate a detailed progress report yet. Please complete the intake form a few times over the coming days/weeks.</p>
                <Button asChild variant="link" className="p-0 h-auto mt-2">
                    <Link href="/dashboard/intake">Go to Intake Form</Link>
                </Button>
            </CardContent>
        </Card>
      )}

      {!isLoading && !error && reportData && reportData.dailyChartData && reportData.dailyChartData.length > 0 && (
        <>
          <Card className="shadow-lg">
            <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2"><TrendingUp className="text-primary h-6 w-6"/>Progress Summary</CardTitle>
                <CardDescription>{reportData.summary || "No summary available."}</CardDescription>
            </CardHeader>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2"><CalendarClock className="text-primary h-6 w-6"/>Daily Trends (Last 7 Entries)</CardTitle>
              <CardDescription>Your key wellness indicators over the recent period.</CardDescription>
            </CardHeader>
            <CardContent className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ReLineChart data={reportData.dailyChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))"/>
                  <XAxis dataKey="date" tickFormatter={(value) => format(parseISO(value), 'MMM d')} 
                         tick={{fontSize: 12, fill: 'hsl(var(--muted-foreground))'}}/>
                  <YAxis yAxisId="left" orientation="left" stroke="hsl(var(--primary))" tick={{fontSize: 12, fill: 'hsl(var(--muted-foreground))'}} domain={[0, 10]}/>
                  <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--accent))" tick={{fontSize: 12, fill: 'hsl(var(--muted-foreground))'}} domain={[0, 5]} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{fontSize: "12px"}}/>
                  <Line yAxisId="left" type="monotone" dataKey="stress" stroke="hsl(var(--primary))" strokeWidth={2} name="Stress (1-10)" dot={{r:3}} activeDot={{r:5}}/>
                  <Line yAxisId="right" type="monotone" dataKey="sleep" stroke="hsl(var(--chart-2))" strokeWidth={2} name="Sleep Score (1-4)" dot={{r:3}} activeDot={{r:5}}/>
                  <Line yAxisId="left" type="monotone" dataKey="sadness" stroke="hsl(var(--chart-3))" strokeWidth={2} name="Sadness (1-10)" dot={{r:3}} activeDot={{r:5}}/>
                  <Line yAxisId="left" type="monotone" dataKey="hopefulness" stroke="hsl(var(--chart-4))" strokeWidth={2} name="Hopefulness (1-10)" dot={{r:3}} activeDot={{r:5}}/>
                   <Line yAxisId="right" type="monotone" dataKey="anxiety" stroke="hsl(var(--chart-5))" strokeWidth={2} name="Anxiety Score (1-5)" dot={{r:3}} activeDot={{r:5}}/>
                </ReLineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
           {reportData.weeklyAverages && reportData.weeklyAverages.length > 0 && (
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2"><BarChart className="text-primary h-6 w-6"/>Weekly Averages (Last 4 Weeks)</CardTitle>
                <CardDescription>Average wellness indicators on a weekly basis.</CardDescription>
              </CardHeader>
              <CardContent className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ReBarChart data={reportData.weeklyAverages}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="week" tickFormatter={(value) => value.replace('W', 'Week ')} 
                           tick={{fontSize: 12, fill: 'hsl(var(--muted-foreground))'}}/>
                    <YAxis yAxisId="left" orientation="left" stroke="hsl(var(--primary))" tick={{fontSize: 12, fill: 'hsl(var(--muted-foreground))'}} domain={[0, 10]}/>
                    <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--accent))" tick={{fontSize: 12, fill: 'hsl(var(--muted-foreground))'}} domain={[0, 5]}/>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{fontSize: "12px"}}/>
                    <Bar yAxisId="left" dataKey="stressAvg" fill="hsl(var(--primary))" name="Avg Stress" radius={[4, 4, 0, 0]}/>
                    <Bar yAxisId="right" dataKey="sleepAvg" fill="hsl(var(--chart-2))" name="Avg Sleep Score" radius={[4, 4, 0, 0]}/>
                    <Bar yAxisId="left" dataKey="sadnessAvg" fill="hsl(var(--chart-3))" name="Avg Sadness" radius={[4, 4, 0, 0]}/>
                    <Bar yAxisId="left" dataKey="hopefulnessAvg" fill="hsl(var(--chart-4))" name="Avg Hopefulness" radius={[4, 4, 0, 0]}/>
                    <Bar yAxisId="right" dataKey="anxietyAvg" fill="hsl(var(--chart-5))" name="Avg Anxiety Score" radius={[4, 4, 0, 0]}/>
                  </ReBarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}


          {reportData.monthlyInsights && reportData.monthlyInsights.length > 0 && (
            <Card className="shadow-md">
                <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2"><Activity className="text-primary h-6 w-6"/>Monthly Overview</CardTitle>
                <CardDescription>Summary of trends over the past months.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {reportData.monthlyInsights.map((insight, index) => (
                        <div key={index} className="p-3 border rounded-md bg-muted/20">
                            <h4 className="font-semibold text-md text-foreground">{insight.month} - Status: <span className={`font-bold ${insight.status === 'Improving' ? 'text-green-600' : insight.status === 'Declining' ? 'text-red-600' : 'text-foreground'}`}>{insight.status || 'N/A'}</span></h4>
                            <p className="text-sm text-muted-foreground mt-1">{insight.trend || "No specific trend summary available."}</p>
                            <div className="text-xs grid grid-cols-2 sm:grid-cols-3 gap-1 mt-2 text-muted-foreground/80">
                                {insight.sadnessAvg !== undefined && <span>Sadness Avg: {insight.sadnessAvg.toFixed(1)}</span>}
                                {insight.anxietyAvg !== undefined && <span>Anxiety Avg: {insight.anxietyAvg.toFixed(1)}</span>}
                                {insight.stressAvg !== undefined && <span>Stress Avg: {insight.stressAvg.toFixed(1)}</span>}
                                {insight.hopefulnessAvg !== undefined && <span>Hopefulness Avg: {insight.hopefulnessAvg.toFixed(1)}</span>}
                                {insight.sleepAvg !== undefined && <span>Sleep Avg: {insight.sleepAvg.toFixed(1)}</span>}
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
          )}
          
          {reportData.recommendations && reportData.recommendations.length > 0 && (
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2"><ListChecks className="text-primary h-6 w-6"/>Personalized Insights & Suggestions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {reportData.recommendations.map((rec, index) => (
                  <div key={index} className={`p-3 rounded-md border ${rec.type === 'Insight' ? 'bg-accent/10 border-accent/30' : 'bg-primary/10 border-primary/30'}`}>
                    <p className="font-semibold text-sm text-foreground">{rec.type}:</p>
                    <p className="text-sm text-muted-foreground">{rec.text}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </>
      )}
      
      <Separator />

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2"><Target className="text-primary h-6 w-6"/>Goals & Habits (Future Feature)</CardTitle>
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

    
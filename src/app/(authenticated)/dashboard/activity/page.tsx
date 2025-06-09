
"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format, formatDistanceToNow, parseISO } from 'date-fns';
import { ArrowLeft, MessageSquare, Smile, Users, CalendarDays } from 'lucide-react';

interface MoodLogEntry {
  id: string;
  mood: string;
  notes?: string;
  timestamp: string; // ISO string
}

interface AiChatHistoryEntry {
  text: string;
  timestamp: string; // ISO string
}

interface ActivityItem {
  id: string;
  icon: React.ElementType;
  text: string;
  timestamp: string; // ISO string
  relativeTime: string;
  fullDate: string;
  category: 'AI Chat' | 'Community' | 'Appointment' | 'Mood Log';
}

const AI_CHAT_HISTORY_KEY = 'wellspringUserAiChatHistory';
const MOOD_LOG_KEY = 'wellspringUserMoodLog';

export default function AllActivityPage() {
  const [allActivities, setAllActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const activities: ActivityItem[] = [];

    // 1. AI Chat History
    const aiChatHistoryString = localStorage.getItem(AI_CHAT_HISTORY_KEY);
    if (aiChatHistoryString) {
      try {
        const aiChatHistory: AiChatHistoryEntry[] = JSON.parse(aiChatHistoryString);
        aiChatHistory.forEach((chat, index) => {
          activities.push({
            id: `ai-chat-hist-${index}-${new Date(chat.timestamp).getTime()}`,
            icon: MessageSquare,
            text: `AI: "${chat.text.substring(0, 100)}${chat.text.length > 100 ? '...' : ''}"`,
            timestamp: chat.timestamp,
            relativeTime: formatDistanceToNow(parseISO(chat.timestamp), { addSuffix: true }),
            fullDate: format(parseISO(chat.timestamp), 'PPP p'),
            category: 'AI Chat'
          });
        });
      } catch (e) { console.error("Error parsing AI chat history", e); }
    }

    // 2. Mood Log History
    const moodLogString = localStorage.getItem(MOOD_LOG_KEY);
    if (moodLogString) {
      try {
        const moodLog: MoodLogEntry[] = JSON.parse(moodLogString);
        moodLog.forEach(entry => {
          activities.push({
            id: `mood-log-hist-${entry.id}`,
            icon: Smile,
            text: `Logged mood: ${entry.mood}${entry.notes ? ` - "${entry.notes.substring(0, 80)}${entry.notes.length > 80 ? '...' : ''}"` : ''}`,
            timestamp: entry.timestamp,
            relativeTime: formatDistanceToNow(parseISO(entry.timestamp), { addSuffix: true }),
            fullDate: format(parseISO(entry.timestamp), 'PPP p'),
            category: 'Mood Log'
          });
        });
      } catch (e) { console.error("Error parsing mood log history", e); }
    }

    // 3. Placeholder Community Activity (add more for variety if needed)
    activities.push({
      id: 'community-placeholder-full-1',
      icon: Users,
      text: "Feature: Posted in 'Anxiety Support' forum.",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), 
      relativeTime: formatDistanceToNow(new Date(Date.now() - 2 * 60 * 60 * 1000), { addSuffix: true }),
      fullDate: format(new Date(Date.now() - 2 * 60 * 60 * 1000), 'PPP p'),
      category: 'Community'
    });
     activities.push({
      id: 'community-placeholder-full-2',
      icon: Users,
      text: "Feature: Replied to a thread in 'Mindfulness Group'.",
      timestamp: new Date(Date.now() - 28 * 60 * 60 * 1000).toISOString(), 
      relativeTime: formatDistanceToNow(new Date(Date.now() - 28 * 60 * 60 * 1000), { addSuffix: true }),
      fullDate: format(new Date(Date.now() - 28 * 60 * 60 * 1000), 'PPP p'),
      category: 'Community'
    });


    // 4. Placeholder Appointment Activity (add more for variety if needed)
    activities.push({
      id: 'appointment-placeholder-full-1',
      icon: CalendarDays,
      text: "Feature: Upcoming consultation with Dr. F.",
      timestamp: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      relativeTime: formatDistanceToNow(new Date(Date.now() + 24 * 60 * 60 * 1000), { addSuffix: true }),
      fullDate: format(new Date(Date.now() + 24 * 60 * 60 * 1000), 'PPP p'),
      category: 'Appointment'
    });
     activities.push({
      id: 'appointment-placeholder-full-2',
      icon: CalendarDays,
      text: "Feature: Past consultation with Dr. A completed.",
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      relativeTime: formatDistanceToNow(new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), { addSuffix: true }),
      fullDate: format(new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), 'PPP p'),
      category: 'Appointment'
    });
    
    activities.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    setAllActivities(activities);
    setIsLoading(false);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <CardTitle className="text-3xl font-headline">Full Activity Log</CardTitle>
        <Button variant="outline" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardDescription>
            A comprehensive list of your interactions and activities within Wellspring.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-10 text-muted-foreground">Loading activities...</div>
          ) : allActivities.length > 0 ? (
            <ScrollArea className="h-[60vh] pr-3">
              <ul className="space-y-4">
                {allActivities.map(activity => (
                  <li key={activity.id} className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="p-2 bg-primary/10 rounded-full">
                        <activity.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-grow">
                      <p className="text-sm text-foreground leading-snug">{activity.text}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {activity.fullDate} ({activity.relativeTime}) - <span className="font-medium">{activity.category}</span>
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </ScrollArea>
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              No activities recorded yet. Start interacting with the app!
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

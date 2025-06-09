
"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Smile, BarChart3, MessageCircle, FileText } from 'lucide-react';

export default function DashboardPage() {
  const [userName, setUserName] = useState<string | null>(null);
  const [intakeDataExists, setIntakeDataExists] = useState<boolean | null>(null);

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
  }, []);


  return (
    <div className="space-y-8">
      <Card className="shadow-lg border-none bg-gradient-to-r from-primary/10 to-accent/10">
        <CardHeader>
          <CardTitle className="text-3xl md:text-4xl font-headline text-foreground">
            Welcome{userName ? `, ${userName}` : ' to Wellspring'}!
          </CardTitle>
          <CardDescription className="text-lg text-muted-foreground">
            This is your personal space to nurture your mental well-being.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-6 text-foreground">
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

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mood Check-in</CardTitle>
            <Smile className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">How are you feeling?</div>
            <p className="text-xs text-muted-foreground mt-1">
              Log your mood to gain insights.
            </p>
            <Button asChild variant="outline" size="sm" className="mt-4">
              <Link href="/dashboard/mood-checkin">Record Mood</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Chat Assistant</CardTitle>
            <MessageCircle className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Need to talk?</div>
            <p className="text-xs text-muted-foreground mt-1">
              Our AI is here to listen and support. (Feature coming soon)
            </p>
            <Button size="sm" className="mt-4" disabled>Start Chat</Button>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Personalized Insights</CardTitle>
            <BarChart3 className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Discover Patterns</div>
            <p className="text-xs text-muted-foreground mt-1">
              Understand your mental wellness trends. (Feature coming soon)
            </p>
            <Button variant="outline" size="sm" className="mt-4" disabled>View Insights</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

    
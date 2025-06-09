
"use client";

import { useEffect, useState, use } from 'react'; // Added 'use'
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, CalendarDays, MessageSquare, ShieldCheck, Star, Video } from 'lucide-react';

interface TherapistProfilePageProps {
  params: Promise<{ // params is now a Promise
    therapistId: string;
  }>;
}

// Placeholder data - in a real app, this would come from a backend
const placeholderTherapistDetails = {
  id: '1',
  name: 'Dr. Emily Carter',
  specialization: 'Cognitive Behavioral Therapy',
  imageUrl: 'https://placehold.co/400x400.png',
  bio: "Dr. Emily Carter is a licensed clinical psychologist with over 10 years of experience specializing in Cognitive Behavioral Therapy (CBT). She is passionate about helping individuals overcome challenges such as anxiety, depression, and stress. Dr. Carter believes in a collaborative approach, working with clients to develop practical skills and strategies for lasting mental wellness. Her sessions are tailored to individual needs, fostering a supportive and non-judgmental environment.",
  languages: ['English', 'Spanish'],
  rating: 4.8,
  reviewsCount: 120,
  sessionPrice: 120, // Example price
  availability: [ // Example structure
    { date: '2024-08-05', slots: ['09:00', '10:00', '14:00'] },
    { date: '2024-08-06', slots: ['11:00', '15:00'] },
  ]
};


export default function TherapistProfilePage({ params: paramsPromise }: TherapistProfilePageProps) {
  const params = use(paramsPromise); // Unwrap the promise
  const { therapistId } = params; // Access therapistId from the resolved params

  const [isPremiumUser, setIsPremiumUser] = useState<boolean | null>(null);
  
  // In a real app, you'd fetch therapist details based on therapistId
  const therapist = placeholderTherapistDetails; // Using placeholder

  useEffect(() => {
    const premiumStatus = localStorage.getItem('wellspringUserIsPremium');
    setIsPremiumUser(premiumStatus === 'true');
  }, []);


  if (isPremiumUser === null) {
    return <div className="flex items-center justify-center h-full"><p>Loading premium status...</p></div>;
  }

  if (!isPremiumUser) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-6">
        <Card className="max-w-md shadow-xl">
            <CardHeader>
                <CardTitle className="text-2xl flex items-center justify-center gap-2">
                    <ShieldCheck className="h-8 w-8 text-primary"/>
                    Premium Feature Access
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-lg text-muted-foreground mb-6">
                    Viewing therapist profiles and booking consultations is a premium feature.
                </p>
                 <Button size="lg" className="w-full" onClick={() => alert("Redirect to upgrade page (placeholder)")}>
                    Upgrade to Wellspring Premium
                </Button>
            </CardContent>
             <CardFooter className="flex-col items-start">
                <Button variant="outline" asChild className="w-full mt-4">
                    <Link href="/dashboard/consultations">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Therapist Directory
                    </Link>
                </Button>
            </CardFooter>
        </Card>
      </div>
    );
  }

  if (!therapist) {
    return <div className="text-center py-10">Therapist not found.</div>;
  }

  return (
    <div className="space-y-8">
        <div className="mb-6">
            <Button variant="outline" asChild>
            <Link href="/dashboard/consultations">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Therapist Directory
            </Link>
            </Button>
        </div>

      <Card className="shadow-xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10 p-0">
          <div className="md:flex">
            <div className="md:w-1/3 p-6 flex justify-center items-center">
                <Image 
                    src={therapist.imageUrl} 
                    alt={therapist.name} 
                    width={200} 
                    height={200} 
                    className="rounded-full shadow-lg border-4 border-background object-cover aspect-square" 
                    data-ai-hint="person professional"
                />
            </div>
            <div className="md:w-2/3 p-6 flex flex-col justify-center">
              <CardTitle className="text-3xl font-headline mb-1">{therapist.name}</CardTitle>
              <Badge variant="default" className="w-fit text-md mb-2">{therapist.specialization}</Badge>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                <span>{therapist.rating}/5 ({therapist.reviewsCount} reviews)</span>
              </div>
              <p className="text-sm text-muted-foreground">Languages: {therapist.languages.join(', ')}</p>
              <p className="text-lg font-semibold text-primary mt-2">${therapist.sessionPrice} / session</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <h3 className="text-xl font-semibold mb-2">About {therapist.name}</h3>
          <p className="text-muted-foreground whitespace-pre-line">{therapist.bio}</p>

          <div className="mt-6 pt-6 border-t">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <CalendarDays className="h-6 w-6 text-primary" />
                Book a Session <Badge variant="outline" className="ml-2 border-primary text-primary">Premium</Badge>
            </h3>
            {/* Placeholder for interactive calendar and time slot selection */}
            <div className="p-6 border rounded-lg bg-muted/30 text-center">
              <p className="text-muted-foreground mb-3">Interactive calendar for booking will appear here.</p>
              <Button disabled>Select Date & Time (Coming Soon)</Button>
              <p className="text-xs text-muted-foreground mt-2">Real-time slot locking and payment integration will be part of this step.</p>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <MessageSquare className="h-6 w-6 text-primary" />
                Reviews (Placeholder)
            </h3>
             <div className="p-6 border rounded-lg bg-muted/30 text-center">
                <p className="text-muted-foreground">User reviews will be displayed here.</p>
             </div>
          </div>
        </CardContent>
        <CardFooter className="p-6 border-t bg-muted/20">
            <Button size="lg" className="w-full" disabled>
                <Video className="mr-2 h-5 w-5"/>
                Proceed to Book Session (Payment Required)
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

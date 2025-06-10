
"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, ShieldCheck, Video } from 'lucide-react';

interface Therapist {
  id: string;
  name: string;
  specialization: string;
  imageUrl: string;
  description: string;
  rating: number;
}

const placeholderTherapists: Therapist[] = [
  { id: '1', name: 'Dr. Emily Carter', specialization: 'Cognitive Behavioral Therapy', imageUrl: 'https://i.pinimg.com/736x/c9/b5/b6/c9b5b62799692878b33d77fa2eb1fc38.jpg', description: 'Experienced in treating anxiety and depression with CBT techniques.', rating: 4.8 },
  { id: '2', name: 'Dr. Ben Miller', specialization: 'Mindfulness & Stress Reduction', imageUrl: 'https://hips.hearstapps.com/hmg-prod/images/portrait-of-a-happy-young-doctor-in-his-clinic-royalty-free-image-1661432441.jpg', description: 'Helping clients find calm and manage stress through mindfulness practices.', rating: 4.9 },
  { id: '3', name: 'Dr. Olivia Davis', specialization: 'Relationship Counseling', imageUrl: 'https://img.freepik.com/free-photo/beautiful-young-female-doctor-looking-camera-office_1301-7807.jpg?semt=ais_items_boosted&w=740', description: 'Supports individuals and couples in building healthier relationships.', rating: 4.7 },
];

function TherapistCard({ therapist }: { therapist: Therapist }) {
  return (
    <Card className="flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="p-0">
        <div className="relative w-full aspect-square overflow-hidden">
          <Image
            src={therapist.imageUrl}
            alt={therapist.name}
            layout="fill"
            objectFit="cover"
            data-ai-hint="person professional"
          />
        </div>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <CardTitle className="text-xl mb-1">{therapist.name}</CardTitle>
        <Badge variant="secondary" className="mb-2">{therapist.specialization}</Badge>
        <CardDescription className="text-sm text-muted-foreground mb-3">{therapist.description}</CardDescription>
        <div className="text-sm">Rating: <span className="font-semibold text-primary">{therapist.rating}/5</span></div>
      </CardContent>
      <CardFooter className="p-4 border-t">
        <Button asChild className="w-full">
          <Link href={`/dashboard/consultations/${therapist.id}`}>
            View Profile & Book <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

export default function ConsultationsPage() {
  const [isPremiumUser, setIsPremiumUser] = useState<boolean | null>(null);

  useEffect(() => {
    const premiumStatus = localStorage.getItem('wellspringUserIsPremium');
    setIsPremiumUser(premiumStatus === 'true');
  }, []);

  if (isPremiumUser === null) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Loading premium status...</p>
      </div>
    );
  }

  if (!isPremiumUser) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-6">
        <Card className="max-w-md shadow-xl">
            <CardHeader>
                <CardTitle className="text-2xl flex items-center justify-center gap-2">
                    <ShieldCheck className="h-8 w-8 text-primary"/>
                    Premium Feature
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-lg text-muted-foreground mb-6">
                    Access to video consultations with licensed therapists is a premium feature.
                </p>
                <Button size="lg" className="w-full">
                    Upgrade to MINDSTRIDE Premium
                </Button>
            </CardContent>
            <CardFooter>
                <p className="text-xs text-muted-foreground">
                    Unlock personalized video sessions, advanced tools, and more.
                </p>
            </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Card className="shadow-lg border-none bg-gradient-to-r from-primary/10 to-accent/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
                <CardTitle className="text-3xl font-headline flex items-center gap-2">
                    <Video className="h-8 w-8 text-primary"/>
                    Video Consultations <Badge variant="outline" className="ml-2 border-primary text-primary">Premium</Badge>
                </CardTitle>
                <CardDescription className="text-lg text-muted-foreground mt-1">
                    Connect with licensed therapists for personalized video sessions.
                </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="mb-6">
        {/* Placeholder for filters */}
        <p className="text-muted-foreground text-center">Therapist filtering options will appear here.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {placeholderTherapists.map((therapist) => (
          <TherapistCard key={therapist.id} therapist={therapist} />
        ))}
      </div>
       <div className="text-center mt-8">
        <Button variant="outline">Load More Therapists (Placeholder)</Button>
      </div>
    </div>
  );
}

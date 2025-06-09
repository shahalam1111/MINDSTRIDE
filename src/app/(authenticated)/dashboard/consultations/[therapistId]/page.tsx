
"use client";

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, CalendarDays, MessageSquare, ShieldCheck, Star, Video, Clock } from 'lucide-react';
import { Calendar } from "@/components/ui/calendar";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO } from 'date-fns';

interface TherapistProfilePageProps {
  params: Promise<{
    therapistId: string;
  }>;
}

interface AvailabilitySlot {
  date: string; // YYYY-MM-DD
  slots: string[]; // HH:mm
}

const placeholderTherapistDetails = {
  id: '1',
  name: 'Dr. Emily Carter',
  specialization: 'Cognitive Behavioral Therapy',
  imageUrl: 'https://placehold.co/400x400.png',
  bio: "Dr. Emily Carter is a licensed clinical psychologist with over 10 years of experience specializing in Cognitive Behavioral Therapy (CBT). She is passionate about helping individuals overcome challenges such as anxiety, depression, and stress. Dr. Carter believes in a collaborative approach, working with clients to develop practical skills and strategies for lasting mental wellness. Her sessions are tailored to individual needs, fostering a supportive and non-judgmental environment.",
  languages: ['English', 'Spanish'],
  rating: 4.8,
  reviewsCount: 120,
  sessionPrice: 120,
  availability: [
    { date: '2024-09-10', slots: ['09:00', '10:00', '14:00', '15:00'] },
    { date: '2024-09-11', slots: ['11:00', '15:00', '16:00'] },
    { date: '2024-09-12', slots: ['09:00', '10:00', '11:00', '14:00'] },
    { date: '2024-09-16', slots: ['10:00', '11:00'] },
  ] as AvailabilitySlot[]
};


export default function TherapistProfilePage({ params: paramsPromise }: TherapistProfilePageProps) {
  const params = use(paramsPromise);
  const { therapistId } = params;
  const { toast } = useToast();

  const [isPremiumUser, setIsPremiumUser] = useState<boolean | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [selectedTime, setSelectedTime] = useState<string | undefined>(undefined);
  
  const therapist = placeholderTherapistDetails; // Using placeholder

  useEffect(() => {
    const premiumStatus = localStorage.getItem('wellspringUserIsPremium');
    setIsPremiumUser(premiumStatus === 'true');
  }, []);

  useEffect(() => {
    if (selectedDate && therapist.availability) {
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      const dayAvailability = therapist.availability.find(day => day.date === formattedDate);
      setAvailableTimes(dayAvailability ? dayAvailability.slots : []);
      setSelectedTime(undefined); // Reset selected time when date changes
    } else {
      setAvailableTimes([]);
      setSelectedTime(undefined);
    }
  }, [selectedDate, therapist.availability]);

  const handleBooking = () => {
    if (!selectedDate || !selectedTime) {
      toast({
        title: "Selection Incomplete",
        description: "Please select a date and time for your session.",
        variant: "destructive",
      });
      return;
    }
    // Simulate payment and booking
    toast({
      title: "Proceeding to Payment (Simulated)",
      description: `Booking for ${therapist.name} on ${format(selectedDate, 'PPP')} at ${selectedTime}. You would now be redirected to a secure payment gateway.`,
    });
    // In a real app:
    // 1. Lock the time slot (backend operation)
    // 2. Redirect to payment gateway
    // 3. On payment success, confirm booking, send emails (backend operations)
  };

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
                    Upgrade to MINDSTRIDE Premium
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

  const today = new Date();
  const availableDates = therapist.availability.map(a => parseISO(a.date));

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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                <div className="border rounded-lg p-2 sm:p-4 bg-muted/20 shadow-sm">
                    <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        disabled={(date) => 
                            date < today || 
                            !availableDates.some(availableDate => 
                                format(availableDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
                            )
                        }
                        initialFocus
                        className="w-full flex justify-center"
                    />
                </div>
                <div className="space-y-4">
                    {selectedDate && (
                        <div>
                            <h4 className="text-md font-medium mb-3 text-foreground">
                                Available slots for: <span className="text-primary">{format(selectedDate, "PPP")}</span>
                            </h4>
                            {availableTimes.length > 0 ? (
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {availableTimes.map(time => (
                                    <Button 
                                        key={time} 
                                        variant={selectedTime === time ? "default" : "outline"}
                                        onClick={() => setSelectedTime(time)}
                                        className="flex items-center justify-center gap-1.5"
                                    >
                                        <Clock className="h-4 w-4"/>
                                        {time}
                                    </Button>
                                ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">No available slots for this date. Please select another date.</p>
                            )}
                        </div>
                    )}
                    {!selectedDate && (
                         <div className="p-4 border rounded-lg bg-muted/30 text-center">
                            <p className="text-muted-foreground">Please select a date from the calendar to see available times.</p>
                        </div>
                    )}
                </div>
            </div>
             <p className="text-xs text-muted-foreground mt-4 text-center">
                Real-time slot availability and payment integration are simulated for this prototype.
            </p>
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
            <Button 
                size="lg" 
                className="w-full" 
                onClick={handleBooking}
                disabled={!selectedDate || !selectedTime}
            >
                <Video className="mr-2 h-5 w-5"/>
                Proceed to Book Session (Payment Simulated)
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

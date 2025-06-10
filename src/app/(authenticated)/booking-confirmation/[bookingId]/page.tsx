
"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Badge }
from '@/components/ui/badge';
import { CheckCircle, Video, CalendarDays, Clock, UserCircle, ArrowLeft } from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface BookingDetails {
  bookingId: string;
  therapistId: string;
  therapistName: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  status: string;
}

export default function BookingConfirmationPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params.bookingId as string;
  const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (bookingId) {
      setIsLoading(true);
      // Simulate fetching booking details from localStorage (replace with Firestore in real app)
      const storedBookings = localStorage.getItem('wellspringUserBookings');
      if (storedBookings) {
        const bookings: BookingDetails[] = JSON.parse(storedBookings);
        const foundBooking = bookings.find(b => b.bookingId === bookingId);
        if (foundBooking) {
          setBookingDetails(foundBooking);
        } else {
          // Handle case where booking is not found, maybe redirect or show error
          console.error("Booking not found in localStorage");
        }
      }
      // Simulate fetching therapist details (minimal for now)
      // In a real app, you might fetch more therapist details if needed.
      // For this prototype, therapistName is already in bookingDetails from localStorage.
      setIsLoading(false);
    }
  }, [bookingId]);

  const handleStartSession = () => {
    // Navigate to a simulated session page
    router.push(`/session/${bookingId}`);
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading booking details...</div>;
  }

  if (!bookingDetails) {
    return (
      <div className="text-center py-10">
        <p className="text-xl text-muted-foreground mb-4">Booking not found or invalid.</p>
        <Button variant="outline" asChild>
          <Link href="/dashboard/consultations"><ArrowLeft className="mr-2 h-4 w-4"/>Back to Consultations</Link>
        </Button>
      </div>
    );
  }
  
  const sessionDateTime = parseISO(`${bookingDetails.date}T${bookingDetails.time}`);
  const isSessionTime = new Date() >= sessionDateTime; // Basic check if session time has arrived

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)] py-8 px-4">
      <Card className="w-full max-w-2xl shadow-xl">
        <CardHeader className="text-center bg-primary/10 py-8">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <CardTitle className="text-3xl font-headline text-primary">Booking Confirmed!</CardTitle>
          <CardDescription className="text-lg text-muted-foreground">
            Your session with {bookingDetails.therapistName} is scheduled.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div>
            <h3 className="text-xl font-semibold mb-3 text-foreground">Session Details:</h3>
            <div className="space-y-3 text-md">
              <div className="flex items-center gap-3">
                <UserCircle className="h-5 w-5 text-primary" />
                <span>Therapist: <strong>{bookingDetails.therapistName}</strong></span>
              </div>
              <div className="flex items-center gap-3">
                <CalendarDays className="h-5 w-5 text-primary" />
                <span>Date: <strong>{format(parseISO(bookingDetails.date), 'PPP')}</strong></span>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-primary" />
                <span>Time: <strong>{bookingDetails.time}</strong> (Your local time)</span>
              </div>
               <div className="flex items-center gap-3">
                <Badge variant={bookingDetails.status === 'Confirmed' ? 'default' : 'secondary'}>
                    Status: {bookingDetails.status}
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="pt-4 border-t">
             <p className="text-sm text-muted-foreground mb-3">
              You will receive a reminder before your session. Please ensure you have a stable internet connection and a private space.
            </p>
             <Button 
                onClick={handleStartSession} 
                className="w-full" 
                size="lg"
                disabled={!isSessionTime} // Enable only if session time has arrived (basic check)
            >
                <Video className="mr-2 h-5 w-5"/> 
                {isSessionTime ? "Start Your Session" : `Session starts ${format(sessionDateTime, 'Pp')}`}
            </Button>
            {!isSessionTime && <p className="text-xs text-center mt-1 text-muted-foreground">The "Start Session" button will be enabled when it's time for your appointment.</p>}
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="outline" asChild>
              <Link href="/dashboard/consultations">Back to Consultations</Link>
            </Button>
            <Button variant="ghost" disabled>Reschedule/Cancel (Placeholder)</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

    
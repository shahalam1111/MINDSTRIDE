
"use client";

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, CalendarDays, MessageSquare, ShieldCheck, Star, Video, Clock, ThumbsUp, Send, UserCircle } from 'lucide-react';
import { Calendar } from "@/components/ui/calendar";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO, addHours } from 'date-fns';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation'; // Import useRouter

interface TherapistProfilePageProps {
  params: Promise<{
    therapistId: string;
  }>;
}

interface AvailabilitySlot {
  date: string; // YYYY-MM-DD
  slots: string[]; // HH:mm
}

interface Review {
    id: string;
    author: string;
    rating: number;
    comment: string;
    date: string; // ISO Date string
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
    // Add more availability for testing, ensure dates are in the future from current testing date
    { date: format(new Date(new Date().setDate(new Date().getDate() + 3)), 'yyyy-MM-dd'), slots: ['10:00', '11:00', '14:00'] },
    { date: format(new Date(new Date().setDate(new Date().getDate() + 5)), 'yyyy-MM-dd'), slots: ['09:30', '13:00', '15:30'] },
  ] as AvailabilitySlot[],
  reviews: [
    { id: 'rev1', author: 'Jane D.', rating: 5, comment: "Dr. Carter is fantastic! She's very understanding and her CBT techniques have really helped my anxiety.", date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
    { id: 'rev2', author: 'John S.', rating: 4, comment: "Helpful sessions, good listener. Sometimes scheduling can be a bit tricky.", date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString() },
    { id: 'rev3', author: 'Anonymous', rating: 5, comment: "Highly recommend for anyone struggling with stress. Very practical advice.", date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() },
  ] as Review[]
};


export default function TherapistProfilePage({ params: paramsPromise }: TherapistProfilePageProps) {
  const params = use(paramsPromise);
  const { therapistId } = params;
  const { toast } = useToast();
  const router = useRouter(); // Initialize useRouter

  const [isPremiumUser, setIsPremiumUser] = useState<boolean | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [selectedTime, setSelectedTime] = useState<string | undefined>(undefined);
  const [showBookingConfirmation, setShowBookingConfirmation] = useState(false);
  const [newReviewText, setNewReviewText] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(0);
  
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
      setSelectedTime(undefined); 
    } else {
      setAvailableTimes([]);
      setSelectedTime(undefined);
    }
  }, [selectedDate, therapist.availability]);

  const handleBookingAttempt = () => {
    if (!selectedDate || !selectedTime) {
      toast({
        title: "Selection Incomplete",
        description: "Please select a date and time for your session.",
        variant: "destructive",
      });
      return;
    }
    setShowBookingConfirmation(true);
  };

  const handleConfirmBooking = () => {
    // Simulate booking
    const bookingId = `booking-${therapist.id}-${Date.now()}`;
    console.log("Booking Confirmed (Simulated):", {
        therapistId: therapist.id,
        therapistName: therapist.name,
        date: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : 'N/A',
        time: selectedTime,
        bookingId: bookingId
    });
    // In a real app, save to Firestore here.
    // Example localStorage save for prototype:
    const bookings = JSON.parse(localStorage.getItem('wellspringUserBookings') || '[]');
    bookings.push({ bookingId, therapistId: therapist.id, therapistName: therapist.name, date: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : 'N/A', time: selectedTime, status: 'Confirmed' });
    localStorage.setItem('wellspringUserBookings', JSON.stringify(bookings));

    setShowBookingConfirmation(false);
    toast({
      title: "Session Booked! (Simulated)",
      description: `Your session with ${therapist.name} on ${selectedDate ? format(selectedDate, 'PPP') : ''} at ${selectedTime} is confirmed.`,
    });
    router.push(`/booking-confirmation/${bookingId}`); // Navigate to confirmation page
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newReviewRating === 0 || !newReviewText.trim()) {
      toast({ title: "Review Incomplete", description: "Please provide a rating and comment.", variant: "destructive" });
      return;
    }
    // Simulate review submission
    console.log("Review Submitted (Simulated):", { therapistId, rating: newReviewRating, comment: newReviewText });
    toast({ title: "Review Submitted (Simulated)", description: "Thank you for your feedback!" });
    setNewReviewText('');
    setNewReviewRating(0);
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
  today.setHours(0,0,0,0); // Set to start of day for comparison
  
  const availableDates = therapist.availability
    .map(a => parseISO(a.date))
    .filter(d => d >= today); // Only allow booking for today or future dates with availability

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
                        disabled={(date) => {
                            if (date < today) return true; // Disable past dates
                            const dateString = format(date, 'yyyy-MM-dd');
                            return !therapist.availability.some(a => a.date === dateString && a.slots.length > 0);
                        }}
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
          </div>

          <div className="mt-6 pt-6 border-t">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <MessageSquare className="h-6 w-6 text-primary" />
                Reviews ({therapist.reviews.length})
            </h3>
             <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2">
                {therapist.reviews.map(review => (
                    <Card key={review.id} className="bg-muted/30">
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <UserCircle className="h-5 w-5 text-muted-foreground"/>
                                    <CardTitle className="text-md">{review.author}</CardTitle>
                                </div>
                                <div className="flex items-center">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-muted-foreground/50'}`}/>
                                    ))}
                                </div>
                            </div>
                            <CardDescription className="text-xs">{format(parseISO(review.date), "PPP")}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">{review.comment}</p>
                        </CardContent>
                    </Card>
                ))}
             </div>
             <Card className="bg-background p-4 border-dashed">
                 <h4 className="text-md font-semibold mb-2">Leave a Review (UI Only)</h4>
                 <form onSubmit={handleReviewSubmit} className="space-y-3">
                    <div>
                        <Label className="mb-1 block">Rating:</Label>
                        <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map(star => (
                                <Button key={star} type="button" variant="ghost" size="icon" onClick={() => setNewReviewRating(star)} className={`hover:text-yellow-500 ${newReviewRating >= star ? 'text-yellow-500 fill-yellow-500' : 'text-muted-foreground/50'}`}>
                                    <Star className="h-5 w-5"/>
                                </Button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <Label htmlFor="reviewText" className="mb-1 block">Comment:</Label>
                        <Textarea id="reviewText" value={newReviewText} onChange={(e) => setNewReviewText(e.target.value)} placeholder="Share your experience..." rows={3}/>
                    </div>
                    <Button type="submit" size="sm"><Send className="mr-2 h-4 w-4"/>Submit Review</Button>
                 </form>
             </Card>
          </div>
        </CardContent>
        <CardFooter className="p-6 border-t bg-muted/20">
            <Button 
                size="lg" 
                className="w-full" 
                onClick={handleBookingAttempt}
                disabled={!selectedDate || !selectedTime}
            >
                <Video className="mr-2 h-5 w-5"/>
                Proceed to Book Session
            </Button>
        </CardFooter>
      </Card>

      <AlertDialog open={showBookingConfirmation} onOpenChange={setShowBookingConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Your Booking</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to book a session with <strong>{therapist.name}</strong> on <br />
              <strong>{selectedDate ? format(selectedDate, 'PPP') : 'N/A'}</strong> at <strong>{selectedTime || 'N/A'}</strong>.
              <br /><br />
              The session fee is <strong>${therapist.sessionPrice}</strong>. (Payment is simulated for this prototype).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmBooking}>Confirm & Book</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}

    
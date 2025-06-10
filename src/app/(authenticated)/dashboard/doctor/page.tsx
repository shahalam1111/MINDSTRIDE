
"use client";

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserCircle, CalendarDays, Edit3, ListChecks, BarChartHorizontalBig, MessageSquare } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// Mock data - replace with actual data fetching
const doctorProfile = {
  name: "Dr. Alex Chen",
  specialization: "Clinical Psychologist",
  email: "alex.chen@mindstride.com",
  avatar: "https://placehold.co/100x100.png?text=AC",
};

const upcomingAppointments = [
  { id: "appt1", patientName: "John Doe", time: "Tomorrow, 10:00 AM", type: "Video Call" },
  { id: "appt2", patientName: "Jane Smith", time: "Tomorrow, 02:30 PM", type: "Video Call" },
  { id: "appt3", patientName: "Bob Johnson", time: "Day after, 09:00 AM", type: "Video Call" },
];

const timeSlotSummary = {
  totalSlotsToday: 8,
  bookedSlotsToday: 5,
  availableSlotsToday: 3,
};

export default function DoctorDashboardPage() {
  return (
    <div className="space-y-8">
      <Card className="shadow-lg border-none bg-gradient-to-r from-primary/10 to-accent/10">
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-3xl font-headline">Doctor Dashboard</CardTitle>
              <CardDescription className="text-lg text-muted-foreground mt-1">
                Welcome, {doctorProfile.name}. Manage your schedule and patient interactions.
              </CardDescription>
            </div>
             <Avatar className="h-16 w-16 hidden sm:block">
                <AvatarImage src={doctorProfile.avatar} alt={doctorProfile.name} data-ai-hint="doctor person"/>
                <AvatarFallback>{doctorProfile.name.split(' ').map(n=>n[0]).join('')}</AvatarFallback>
            </Avatar>
          </div>
        </CardHeader>
      </Card>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Profile Overview Card */}
        <Card className="lg:col-span-1 hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><UserCircle className="h-6 w-6 text-primary" />Profile Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-3">
                 <Avatar className="h-12 w-12">
                    <AvatarImage src={doctorProfile.avatar} alt={doctorProfile.name} data-ai-hint="doctor person"/>
                    <AvatarFallback>{doctorProfile.name.split(' ').map(n=>n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div>
                    <p className="font-semibold text-lg">{doctorProfile.name}</p>
                    <p className="text-sm text-muted-foreground">{doctorProfile.specialization}</p>
                </div>
            </div>
            <p className="text-sm text-muted-foreground">Email: {doctorProfile.email}</p>
            <Button variant="outline" className="w-full mt-2" disabled>Edit Profile (Placeholder)</Button>
          </CardContent>
        </Card>

        {/* Manage Time Slots Card */}
        <Card className="hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Edit3 className="h-6 w-6 text-primary" />Manage Time Slots</CardTitle>
            <CardDescription>Summary for today. Full schedule management coming soon.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p>Total Slots Today: <span className="font-semibold">{timeSlotSummary.totalSlotsToday}</span></p>
            <p>Booked Slots: <span className="font-semibold text-destructive">{timeSlotSummary.bookedSlotsToday}</span></p>
            <p>Available Slots: <span className="font-semibold text-green-600">{timeSlotSummary.availableSlotsToday}</span></p>
            <Button variant="default" className="w-full mt-2" disabled>
                <CalendarDays className="mr-2 h-4 w-4"/> Open Full Schedule (Placeholder)
            </Button>
          </CardContent>
        </Card>
        
        {/* View Booked Sessions Card */}
        <Card className="hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><ListChecks className="h-6 w-6 text-primary" />Upcoming Appointments</CardTitle>
            <CardDescription>A quick look at your next few sessions.</CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingAppointments.length > 0 ? (
              <ul className="space-y-3">
                {upcomingAppointments.slice(0,3).map(appt => (
                  <li key={appt.id} className="p-3 border rounded-md bg-muted/30 hover:bg-muted/50">
                    <p className="font-semibold">{appt.patientName}</p>
                    <p className="text-sm text-muted-foreground">{appt.time} - {appt.type}</p>
                     <Button variant="link" size="sm" className="p-0 h-auto mt-1" disabled>View Details</Button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground text-center py-4">No upcoming appointments.</p>
            )}
             <Button variant="outline" className="w-full mt-4" disabled>
                View All Appointments (Placeholder)
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Placeholder for other sections like Patient Communication, Resources */}
      <div className="grid md:grid-cols-2 gap-6">
         <Card className="hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><MessageSquare className="h-6 w-6 text-primary" />Patient Communication (Placeholder)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-center py-4">Secure messaging with patients will be available here.</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><BarChartHorizontalBig className="h-6 w-6 text-primary" />Analytics (Placeholder)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-center py-4">Your session statistics and patient progress insights will appear here.</p>
          </CardContent>
        </Card>
      </div>
      <div className="text-center text-sm text-muted-foreground mt-8">
        <p>This is a prototype Doctor Dashboard. Full functionality and data integration will be implemented in future versions.</p>
      </div>
    </div>
  );
}

    
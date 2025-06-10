
"use client";

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, UserCheck, ShieldCheck, BarChartBig, Settings, AlertTriangle, Activity } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

// Mock data - replace with actual data fetching
const platformStats = {
  totalUsers: 1250,
  activeDoctors: 45,
  pendingVerifications: 3,
  sessionsToday: 78,
};

const recentUsers = [
  { id: "user1", name: "Alice Wonderland", email: "alice@example.com", role: "user", joined: "2024-07-15" },
  { id: "user2", name: "Dr. Bob The Builder", email: "bob.doc@example.com", role: "doctor", status: "Verified", joined: "2024-07-14" },
  { id: "user3", name: "Charlie Brown", email: "charlie@example.com", role: "user", joined: "2024-07-13" },
  { id: "user4", name: "Dr. Diana Prince", email: "diana.doc@example.com", role: "doctor", status: "Pending", joined: "2024-07-12" },
];

export default function AdminPanelPage() {
  const { toast } = useToast();

  const handleApproveDoctor = (doctorId: string, doctorName: string) => {
    toast({
      title: "Doctor Approved (Simulated)",
      description: `${doctorName} has been marked as verified.`,
    });
    // In a real app, update Firestore/backend here
    console.log(`Approved doctor ${doctorId}`);
  };
  
  const handleRejectDoctor = (doctorId: string, doctorName: string) => {
     toast({
      title: "Doctor Rejected (Simulated)",
      description: `${doctorName}'s verification has been rejected.`,
      variant: "destructive"
    });
    // In a real app, update Firestore/backend here
    console.log(`Rejected doctor ${doctorId}`);
  }

  return (
    <div className="space-y-8">
      <Card className="shadow-lg border-none bg-gradient-to-r from-primary/10 to-accent/10">
        <CardHeader>
          <CardTitle className="text-3xl font-headline">Admin Panel</CardTitle>
          <CardDescription className="text-lg text-muted-foreground mt-1">
            Oversee and manage the MINDSTRIDE platform.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Key Metrics Section */}
      <section>
        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2"><BarChartBig className="text-primary h-6 w-6"/>Platform Overview</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{platformStats.totalUsers}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Doctors</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{platformStats.activeDoctors}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Verifications</CardTitle>
              <ShieldCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-500">{platformStats.pendingVerifications}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sessions Today</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{platformStats.sessionsToday}</div></CardContent>
          </Card>
        </div>
      </section>

      {/* User Management Section */}
      <section>
        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2"><Users className="text-primary h-6 w-6"/>User Management (Recent Registrations)</h2>
        <Card>
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status/Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentUsers.map(user => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell><Badge variant={user.role === 'doctor' ? 'secondary' : 'outline'} className="capitalize">{user.role}</Badge></TableCell>
                    <TableCell>
                      {user.role === 'doctor' ? (
                        <Badge variant={user.status === 'Verified' ? 'default' : user.status === 'Pending' ? 'destructive' : 'outline'}>
                          {user.status}
                        </Badge>
                      ) : `Joined: ${user.joined}`}
                    </TableCell>
                    <TableCell className="text-right">
                      {user.role === 'doctor' && user.status === 'Pending' && (
                        <div className="flex gap-2 justify-end">
                          <Button size="sm" variant="default" onClick={() => handleApproveDoctor(user.id, user.name)}>Approve</Button>
                          <Button size="sm" variant="destructive" onClick={() => handleRejectDoctor(user.id, user.name)}>Reject</Button>
                        </div>
                      )}
                       {user.role === 'doctor' && user.status !== 'Pending' && (
                           <Button size="sm" variant="ghost" disabled>View</Button>
                       )}
                       {user.role === 'user' && (
                           <Button size="sm" variant="ghost" disabled>View Profile</Button>
                       )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
          <CardFooter>
            <Button variant="outline" disabled>View All Users (Placeholder)</Button>
          </CardFooter>
        </Card>
      </section>

      {/* Other Admin Sections Placeholder */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Settings className="text-primary h-6 w-6"/>Platform Settings (Placeholder)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-center py-4">Manage subscription plans, content categories, etc.</p>
            <Button className="w-full" variant="outline" disabled>Go to Settings</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><AlertTriangle className="text-primary h-6 w-6"/>System Health & Logs (Placeholder)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-center py-4">View error logs, system status, and perform maintenance tasks.</p>
            <Button className="w-full" variant="outline" disabled>View Logs</Button>
          </CardContent>
        </Card>
      </div>
       <div className="text-center text-sm text-muted-foreground mt-8">
        <p>This is a prototype Admin Panel. Full functionality and data integration will be implemented in future versions.</p>
      </div>
    </div>
  );
}

    
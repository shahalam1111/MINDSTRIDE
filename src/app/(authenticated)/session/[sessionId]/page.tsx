
"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Video, Mic, MicOff, VideoOff, PhoneOff, MessageSquare, Users, ScreenShare, AlertTriangle } from 'lucide-react';
import Image from 'next/image';

// Simulate fetching session details if needed, or pass via state/query params for prototype
interface SessionDetails {
  sessionId: string;
  therapistName?: string; // Can be fetched or passed
  // other relevant details
}

export default function SimulatedSessionPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;

  const [sessionDetails, setSessionDetails] = useState<SessionDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);

  useEffect(() => {
    if (sessionId) {
      // Simulate fetching session details, e.g., from localStorage or a mock API
      const mockSession = {
        sessionId: sessionId,
        therapistName: "Dr. Emily Carter", // Placeholder
      };
      setSessionDetails(mockSession);
      setIsLoading(false);
    }
  }, [sessionId]);

  const handleEndSession = () => {
    // Simulate ending session
    alert("Session Ended (Simulated). Returning to dashboard.");
    router.push('/dashboard');
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen bg-gray-900 text-white">Loading session...</div>;
  }

  if (!sessionDetails) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white p-4">
        <AlertTriangle className="h-12 w-12 text-yellow-400 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Session Not Found</h1>
        <p className="text-gray-400 mb-6">We couldn't find details for this session.</p>
        <Button asChild variant="outline">
          <Link href="/dashboard">Back to Dashboard</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="p-4 bg-gray-800/50 flex justify-between items-center shadow-md">
        <h1 className="text-xl font-semibold">Video Session with {sessionDetails.therapistName}</h1>
        <div className="text-sm text-gray-400">Session ID: {sessionId.substring(0,15)}...</div>
      </header>

      {/* Main Video Area */}
      <main className="flex-grow flex flex-col md:flex-row overflow-hidden">
        {/* Participant Video (Placeholder) */}
        <div className="flex-grow bg-gray-800 flex items-center justify-center relative overflow-hidden">
          <Image 
            src="https://placehold.co/800x600.png?text=Therapist's+Video" 
            alt="Therapist Video Feed Placeholder" 
            layout="fill"
            objectFit="cover"
            className="opacity-80"
            data-ai-hint="video call screen"
          />
          <div className="absolute bottom-4 left-4 bg-black/50 p-2 rounded text-sm">Dr. {sessionDetails.therapistName}</div>
        </div>

        {/* Self Video (Placeholder) & Side Panel */}
        <div className="w-full md:w-1/4 bg-gray-850 p-4 flex flex-col space-y-4 border-l border-gray-700/50">
           <div className="aspect-video bg-gray-700 rounded-lg flex items-center justify-center relative">
             {isVideoOn ? (
                <Image 
                    src="https://placehold.co/300x200.png?text=Your+Video" 
                    alt="Your Video Feed Placeholder" 
                    layout="fill"
                    objectFit="cover"
                    className="rounded-lg"
                    data-ai-hint="video call screen"
                />
             ) : (
                <VideoOff className="h-16 w-16 text-gray-500" />
             )}
             <div className="absolute bottom-2 left-2 bg-black/50 p-1 rounded text-xs">You</div>
           </div>
           
           <div className="flex-grow bg-gray-800/70 p-3 rounded-lg">
                <h3 className="text-md font-semibold mb-2 border-b border-gray-700 pb-1">Session Tools</h3>
                <Button variant="ghost" className="w-full justify-start text-gray-300 hover:bg-gray-700/50 hover:text-white">
                    <MessageSquare className="mr-2 h-5 w-5"/> Chat (Placeholder)
                </Button>
                 <Button variant="ghost" className="w-full justify-start text-gray-300 hover:bg-gray-700/50 hover:text-white">
                    <Users className="mr-2 h-5 w-5"/> Participants (Placeholder)
                </Button>
                 <Button variant="ghost" className="w-full justify-start text-gray-300 hover:bg-gray-700/50 hover:text-white">
                    <ScreenShare className="mr-2 h-5 w-5"/> Share Screen (Placeholder)
                </Button>
           </div>
           <p className="text-xs text-gray-500 text-center">This is a simulated video call interface.</p>
        </div>
      </main>

      {/* Controls Footer */}
      <footer className="p-4 bg-gray-800/80 flex justify-center items-center space-x-4 shadow-inner">
        <Button 
            variant={isMicOn ? "secondary" : "outline"} 
            size="lg" 
            onClick={() => setIsMicOn(!isMicOn)}
            className="bg-gray-700 hover:bg-gray-600 border-gray-600"
        >
          {isMicOn ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
          <span className="sr-only">{isMicOn ? "Mute Mic" : "Unmute Mic"}</span>
        </Button>
        <Button 
            variant={isVideoOn ? "secondary" : "outline"} 
            size="lg" 
            onClick={() => setIsVideoOn(!isVideoOn)}
            className="bg-gray-700 hover:bg-gray-600 border-gray-600"
        >
          {isVideoOn ? <Video className="h-6 w-6" /> : <VideoOff className="h-6 w-6" />}
           <span className="sr-only">{isVideoOn ? "Stop Video" : "Start Video"}</span>
        </Button>
        <Button variant="destructive" size="lg" onClick={handleEndSession}>
          <PhoneOff className="h-6 w-6 mr-2" /> End Session
        </Button>
      </footer>
    </div>
  );
}

    
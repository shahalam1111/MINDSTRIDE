
"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { AgeVerificationDialog } from '@/components/app/age-verification-dialog';
import { Zap, Users, ShieldCheck, Brain } from 'lucide-react';

export default function LandingPage() {
  const [isAgeDialogOpen, setIsAgeDialogOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen">
      <header className="py-4 px-6 md:px-12 shadow-sm">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <Brain className="h-8 w-8 text-primary" />
            <span className="text-2xl font-headline font-semibold text-primary">Wellspring</span>
          </Link>
          <nav className="hidden md:flex gap-4">
             <Button variant="ghost" asChild>
               <Link href="#features">Features</Link>
             </Button>
             <Button variant="ghost" asChild>
               <Link href="#about">About</Link>
             </Button>
          </nav>
          <Button variant="outline" asChild>
            <Link href="/sign-in">Sign In</Link>
          </Button>
        </div>
      </header>

      <main className="flex-grow">
        <section className="relative py-20 md:py-32 bg-gradient-to-br from-background to-blue-100">
          <div className="absolute inset-0 opacity-30">
            <Image
              src="https://placehold.co/1920x1080.png" // Replace with actual mental health imagery
              alt="Abstract calming background"
              layout="fill"
              objectFit="cover"
              quality={75}
              data-ai-hint="calm abstract"
            />
          </div>
          <div className="container mx-auto px-6 text-center relative z-10">
            <h1 className="text-4xl md:text-6xl font-headline font-bold text-foreground mb-6">
              Your Mental Wellness Journey Starts Here
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              Wellspring provides AI-powered assistance, professional consultations, peer support, and personalized wellness tools in a secure, user-friendly environment.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <Button
                size="lg"
                onClick={() => setIsAgeDialogOpen(true)}
                className="shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                Get Started
              </Button>
              <Button
                variant="secondary"
                size="lg"
                asChild
                className="shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <Link href="/sign-in">Sign In</Link>
              </Button>
            </div>
          </div>
        </section>

        <section id="features" className="py-16 md:py-24 bg-card">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl md:text-4xl font-headline font-semibold text-center text-foreground mb-12">
              Features Designed For You
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="flex flex-col items-center text-center p-6 bg-background rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                <Zap className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">AI Chat Assistant</h3>
                <p className="text-muted-foreground">Personalized support and coping strategies, available 24/7.</p>
              </div>
              <div className="flex flex-col items-center text-center p-6 bg-background rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                <Image src="https://placehold.co/100x100.png" alt="Video Consultations" width={80} height={80} className="mb-4 rounded-full" data-ai-hint="video call" />
                <h3 className="text-xl font-semibold text-foreground mb-2">Video Consultations</h3>
                <p className="text-muted-foreground">Connect with licensed therapists securely (Premium).</p>
              </div>
              <div className="flex flex-col items-center text-center p-6 bg-background rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                <Users className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">Community Forum</h3>
                <p className="text-muted-foreground">Share experiences and find support in an anonymized space.</p>
              </div>
              <div className="flex flex-col items-center text-center p-6 bg-background rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                <ShieldCheck className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">Emergency Support</h3>
                <p className="text-muted-foreground">Quick access to crisis hotlines and safety planning tools.</p>
              </div>
            </div>
          </div>
        </section>

        <section id="about" className="py-16 md:py-24 bg-background">
          <div className="container mx-auto px-6 flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/2">
              <Image
                src="https://placehold.co/600x400.png"
                alt="Person meditating peacefully"
                width={600}
                height={400}
                className="rounded-lg shadow-xl"
                data-ai-hint="peaceful meditation"
              />
            </div>
            <div className="md:w-1/2">
              <h2 className="text-3xl md:text-4xl font-headline font-semibold text-foreground mb-6">
                About Wellspring
              </h2>
              <p className="text-lg text-muted-foreground mb-4">
                At Wellspring, we believe that everyone deserves access to mental health support. Our platform is built on the principles of compassion, confidentiality, and personalized care.
              </p>
              <p className="text-lg text-muted-foreground">
                We combine cutting-edge AI technology with human-centered design to create a supportive environment where you can explore your mental wellness, develop coping strategies, and connect with others on similar journeys.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-8 bg-slate-800 text-slate-300">
        <div className="container mx-auto px-6 text-center">
          <div className="flex justify-center gap-6 mb-4">
            <Link href="/privacy-policy" className="hover:text-primary">Privacy Policy</Link>
            <Link href="/terms-of-service" className="hover:text-primary">Terms of Service</Link>
            <Link href="/contact" className="hover:text-primary">Contact Us</Link>
          </div>
          <p>&copy; {new Date().getFullYear()} Wellspring. All rights reserved.</p>
          <p className="text-sm mt-2">
            Disclaimer: Wellspring is a mental health support platform and does not provide medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.
          </p>
        </div>
      </footer>

      <AgeVerificationDialog
        open={isAgeDialogOpen}
        onOpenChange={setIsAgeDialogOpen}
      />
    </div>
  );
}


"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { AgeVerificationDialog } from '@/components/app/age-verification-dialog';
import { Zap, Users, ShieldCheck, Menu, Video, HelpCircle, BookOpen, Youtube, ExternalLink, PlayCircle } from 'lucide-react';
import { MindstrideLogoIcon } from '@/components/icons/mindstride-logo-icon';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Card, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";


interface BlogItem {
  id: string;
  title: string;
  thumbnailUrl: string;
  blogUrl: string;
}

const latestBlogs: BlogItem[] = [
  {
    id: 'blog-1',
    title: "Mindfulness Meditation",
    thumbnailUrl: "https://www.apa.org/images/tile-stress-mindfulness-meditation_tcm7-264379.jpg",
    blogUrl: "https://www.apa.org/topics/mindfulness/meditation"
  },
  {
    id: 'blog-2',
    title: "7 Great Benefits of Mindfulness in Positive Psychology",
    thumbnailUrl: "https://neurologyoffice.com/wp-content/uploads/Mindfulness_Neurologist.png",
    blogUrl: "https://positivepsychology.com/mindfulness-positive-psychology-3-great-insights/"
  },
  {
    id: 'blog-3',
    title: "12 Tips for Maintaining a Healthy Lifestyle",
    thumbnailUrl: "https://static.wixstatic.com/media/96c1c0_a9d1adb474ed413db862ac5d27462c5f~mv2.png/v1/fill/w_568,h_320,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/96c1c0_a9d1adb474ed413db862ac5d27462c5f~mv2.png",
    blogUrl: "https://www.healthline.com/health/how-to-maintain-a-healthy-lifestyle"
  },
  {
    id: 'blog-4',
    title: "How To Be Successful: Essential Tips for Success in Life",
    thumbnailUrl: "https://assets.speareducation.com/userfiles/Imtiaz/success.jpg",
    blogUrl: "https://www.shopify.com/in/blog/how-to-become-successful"
  },
  {
    id: 'blog-5',
    title: "10 Tips for Dealing with Someone's Narcissistic Personality Traits",
    thumbnailUrl: "https://media.post.rvohealth.io/wp-content/uploads/2024/02/annoyed-stressed-couple-sitting-on-couch-facebook.jpg",
    blogUrl: "https://www.healthline.com/health/how-to-deal-with-a-narcissist"
  }
];

interface VideoItem {
  id: string;
  title: string;
  thumbnailUrl: string;
  videoUrl: string;
  dataAiHint?: string;
}

const featuredVideos: VideoItem[] = [
  {
    id: 'yt-video-1',
    title: "How to cope with anxiety | Olivia Remes | TEDxUHasselt",
    thumbnailUrl: "https://i.ytimg.com/vi/WWloIAQpMcQ/maxresdefault.jpg",
    videoUrl: "https://www.youtube.com/watch?v=WWloIAQpMcQ"
  },
  {
    id: 'yt-video-2',
    title: "What is depression? - Helen M. Farrell",
    thumbnailUrl: "https://i.ytimg.com/vi/z-IR48Mb3W0/maxresdefault.jpg",
    videoUrl: "https://www.youtube.com/watch?v=z-IR48Mb3W0"
  },
  {
    id: 'yt-video-3',
    title: "How to make stress your friend | Kelly McGonigal",
    thumbnailUrl: "https://i.ytimg.com/vi/RcGyVTAoXEU/maxresdefault.jpg",
    videoUrl: "https://www.youtube.com/watch?v=RcGyVTAoXEU"
  },
  {
    id: 'yt-video-4',
    title: "Sleep is your superpower | Matt Walker",
    thumbnailUrl: "https://i.ytimg.com/vi/5MuIMqhT8DM/maxresdefault.jpg",
    videoUrl: "https://www.youtube.com/watch?v=5MuIMqhT8DM"
  },
  {
    id: 'yt-video-5',
    title: "Kristin Neff: The Three Components of Self-Compassion",
    thumbnailUrl: "https://i.ytimg.com/vi/11U0h0DPu7k/maxresdefault.jpg",
    videoUrl: "https://www.youtube.com/watch?v=11U0h0DPu7k"
  }
];


export default function LandingPage() {
  const [isAgeDialogOpen, setIsAgeDialogOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2">
            <MindstrideLogoIcon className="h-8 w-8 text-primary" />
            <span className="text-2xl font-headline font-semibold text-primary">MINDSTRIDE</span>
          </Link>
          <nav className="hidden md:flex gap-2">
             <Button variant="ghost" asChild>
               <Link href="#latest-blogs">Mindful Reads</Link>
             </Button>
             <Button variant="ghost" asChild>
               <Link href="#featured-videos">Voices That Matter</Link>
             </Button>
             <Button variant="ghost" asChild>
               <Link href="#features">Features</Link>
             </Button>
             <Button variant="ghost" asChild>
               <Link href="#about">About</Link>
             </Button>
             <Button variant="ghost" asChild>
                <Link href="/faq">FAQ</Link>
             </Button>
             <Button variant="ghost" asChild>
                <Link href="/contact">Contact</Link>
             </Button>
          </nav>
          <div className="hidden md:flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link href="/sign-in">Sign In</Link>
            </Button>
            <Button onClick={() => setIsAgeDialogOpen(true)}>Get Started</Button>
          </div>
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="outline" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[360px] bg-background">
              <nav className="flex flex-col gap-4 mt-8">
                <Link href="#latest-blogs" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium hover:text-primary">Mindful Reads</Link>
                <Link href="#featured-videos" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium hover:text-primary">Voices That Matter</Link>
                <Link href="#features" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium hover:text-primary">Features</Link>
                <Link href="#about" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium hover:text-primary">About</Link>
                <Link href="/faq" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium hover:text-primary">FAQ</Link>
                <Link href="/contact" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium hover:text-primary">Contact</Link>
                <hr className="my-2"/>
                <Button variant="outline" asChild onClick={() => setIsMobileMenuOpen(false)}>
                  <Link href="/sign-in">Sign In</Link>
                </Button>
                <Button onClick={() => { setIsAgeDialogOpen(true); setIsMobileMenuOpen(false);}} className="w-full">Get Started</Button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      <main className="flex-grow">
        <section className="relative min-h-[calc(100vh-4rem)]">
          <div className="absolute inset-0">
            <Image
              src="https://sdmntprcentralus.oaiusercontent.com/files/00000000-1548-61f5-b6c9-b2732460799d/raw?se=2025-06-10T05%3A42%3A13Z&sp=r&sv=2024-08-04&sr=b&scid=8ea7873f-031b-5213-bb88-b939c62ce50b&skoid=04233560-0ad7-493e-8bf0-1347c317d021&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2025-06-09T22%3A15%3A05Z&ske=2025-06-10T22%3A15%3A05Z&sks=b&skv=2024-08-04&sig=%2BzKNlIz%2BzRLWgzg66aLBsTIpM4stU4o3HvddclAk8jg%3D"
              alt="Abstract calming background"
              fill
              quality={75}
              priority
              className="object-cover"
              data-ai-hint="calming abstract"
            />
          </div>
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative h-full flex flex-col justify-end items-center px-4 md:px-6 pb-16 sm:pb-20 text-center">
            <p className="text-md sm:text-lg text-white font-semibold mb-6 sm:mb-8 max-w-3xl mx-auto [text-shadow:_0_1px_2px_rgb(0_0_0_/_0.4)]">
              MINDSTRIDE provides AI-powered assistance, community support, and personalized wellness tools in a secure, user-friendly environment.
            </p>
          </div>
        </section>

        <section id="features" className="py-16 md:py-24 bg-card">
          <div className="container mx-auto px-4 md:px-6">
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
                <Video className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">Video Consultations</h3>
                <p className="text-muted-foreground">Connect with licensed therapists securely (Premium Feature).</p>
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
          <div className="container mx-auto px-4 md:px-6 flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/2">
              <Image
                src="https://sdmntprsouthcentralus.oaiusercontent.com/files/00000000-a694-61f7-be9c-25ef1129634e/raw?se=2025-06-10T05%3A26%3A13Z&sp=r&sv=2024-08-04&sr=b&scid=ecc5913d-eb45-54a9-8318-7730b49f6c56&skoid=04233560-0ad7-493e-8bf0-1347c317d021&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2025-06-09T10%3A38%3A45Z&ske=2025-06-10T10%3A38%3A45Z&sks=b&skv=2024-08-04&sig=1XlAvAWm%2BadF%2B4Y/ijThdUTFkouG%2Bn6p0ZPfXb6AeP0%3D"
                alt="Hopeful illustration for mental wellness journey"
                width={600}
                height={400}
                className="rounded-lg shadow-xl object-cover"
                data-ai-hint="wellness journey hopeful progress"
              />
            </div>
            <div className="md:w-1/2">
              <h2 className="text-3xl md:text-4xl font-headline font-semibold text-foreground mb-6 flex items-center justify-center md:justify-start gap-2">
                <MindstrideLogoIcon className="h-8 w-8 text-primary" />
                About MINDSTRIDE
              </h2>
              <p className="text-lg text-muted-foreground mb-4">
                At MINDSTRIDE, we believe that everyone deserves access to mental health support. Our platform is built on the principles of compassion, confidentiality, and personalized care.
              </p>
              <p className="text-lg text-muted-foreground">
                We combine cutting-edge AI technology with human-centered design to create a supportive environment where you can explore your mental wellness, develop coping strategies, and connect with others on similar journeys.
              </p>
            </div>
          </div>
        </section>

        <section id="content-showcase" className="py-16 md:py-24 bg-card">
          <div className="container mx-auto px-4 md:px-6">
            {/* Latest Blogs Subsection */}
            <div id="latest-blogs">
              <h2 className="text-3xl md:text-4xl font-headline font-semibold text-center text-foreground mb-12 flex items-center justify-center gap-3">
                <BookOpen className="h-8 w-8 text-primary" />
                Mindful Reads
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {latestBlogs.map((blog) => (
                  <Card key={blog.id} className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col bg-background">
                    <Link href={blog.blogUrl} target="_blank" rel="noopener noreferrer" className="block group">
                      <div className="relative w-full aspect-video">
                        <Image
                          src={blog.thumbnailUrl}
                          alt={blog.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    </Link>
                    <CardHeader className="flex-grow">
                      <CardTitle className="text-lg line-clamp-2 h-14">
                        <Link href={blog.blogUrl} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                          {blog.title}
                        </Link>
                      </CardTitle>
                    </CardHeader>
                    <CardFooter>
                      <Button asChild variant="outline" className="w-full">
                        <Link href={blog.blogUrl} target="_blank" rel="noopener noreferrer">
                          Read Full Blog <ExternalLink className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>

            {/* Featured Videos Subsection */}
            <div id="featured-videos" className="mt-16 md:mt-24">
              <h2 className="text-3xl md:text-4xl font-headline font-semibold text-center text-foreground mb-12 flex items-center justify-center gap-3">
                <Youtube className="h-8 w-8 text-primary" />
                Voices That Matter
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {featuredVideos.map((video) => (
                  <Card key={video.id} className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col bg-background">
                     <Link href={video.videoUrl} target="_blank" rel="noopener noreferrer" className="block group">
                      <div className="relative w-full aspect-video">
                        <Image
                          src={video.thumbnailUrl}
                          alt={video.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                         <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <PlayCircle className="h-16 w-16 text-white/80" />
                        </div>
                      </div>
                    </Link>
                    <CardHeader className="flex-grow">
                      <CardTitle className="text-lg line-clamp-2 h-14">
                        <Link href={video.videoUrl} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                          {video.title}
                        </Link>
                      </CardTitle>
                    </CardHeader>
                    <CardFooter>
                      <Button asChild className="w-full">
                        <Link href={video.videoUrl} target="_blank" rel="noopener noreferrer">
                          Watch Video <PlayCircle className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-8 bg-slate-900 text-slate-300 border-t border-slate-700">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mb-4">
            <Link href="/privacy-policy" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <Link href="/terms-of-service" className="hover:text-primary transition-colors">Terms of Service</Link>
            <Link href="/faq" className="hover:text-primary transition-colors">FAQ</Link>
            <Link href="/contact" className="hover:text-primary transition-colors">Contact Us</Link>
          </div>
          <p>&copy; {new Date().getFullYear()} MINDSTRIDE. All rights reserved.</p>
          <p className="text-sm mt-2 text-slate-400">
            Disclaimer: MINDSTRIDE is a mental health support platform and does not provide medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition. If you are in a crisis, please contact emergency services immediately.
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

    
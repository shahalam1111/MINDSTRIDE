
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, HelpCircle } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { MindstrideLogoIcon } from '@/components/icons/mindstride-logo-icon';

const faqData = [
  {
    question: "What is MINDSTRIDE?",
    answer: "MINDSTRIDE is a platform designed to support your mental wellness journey. We offer tools like an AI Chat Assistant for immediate support, a directory to connect with therapists for video consultations (premium feature), wellness tracking, and a supportive community forum. Our goal is to make mental health resources more accessible and user-friendly."
  },
  {
    question: "Is my personal information and data kept private?",
    answer: "Yes, protecting your privacy is our top priority. We use security measures to safeguard your data. For detailed information, please review our <a href='/privacy-policy' class='text-primary underline hover:text-primary/80'>Privacy Policy</a>. Any data shared with therapists is with your explicit consent."
  },
  {
    question: "How does the AI Chat Assistant work?",
    answer: "Our AI Chat Assistant is here to offer immediate support, coping strategies, and a listening ear 24/7. You can talk to it about how you're feeling, and it can provide insights based on psychological principles. However, please remember it's not a substitute for professional therapy."
  },
  {
    question: "How do I find and book a video consultation with a therapist? (Premium Feature)",
    answer: "If you have a premium subscription, you can browse our therapist directory from your dashboard. You can filter therapists by specialization. Once you find a therapist, you can view their profile, check their availability, and book a session directly."
  },
  {
    question: "What if I need to reschedule or cancel a booked consultation?",
    answer: "To manage your bookings, please navigate to the 'Consultations' section and find your scheduled appointment. Options to reschedule or cancel should be available there, subject to the therapist's specific cancellation policy, which is typically outlined during the booking process or on their profile. We recommend checking these policies carefully."
  },
  {
    question: "What are the benefits of a premium subscription?",
    answer: "Our premium subscription unlocks features like video consultations with licensed therapists, advanced analytics on your wellness journey, and potentially other exclusive content or tools as MINDSTRIDE grows. Details can be found on our (upcoming) subscription page."
  },
  {
    question: "Who do I contact if I'm experiencing a crisis?",
    answer: "If you are in a crisis or immediate danger, please call 911 or your local emergency number. MINDSTRIDE also provides an 'Emergency & Crisis Support' section (accessible via a prominent button on your dashboard) with links to hotlines and crisis resources. MINDSTRIDE itself is not a crisis intervention service."
  },
  {
    question: "How does the community forum work?",
    answer: "Our community forum is a space for users to connect, share experiences, and find support from peers in an anonymized or named setting. You can browse topics, read posts, create your own posts, comment, and engage with others. Please always follow our community guidelines for a respectful environment."
  },
  {
    question: "I'm having a technical issue or have a question not covered here. How can I get support?",
    answer: "We're here to help! Please visit our <a href='/contact' class='text-primary underline hover:text-primary/80'>Contact Us</a> page to send us a message, and our support team will get back to you as soon as possible."
  },
  {
    question: "Can I track my mood and progress on MINDSTRIDE?",
    answer: "Yes! We offer features like mood check-ins and a 'My Progress' dashboard where you can see your mood timeline, insights from your intake, and (in the future) track wellness goals and habits to visually monitor your journey."
  }
];

export default function FaqPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-blue-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <Button variant="outline" asChild className="group">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" /> Back to Home
            </Link>
          </Button>
           <Link href="/" className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors">
            <MindstrideLogoIcon className="h-7 w-7" />
            <span className="text-xl font-headline font-semibold">MINDSTRIDE</span>
          </Link>
        </div>
        
        <div className="bg-card p-6 sm:p-8 rounded-xl shadow-xl">
          <h1 className="text-3xl sm:text-4xl font-headline font-bold text-foreground mb-2 text-center flex items-center justify-center gap-2">
            <HelpCircle className="h-8 w-8 text-primary" />
            Frequently Asked Questions
          </h1>
          <p className="text-muted-foreground text-center mb-8">
            Find answers to common questions about MINDSTRIDE.
          </p>

          <Accordion type="single" collapsible className="w-full">
            {faqData.map((item, index) => (
              <AccordionItem value={`item-${index}`} key={index} className="border-b border-border last:border-b-0">
                <AccordionTrigger className="text-left hover:no-underline py-4 text-base sm:text-lg font-medium text-foreground hover:text-primary transition-colors">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="pt-1 pb-4 text-sm sm:text-base text-muted-foreground leading-relaxed">
                  <p dangerouslySetInnerHTML={{ __html: item.answer }} />
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
         <p className="text-center text-muted-foreground mt-10 text-sm">
            Can&apos;t find what you&apos;re looking for? <Link href="/contact" className="text-primary underline hover:text-primary/80">Contact our support team</Link>.
          </p>
      </div>
    </div>
  );
}

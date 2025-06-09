
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <Button variant="outline" asChild className="mb-8">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
          </Link>
        </Button>
        <h1 className="text-4xl font-headline font-bold text-foreground mb-8">Privacy Policy</h1>
        <div className="prose prose-lg text-foreground max-w-none">
          <p><em>Last Updated: {new Date().toLocaleDateString()}</em></p>

          <p>Welcome to Wellspring ("we," "our," or "us"). We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mental health support platform (the "Service"). Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the service.</p>

          <h2 className="font-headline">1. Information We Collect</h2>
          <p>We may collect information about you in a variety of ways. The information we may collect via the Service includes:</p>
          <ul>
            <li><strong>Personal Data:</strong> Personally identifiable information, such as your name, email address, age, gender, location, and other information you voluntarily give to us when you register with the Service or when you choose to participate in various activities related to the Service, such as online chat and message boards.</li>
            <li><strong>Health Information:</strong> Information related to your mental health, including diagnosis history, current treatment, lifestyle habits, mood, emotions, and goals, which you provide through intake forms, check-ins, or interactions with the AI assistant.</li>
            <li><strong>Derivative Data:</strong> Information our servers automatically collect when you access the Service, such as your IP address, your browser type, your operating system, your access times, and the pages you have viewed directly before and after accessing the Service.</li>
            <li><strong>Financial Data:</strong> Financial information, such as data related to your payment method (e.g. valid credit card number, card brand, expiration date) that we may collect when you purchase, order, return, exchange, or request information about our services from the Service. We store only very limited, if any, financial information that we collect. Otherwise, all financial information is stored by our payment processor (e.g., Stripe, PayPal).</li>
          </ul>

          <h2 className="font-headline">2. Use of Your Information</h2>
          <p>Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Service to:</p>
          <ul>
            <li>Create and manage your account.</li>
            <li>Personalize your experience with the AI Chatbot Assistant and other features.</li>
            <li>Provide you with targeted recommendations and resources.</li>
            <li>Process payments and refunds.</li>
            <li>Facilitate communication between you and therapists (for premium users).</li>
            <li>Monitor and analyze usage and trends to improve your experience with the Service.</li>
            <li>Notify you of updates to the Service.</li>
            <li>Offer new products, services, and/or recommendations to you.</li>
            <li>Comply with legal obligations.</li>
          </ul>
          
          <h2 className="font-headline">3. Disclosure of Your Information</h2>
          <p>We will not share your health information without your explicit consent, except as required by law or to protect your safety or the safety of others (e.g., in a crisis situation). Other information may be disclosed as described below or as specifically described in this Privacy Policy.</p>

          <h2 className="font-headline">4. Security of Your Information</h2>
          <p>We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.</p>

          <h2 className="font-headline">5. Policy for Children</h2>
          <p>We do not knowingly solicit information from or market to children under the age of 18. If you become aware of any data we have collected from children under age 18, please contact us using the contact information provided below.</p>

          <h2 className="font-headline">6. Changes to This Privacy Policy</h2>
          <p>We may update this Privacy Policy from time to time in order to reflect, for example, changes to our practices or for other operational, legal, or regulatory reasons. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.</p>

          <h2 className="font-headline">7. Contact Us</h2>
          <p>If you have questions or comments about this Privacy Policy, please contact us at: [Placeholder Contact Email/Link]</p>
        </div>
      </div>
    </div>
  );
}

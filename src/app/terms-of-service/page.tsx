
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <Button variant="outline" asChild className="mb-8">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
          </Link>
        </Button>
        <h1 className="text-4xl font-headline font-bold text-foreground mb-8">Terms of Service</h1>
        <div className="prose prose-lg text-foreground max-w-none">
          <p><em>Last Updated: {new Date().toLocaleDateString()}</em></p>

          <p>Please read these Terms of Service ("Terms", "Terms of Service") carefully before using the Wellspring mental health support platform (the "Service") operated by Wellspring ("us", "we", or "our").</p>

          <p>Your access to and use of the Service is conditioned on your acceptance of and compliance with these Terms. These Terms apply to all visitors, users, and others who access or use the Service.</p>

          <p><strong>By accessing or using the Service you agree to be bound by these Terms. If you disagree with any part of the terms then you may not access the Service.</strong></p>

          <h2 className="font-headline">1. Eligibility</h2>
          <p>You must be at least 18 years of age to use the Service. By agreeing to these Terms, you represent and warrant to us that you are at least 18 years of age.</p>

          <h2 className="font-headline">2. Accounts</h2>
          <p>When you create an account with us, you must provide us information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.</p>
          <p>You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password, whether your password is with our Service or a third-party service.</p>
          <p>You agree not to disclose your password to any third party. You must notify us immediately upon becoming aware of any breach of security or unauthorized use of your account.</p>

          <h2 className="font-headline">3. Service Content</h2>
          <p>The Service and its original content (excluding content provided by users), features, and functionality are and will remain the exclusive property of Wellspring and its licensors.</p>
          <p>The Service is for informational and support purposes only. It does not provide medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition. Never disregard professional medical advice or delay in seeking it because of something you have read on the Service.</p>
          
          <h2 className="font-headline">4. User Conduct</h2>
          <p>You agree not to use the Service:</p>
          <ul>
            <li>In any way that violates any applicable national or international law or regulation.</li>
            <li>For the purpose of exploiting, harming, or attempting to exploit or harm minors in any way by exposing them to inappropriate content or otherwise.</li>
            <li>To transmit, or procure the sending of, any advertising or promotional material, including any "junk mail", "chain letter," "spam," or any other similar solicitation.</li>
            <li>To impersonate or attempt to impersonate Wellspring, a Wellspring employee, another user, or any other person or entity.</li>
          </ul>

          <h2 className="font-headline">5. Community Forum</h2>
          <p>If you participate in the community forum, you are responsible for the content you post. You agree not to post content that is unlawful, harmful, threatening, abusive, harassing, defamatory, vulgar, obscene, libelous, invasive of another's privacy, hateful, or racially, ethnically, or otherwise objectionable.</p>
          <p>We reserve the right, but are not obligated, to remove or edit such content, but do not regularly review posted content.</p>

          <h2 className="font-headline">6. Termination</h2>
          <p>We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.</p>
          <p>Upon termination, your right to use the Service will immediately cease. If you wish to terminate your account, you may simply discontinue using the Service.</p>

          <h2 className="font-headline">7. Disclaimer of Warranties; Limitation of Liability</h2>
          <p>The Service is provided on an "AS IS" and "AS AVAILABLE" basis. We disclaim all warranties of any kind, whether express or implied, including, but not limited to, implied warranties of merchantability, fitness for a particular purpose, and non-infringement.</p>
          <p>In no event shall Wellspring, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.</p>

          <h2 className="font-headline">8. Governing Law</h2>
          <p>These Terms shall be governed and construed in accordance with the laws of [Your Jurisdiction], without regard to its conflict of law provisions.</p>

          <h2 className="font-headline">9. Changes</h2>
          <p>We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material we will try to provide at least 30 days notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.</p>

          <h2 className="font-headline">10. Contact Us</h2>
          <p>If you have any questions about these Terms, please contact us at: [Placeholder Contact Email/Link]</p>
        </div>
      </div>
    </div>
  );
}

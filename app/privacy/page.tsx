import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | DailyDesign',
  description: 'Privacy Policy for DailyDesign - How we handle your data.',
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-dark-900 text-white">
      <div className="max-w-3xl mx-auto px-4 py-16">
        <div className="mb-8">
          <Link href="/" className="text-sm text-gray-500 hover:text-white transition">
            &larr; Back to DailyDesign
          </Link>
        </div>

        <h1 className="text-4xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-gray-500 text-sm mb-12">Last updated: February 9, 2026</p>

        <div className="prose prose-invert prose-gray max-w-none space-y-8 text-gray-300 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">1. Information We Collect</h2>
            <p>We collect the following information when you use DailyDesign:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong className="text-white">Email address</strong> &mdash; provided when you subscribe to our newsletter.</li>
              <li><strong className="text-white">Preferences</strong> &mdash; optional information you provide during onboarding (years of experience, role, preparation stage, timezone).</li>
              <li><strong className="text-white">Payment information</strong> &mdash; processed and stored by Stripe. We never see or store your full credit card number.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">2. How We Use Your Information</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong className="text-white">Email delivery:</strong> We use your email address solely to send you daily system design scenarios and service-related communications.</li>
              <li><strong className="text-white">Content personalization:</strong> Your preferences may be used to tailor content difficulty and topic focus in future updates.</li>
              <li><strong className="text-white">Subscription management:</strong> Your Stripe customer ID links your payment to your account.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">3. We Do Not Sell Your Data</h2>
            <p>
              We will <strong className="text-white">never sell, rent, or share</strong> your personal information with third parties for marketing purposes. Your email is used exclusively for DailyDesign communications.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">4. Third-Party Services</h2>
            <p>We use the following third-party services to operate DailyDesign:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong className="text-white">Stripe</strong> &mdash; payment processing. Stripe handles all payment data under their own <a href="https://stripe.com/privacy" className="text-accent-400 hover:text-accent-300 transition" target="_blank" rel="noopener noreferrer">privacy policy</a>.</li>
              <li><strong className="text-white">Resend</strong> &mdash; email delivery. Resend processes your email address to deliver our daily emails.</li>
              <li><strong className="text-white">Vercel</strong> &mdash; hosting. Our application is hosted on Vercel&apos;s infrastructure.</li>
              <li><strong className="text-white">Turso</strong> &mdash; database hosting. Your subscriber data is stored in a Turso-hosted database.</li>
              <li><strong className="text-white">OpenAI</strong> &mdash; content generation. No subscriber data is sent to OpenAI; only content generation prompts.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">5. Cookies</h2>
            <p>
              DailyDesign uses minimal cookies. We do not use tracking cookies or third-party advertising cookies. Essential cookies may be used for basic site functionality by our hosting provider (Vercel).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">6. Data Retention</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong className="text-white">Active subscribers:</strong> Your data is retained as long as your subscription is active.</li>
              <li><strong className="text-white">Unsubscribed users:</strong> Your email and preferences are retained for 90 days after unsubscribing, then permanently deleted.</li>
              <li><strong className="text-white">Email logs:</strong> Delivery logs are retained for 30 days for debugging purposes.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">7. Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong className="text-white">Unsubscribe</strong> at any time using the unsubscribe link in any email.</li>
              <li><strong className="text-white">Request data deletion</strong> by contacting us at the email below.</li>
              <li><strong className="text-white">Access your data</strong> by requesting a copy of all information we hold about you.</li>
              <li><strong className="text-white">Update your preferences</strong> through the preferences link in your emails.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">8. Security</h2>
            <p>
              We take reasonable measures to protect your personal information. Access tokens are generated using cryptographically secure random bytes. All connections use HTTPS encryption. Payment data is handled entirely by Stripe&apos;s PCI-DSS compliant infrastructure.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">9. Changes to This Policy</h2>
            <p>
              We may update this privacy policy from time to time. Material changes will be communicated via email to active subscribers. The &quot;last updated&quot; date at the top reflects the most recent revision.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">10. Contact</h2>
            <p>
              For privacy-related questions or data requests, contact us at{' '}
              <a href="mailto:support@dailydesign.dev" className="text-accent-400 hover:text-accent-300 transition">
                support@dailydesign.dev
              </a>.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}

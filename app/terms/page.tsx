import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | DailyDesign',
  description: 'Terms of Service for DailyDesign - Daily system design interview preparation.',
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-dark-900 text-white">
      <div className="max-w-3xl mx-auto px-4 py-16">
        <div className="mb-8">
          <Link href="/" className="text-sm text-gray-500 hover:text-white transition">
            &larr; Back to DailyDesign
          </Link>
        </div>

        <h1 className="text-4xl font-bold mb-2">Terms of Service</h1>
        <p className="text-gray-500 text-sm mb-12">Last updated: February 9, 2026</p>

        <div className="prose prose-invert prose-gray max-w-none space-y-8 text-gray-300 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">1. Overview</h2>
            <p>
              DailyDesign (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) provides a daily email-based system design interview preparation service. By subscribing to or using our service, you agree to these Terms of Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">2. Service Description</h2>
            <p>
              DailyDesign delivers AI-generated system design interview scenarios via email. Content includes interview problems, framework analysis, and bad/good/best answer comparisons designed for experienced software engineers preparing for Staff, Principal, and senior-level roles.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">3. Educational Content Disclaimer</h2>
            <p>
              All scenarios, interview questions, and company contexts presented in DailyDesign content are <strong className="text-white">fictional and for educational purposes only</strong>. They do not represent real interview questions from any company. We make no guarantee of interview success or employment outcomes from using this service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">4. Subscriptions and Billing</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Paid subscriptions are billed monthly or annually through Stripe, our payment processor.</li>
              <li>Your subscription renews automatically at the end of each billing period unless cancelled.</li>
              <li>You can cancel your subscription at any time. Cancellation takes effect at the end of your current billing period.</li>
              <li>Prices may change with 30 days advance notice to existing subscribers.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">5. Refund Policy</h2>
            <p>
              We offer a <strong className="text-white">7-day refund policy</strong>. If you are unsatisfied with the service, contact us within 7 days of your initial subscription payment for a full refund. Refunds after the 7-day window are at our discretion.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">6. Free Tier</h2>
            <p>
              Free subscribers receive daily scenario emails. Access to full scenario analysis on the web requires a paid subscription. Sample scenarios remain freely accessible to all visitors.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">7. Acceptable Use</h2>
            <p>You agree not to:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Redistribute, resell, or republish our content without written permission.</li>
              <li>Share your subscriber access token or links with non-subscribers.</li>
              <li>Use automated tools to scrape or bulk-download content.</li>
              <li>Attempt to circumvent access controls or authentication mechanisms.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">8. Intellectual Property</h2>
            <p>
              All content generated and delivered by DailyDesign, including scenarios, analysis, and comparisons, is our intellectual property. Your subscription grants you a personal, non-transferable license to use the content for your own interview preparation.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">9. Limitation of Liability</h2>
            <p>
              DailyDesign is provided &quot;as is&quot; without warranty of any kind. We are not liable for any indirect, incidental, or consequential damages arising from your use of the service. Our total liability is limited to the amount you paid in the 12 months preceding any claim.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">10. Changes to Terms</h2>
            <p>
              We may update these terms from time to time. We will notify subscribers via email of any material changes. Continued use after changes constitutes acceptance of the updated terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">11. Contact</h2>
            <p>
              For questions about these terms, contact us at{' '}
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

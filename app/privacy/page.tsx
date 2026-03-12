import Link from 'next/link';
import { ArrowLeft, Shield } from 'lucide-react';

export const metadata = {
  title: 'Privacy Policy – Scruffs',
  description: 'How Scruffs collects, uses, and protects your personal data.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border px-4 py-3.5 flex items-center gap-3 sticky top-0 z-30">
        <Link href="/profile" className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft size={17} strokeWidth={2.5} />
        </Link>
        <p className="font-bold text-foreground text-base">Privacy Policy</p>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 pb-20 space-y-8">

        {/* Intro */}
        <div className="bg-primary/8 border border-primary/20 rounded-2xl px-5 py-4 flex items-start gap-3">
          <Shield size={20} className="text-primary mt-0.5 flex-shrink-0" strokeWidth={2} />
          <div>
            <p className="font-bold text-foreground text-sm">Your privacy matters to us</p>
            <p className="text-xs text-muted-foreground mt-1">Last updated: March 2026. This policy explains how Scruffs collects and uses your data when you use our app or website.</p>
          </div>
        </div>

        <Section title="1. Who We Are">
          <p>Scruffs is a mobile pet grooming service operating in Dubai, UAE. Our website and app are available at scruffs.ae. You can contact us at:</p>
          <ul>
            <li>Email: hello@scruffs.ae</li>
            <li>WhatsApp: +971 58 689 4998</li>
          </ul>
        </Section>

        <Section title="2. What Data We Collect">
          <p>We collect the following information when you use our services:</p>
          <ul>
            <li><strong>Account data:</strong> Phone number, name, email address (optional)</li>
            <li><strong>Pet information:</strong> Pet name, type (dog/cat), breed, size, age, and any grooming notes you provide</li>
            <li><strong>Booking data:</strong> Service selected, date and time, your Dubai area and address, booking history</li>
            <li><strong>Location:</strong> Your approximate area in Dubai (only when you provide it during booking)</li>
            <li><strong>Payment data:</strong> We do not store your card details. Payments are processed securely by Stripe. We only store your payment status and booking reference.</li>
            <li><strong>Device data:</strong> Basic device information for app functionality (browser type, device type)</li>
          </ul>
        </Section>

        <Section title="3. How We Use Your Data">
          <ul>
            <li>To confirm and manage your grooming bookings</li>
            <li>To send booking confirmations via SMS and email</li>
            <li>To contact you about your appointment (reminders, updates)</li>
            <li>To run our loyalty rewards programme</li>
            <li>To improve our services based on usage patterns</li>
            <li>To comply with UAE legal and regulatory requirements</li>
          </ul>
          <p>We do not sell your data to any third parties.</p>
        </Section>

        <Section title="4. Third Parties We Use">
          <ul>
            <li><strong>Stripe</strong> — Payment processing (stripe.com/privacy)</li>
            <li><strong>Twilio</strong> — SMS OTP verification (twilio.com/legal/privacy)</li>
            <li><strong>Vercel</strong> — App hosting (vercel.com/legal/privacy-policy)</li>
            <li><strong>Google</strong> — Optional sign-in via Google account (policies.google.com/privacy)</li>
            <li><strong>Apple</strong> — Optional sign-in via Apple ID (apple.com/legal/privacy)</li>
          </ul>
          <p>Each third party handles your data under their own privacy policies. We only share the minimum data necessary with each provider.</p>
        </Section>

        <Section title="5. Data Retention">
          <p>We retain your data for as long as your account is active. Booking records are kept for up to 3 years for business and legal purposes. You can request deletion of your account and all associated data at any time.</p>
        </Section>

        <Section title="6. Your Rights">
          <p>Under UAE data protection regulations, you have the right to:</p>
          <ul>
            <li>Access the personal data we hold about you</li>
            <li>Request correction of inaccurate data</li>
            <li>Request deletion of your account and data</li>
            <li>Withdraw consent for marketing communications at any time</li>
            <li>Ask how your data is being used</li>
          </ul>
          <p>To exercise any of these rights, contact us at hello@scruffs.ae or via WhatsApp.</p>
        </Section>

        <Section title="7. Cookies">
          <p>We use a single authentication cookie (<code className="bg-secondary px-1 rounded text-xs font-mono">scruffs_session</code>) to keep you logged in. We do not use advertising cookies or tracking pixels. We also use <code className="bg-secondary px-1 rounded text-xs font-mono">localStorage</code> in your browser to save your preferences, pet information, and theme settings locally on your device.</p>
        </Section>

        <Section title="8. Security">
          <p>We take security seriously. Your data is transmitted over HTTPS, and passwords are never stored (we use phone OTP or OAuth login). Payment data is handled entirely by Stripe, which is PCI-DSS Level 1 certified — the highest level of payment security.</p>
        </Section>

        <Section title="9. Children">
          <p>Our services are not directed at children under 13. We do not knowingly collect data from children. If you believe a child has provided us with personal information, please contact us and we will delete it promptly.</p>
        </Section>

        <Section title="10. Changes to This Policy">
          <p>We may update this Privacy Policy from time to time. When we do, we will update the date at the top of this page. Continued use of our app after changes constitutes acceptance of the updated policy.</p>
        </Section>

        <Section title="11. Contact">
          <p>If you have any questions about this Privacy Policy or how we handle your data, please reach out:</p>
          <ul>
            <li>Email: hello@scruffs.ae</li>
            <li>WhatsApp: +971 58 689 4998</li>
            <li>Location: Dubai, United Arab Emirates</li>
          </ul>
        </Section>

      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h2 className="font-bold text-foreground text-base">{title}</h2>
      <div className="text-sm text-muted-foreground leading-relaxed space-y-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_strong]:text-foreground [&_strong]:font-semibold">
        {children}
      </div>
    </div>
  );
}

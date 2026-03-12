import Link from 'next/link';
import { ArrowLeft, Shield, Clock, AlertCircle, CreditCard, MapPin, PawPrint, Phone } from 'lucide-react';
import BottomNav from '@/components/BottomNav';

export const metadata = { title: 'Terms & Conditions – Scruffs.ae' };

const SECTIONS = [
  {
    icon: PawPrint,
    title: 'Service Agreement',
    content: [
      'Scruffs.ae provides mobile pet grooming services at the customer\'s specified location in Dubai.',
      'By booking a service, you agree to these terms and confirm you are the legal owner or authorised carer of the pet.',
      'Scruffs reserves the right to refuse or discontinue a grooming session if the pet shows signs of illness, extreme aggression, or if the conditions are unsafe for our groomer.',
    ],
  },
  {
    icon: Clock,
    title: 'Scheduling & Time Windows',
    content: [
      'When you select a time slot during booking, you are choosing a PREFERRED TIME WINDOW — not an exact appointment time.',
      'Our groomer will confirm the actual arrival time via WhatsApp approximately 30 minutes before arrival.',
      'Time windows are estimates based on scheduling. Actual arrival may vary due to traffic, prior appointments, or unforeseen circumstances.',
      'We do not guarantee exact arrival at the start of your selected window. By booking, you acknowledge and accept this.',
    ],
    highlight: true,
  },
  {
    icon: CreditCard,
    title: 'Pricing & Payment',
    content: [
      'All prices displayed exclude 5% VAT, which will be added at the time of service.',
      'Payment is collected on the day of service — cash or card accepted.',
      'No advance deposit is required. Your booking is confirmed at no upfront cost.',
      'Final price may vary if additional services are added on the day at the customer\'s request.',
    ],
  },
  {
    icon: MapPin,
    title: 'Location & Access',
    content: [
      'The customer must ensure suitable parking space is available for our grooming van at the specified address.',
      'Grooming takes place inside our mobile van — the pet is not brought into your home.',
      'The customer or a responsible adult must be present or easily reachable during the grooming session.',
      'If our groomer cannot access the location or is turned away, a cancellation fee may apply.',
    ],
  },
  {
    icon: AlertCircle,
    title: 'Cancellations & Rescheduling',
    content: [
      'Free cancellation or rescheduling is available up to 2 hours before your appointment window.',
      'Cancellations made less than 2 hours before may incur a 50 AED late cancellation fee.',
      'Repeated no-shows may result in pre-payment being required for future bookings.',
      'Scruffs reserves the right to reschedule due to operational reasons, with advance notice provided.',
    ],
  },
  {
    icon: Shield,
    title: 'Pet Safety & Liability',
    content: [
      'Scruffs is fully insured. All groomers are certified and trained in pet handling.',
      'We take all reasonable precautions to ensure your pet\'s safety throughout the session.',
      'Customers must disclose any known medical conditions, behavioural issues, or allergies before the session.',
      'Scruffs shall not be liable for pre-existing conditions, undisclosed health issues, or incidents resulting from inaccurate information provided by the customer.',
      'In the unlikely event of an incident, our team will provide full transparency and cooperate with any insurance claims.',
    ],
  },
  {
    icon: Phone,
    title: 'Privacy & Data',
    content: [
      'We collect only the data necessary to process your booking — name, phone, address, and pet details.',
      'Your information is never sold to third parties.',
      'We may use your phone number to send booking confirmations and appointment reminders via WhatsApp.',
      'You can request deletion of your data at any time by contacting us.',
    ],
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="bg-card border-b border-border px-4 py-3.5 flex items-center gap-3 sticky top-0 z-30">
        <Link href="/profile" className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft size={17} strokeWidth={2.5} />
        </Link>
        <p className="font-bold text-foreground text-base">Terms & Conditions</p>
      </div>

      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-5 pb-28 space-y-5">

        {/* Intro */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <p className="font-bold text-foreground text-lg mb-1">Scruffs.ae · Service Terms</p>
          <p className="text-xs text-muted-foreground mb-2">Last updated: March 2026</p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Please read these terms carefully before booking. By using our service you agree to the following conditions.
          </p>
        </div>

        {/* Important banner */}
        <div className="bg-primary/8 border border-primary/20 rounded-2xl px-4 py-4 flex items-start gap-3">
          <AlertCircle size={18} className="text-primary flex-shrink-0 mt-0.5" strokeWidth={2} />
          <div>
            <p className="font-bold text-foreground text-sm mb-1">Important: Time Slots are Preferences</p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              When booking, you are selecting a <strong className="text-foreground">preferred time window</strong>, not a fixed appointment. Our groomer will confirm the exact arrival time via WhatsApp 30 minutes before arrival.
            </p>
          </div>
        </div>

        {/* Sections */}
        {SECTIONS.map(({ icon: Icon, title, content, highlight }) => (
          <div key={title} className={`bg-card border rounded-2xl overflow-hidden ${highlight ? 'border-primary/30' : 'border-border'}`}>
            <div className={`flex items-center gap-3 px-4 py-3.5 border-b ${highlight ? 'border-primary/20 bg-primary/5' : 'border-border'}`}>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${highlight ? 'bg-primary/15' : 'bg-secondary'}`}>
                <Icon size={15} className={highlight ? 'text-primary' : 'text-muted-foreground'} strokeWidth={2} />
              </div>
              <p className="font-bold text-foreground text-sm">{title}</p>
            </div>
            <div className="px-4 py-4 space-y-2.5">
              {content.map((text, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary/40 flex-shrink-0 mt-2" />
                  <p className="text-sm text-muted-foreground leading-relaxed">{text}</p>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Contact for queries */}
        <div className="bg-card border border-border rounded-2xl p-4">
          <p className="font-semibold text-foreground text-sm mb-1">Questions about these terms?</p>
          <p className="text-xs text-muted-foreground mb-3">Contact our team and we&apos;ll clarify anything.</p>
          <a
            href="https://wa.me/971586894998"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 bg-[#25D366] text-white py-3 rounded-xl font-bold text-sm hover:opacity-90 transition-opacity"
          >
            <Phone size={15} strokeWidth={2} />
            WhatsApp Us
          </a>
        </div>

        <p className="text-center text-[11px] text-muted-foreground pb-2">
          Scruffs.ae · Registered in Dubai, UAE · Est. 2022
        </p>

      </main>

      <BottomNav />
    </div>
  );
}

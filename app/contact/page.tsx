import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, MessageCircle, Phone, Instagram, Mail, Clock, MapPin } from 'lucide-react';
import BottomNav from '@/components/BottomNav';

export const metadata = { title: 'Contact Us – Scruffs.ae' };

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="bg-card border-b border-border px-4 py-3.5 flex items-center gap-3 sticky top-0 z-30">
        <Link href="/profile" className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft size={17} strokeWidth={2.5} />
        </Link>
        <p className="font-bold text-foreground text-base">Contact Us</p>
      </div>

      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-5 pb-28 space-y-5">

        {/* Hero */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <h2 className="font-bold text-foreground text-xl mb-1">We&apos;re here to help</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Reach out via WhatsApp for the fastest response. Our team is available 7 days a week.
          </p>
        </div>

        {/* Primary — WhatsApp */}
        <div>
          <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Get in Touch</p>
          <div className="bg-card border border-border rounded-2xl overflow-hidden">

            <a href="https://wa.me/971586894998" target="_blank" rel="noopener noreferrer" className="block">
              <div className="flex items-center gap-3 px-4 py-4 border-b border-border hover:bg-secondary/50 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-[#25D366]/15 flex items-center justify-center flex-shrink-0">
                  <MessageCircle size={18} className="text-[#25D366]" strokeWidth={2} />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-foreground text-sm">WhatsApp</p>
                  <p className="text-xs text-muted-foreground">+971 58 689 4998</p>
                  <p className="text-[10px] text-primary mt-0.5 font-semibold">Fastest response</p>
                </div>
                <span className="text-[10px] font-bold bg-[#25D366]/15 text-[#25D366] px-2 py-0.5 rounded-full">Online</span>
              </div>
            </a>

            <a href="tel:+971586894998" className="block">
              <div className="flex items-center gap-3 px-4 py-4 border-b border-border hover:bg-secondary/50 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Phone size={18} className="text-primary" strokeWidth={2} />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-foreground text-sm">Call Us</p>
                  <p className="text-xs text-muted-foreground">+971 58 689 4998</p>
                </div>
              </div>
            </a>

            <a href="mailto:hello@scruffs.ae" className="block">
              <div className="flex items-center gap-3 px-4 py-4 border-b border-border hover:bg-secondary/50 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
                  <Mail size={18} className="text-muted-foreground" strokeWidth={2} />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-foreground text-sm">Email</p>
                  <p className="text-xs text-muted-foreground">hello@scruffs.ae</p>
                </div>
              </div>
            </a>

            <a href="https://instagram.com/scruffs.ae" target="_blank" rel="noopener noreferrer" className="block">
              <div className="flex items-center gap-3 px-4 py-4 hover:bg-secondary/50 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-pink-500/10 flex items-center justify-center flex-shrink-0">
                  <Instagram size={18} className="text-pink-500" strokeWidth={2} />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-foreground text-sm">Instagram</p>
                  <p className="text-xs text-muted-foreground">@scruffs.ae</p>
                </div>
              </div>
            </a>
          </div>
        </div>

        {/* Hours & Coverage */}
        <div>
          <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Service Info</p>
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Clock size={15} className="text-primary" strokeWidth={2} />
              </div>
              <div>
                <p className="font-semibold text-foreground text-sm">Operating Hours</p>
                <p className="text-xs text-muted-foreground">8:00 AM – 8:00 PM · 7 days a week</p>
              </div>
            </div>
            <div className="flex items-center gap-3 px-4 py-3.5">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <MapPin size={15} className="text-primary" strokeWidth={2} />
              </div>
              <div>
                <p className="font-semibold text-foreground text-sm">Service Coverage</p>
                <p className="text-xs text-muted-foreground">All Dubai areas · 50+ locations</p>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div>
          <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Common Questions</p>
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            {[
              { q: 'How does mobile grooming work?', a: 'We bring a fully-equipped grooming van to your home. Your pet gets groomed in our salon-on-wheels parked right outside.' },
              { q: 'Do I need to be home during the session?', a: 'We recommend someone to be present. Our groomer will WhatsApp you 30 min before arrival.' },
              { q: 'When do I pay?', a: 'Payment is on the day of service — cash or card accepted. No deposit required at booking.' },
              { q: 'How do I cancel or reschedule?', a: 'WhatsApp or call us at least 2 hours before your appointment. We\'ll reschedule at no charge.' },
            ].map(({ q, a }, i) => (
              <details key={i} className={`group ${i < 3 ? 'border-b border-border' : ''}`}>
                <summary className="flex items-center justify-between px-4 py-3.5 cursor-pointer list-none hover:bg-secondary/50 transition-colors">
                  <p className="font-semibold text-foreground text-sm pr-4">{q}</p>
                  <span className="text-muted-foreground text-lg group-open:rotate-45 transition-transform duration-200 flex-shrink-0">+</span>
                </summary>
                <div className="px-4 pb-3.5">
                  <p className="text-sm text-muted-foreground leading-relaxed">{a}</p>
                </div>
              </details>
            ))}
          </div>
        </div>

        {/* Logo footer */}
        <div className="flex flex-col items-center py-3 opacity-40">
          <Image src="/logo-dark.png" alt="Scruffs" width={90} height={54} className="object-contain dark:invert" />
        </div>

      </main>

      <BottomNav />
    </div>
  );
}

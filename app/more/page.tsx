import Link from 'next/link';
import { ArrowLeft, Phone, Instagram, Shield, Clock, MapPin, Star, MessageCircle, Info, ChevronRight } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import { Card } from '@/components/ui/card';

const LINKS = [
  {
    group: 'Contact Us',
    items: [
      { icon: MessageCircle, label: 'WhatsApp Us',  sub: '+971 50 123 4567',  href: 'https://wa.me/971501234567',      external: true  },
      { icon: Phone,         label: 'Call Us',      sub: '+971 50 123 4567',  href: 'tel:+971501234567',               external: false },
      { icon: Instagram,     label: 'Instagram',    sub: '@scruffs.ae',       href: 'https://instagram.com/scruffs.ae', external: true  },
    ],
  },
  {
    group: 'About',
    items: [
      { icon: MapPin,  label: 'Service Areas',  sub: '50+ Dubai areas',     href: '/areas',  external: false },
      { icon: Shield,  label: 'Fully Insured',   sub: 'Your pet is safe',    href: '/about',  external: false },
      { icon: Star,    label: 'Our Groomers',    sub: 'Certified & caring',  href: '/team',   external: false },
      { icon: Clock,   label: 'Opening Hours',   sub: '8:00 AM – 8:00 PM',  href: '/hours',  external: false },
      { icon: Info,    label: 'FAQ',             sub: 'Common questions',    href: '/faq',    external: false },
    ],
  },
];

export default function MorePage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="bg-primary px-4 py-3.5 flex items-center gap-3">
        <Link href="/" className="p-1.5 rounded-xl text-primary-foreground/80 hover:text-primary-foreground hover:bg-white/10 transition-colors">
          <ArrowLeft size={20} strokeWidth={2.5} />
        </Link>
        <div>
          <p className="text-primary-foreground/50 text-[10px] font-display font-bold uppercase tracking-widest">Scruffs</p>
          <p className="text-primary-foreground font-display font-bold text-sm">More</p>
        </div>
      </div>

      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-5 pb-28 space-y-6">

        {LINKS.map(({ group, items }) => (
          <section key={group}>
            <p className="text-xs font-display font-bold text-muted-foreground uppercase tracking-wider mb-2 px-0.5">{group}</p>
            <Card className="overflow-hidden shadow-brand-sm">
              {items.map(({ icon: Icon, label, sub, href, external }, i) => {
                const inner = (
                  <div className={`flex items-center gap-3 px-4 py-3.5 hover:bg-muted/50 transition-colors ${i < items.length - 1 ? 'border-b border-border' : ''}`}>
                    <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
                      <Icon size={16} className="text-primary" strokeWidth={2} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-foreground">{label}</p>
                      <p className="text-xs text-muted-foreground">{sub}</p>
                    </div>
                    <ChevronRight size={15} className="text-muted-foreground" strokeWidth={2} />
                  </div>
                );
                return external ? (
                  <a key={label} href={href} target="_blank" rel="noopener noreferrer" className="block">{inner}</a>
                ) : (
                  <Link key={label} href={href} className="block">{inner}</Link>
                );
              })}
            </Card>
          </section>
        ))}

        <div className="text-center py-4">
          <p className="text-[11px] text-muted-foreground font-display font-bold">Scruffs.ae · Est. 2022 · Dubai</p>
          <p className="text-[10px] text-muted-foreground/60 mt-1">Professional mobile pet grooming</p>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}

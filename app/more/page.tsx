import Link from 'next/link';
import { ArrowLeft, Phone, Instagram, Shield, Clock, MapPin, Star, MessageCircle, Info } from 'lucide-react';
import BottomNav from '@/components/BottomNav';

const LINKS = [
  {
    group: 'Contact Us',
    items: [
      {
        icon: MessageCircle,
        label: 'WhatsApp Us',
        sub: '+971 50 123 4567',
        href: 'https://wa.me/971501234567',
        external: true,
      },
      {
        icon: Phone,
        label: 'Call Us',
        sub: '+971 50 123 4567',
        href: 'tel:+971501234567',
        external: false,
      },
      {
        icon: Instagram,
        label: 'Instagram',
        sub: '@scruffs.ae',
        href: 'https://instagram.com/scruffs.ae',
        external: true,
      },
    ],
  },
  {
    group: 'About',
    items: [
      { icon: MapPin,  label: 'Service Areas',  sub: '50+ Dubai areas',     href: '/areas',   external: false },
      { icon: Shield,  label: 'Fully Insured',   sub: 'Your pet is safe',    href: '/about',   external: false },
      { icon: Star,    label: 'Our Groomers',    sub: 'Certified & caring',  href: '/team',    external: false },
      { icon: Clock,   label: 'Opening Hours',   sub: '8:00 AM – 8:00 PM',  href: '/hours',   external: false },
      { icon: Info,    label: 'FAQ',             sub: 'Common questions',    href: '/faq',     external: false },
    ],
  },
];

export default function MorePage() {
  return (
    <div className="min-h-screen bg-scruffs-light flex flex-col">
      <div className="bg-scruffs-dark px-4 py-3 flex items-center gap-3">
        <Link href="/" className="p-1.5 rounded-xl text-scruffs-beige hover:bg-white/10 transition-colors">
          <ArrowLeft size={20} strokeWidth={2.5} />
        </Link>
        <div>
          <p className="text-scruffs-beige/60 text-[10px] font-display font-bold uppercase tracking-wider">Scruffs</p>
          <p className="text-white font-display font-bold text-sm">More</p>
        </div>
      </div>

      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-5 pb-28 space-y-6">

        {LINKS.map(({ group, items }) => (
          <section key={group}>
            <p className="text-xs font-display font-bold text-scruffs-muted uppercase tracking-wide mb-2">{group}</p>
            <div className="card divide-y divide-scruffs-border overflow-hidden">
              {items.map(({ icon: Icon, label, sub, href, external }) => {
                const inner = (
                  <div className="flex items-center gap-3 px-4 py-3.5">
                    <div className="w-9 h-9 rounded-xl bg-scruffs-beige flex items-center justify-center flex-shrink-0">
                      <Icon size={17} className="text-scruffs-dark" strokeWidth={2} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-scruffs-dark">{label}</p>
                      <p className="text-xs text-scruffs-muted">{sub}</p>
                    </div>
                    <ArrowLeft size={15} className="text-scruffs-muted rotate-180" strokeWidth={2} />
                  </div>
                );
                return external ? (
                  <a key={label} href={href} target="_blank" rel="noopener noreferrer" className="block hover:bg-scruffs-beige/20 transition-colors">
                    {inner}
                  </a>
                ) : (
                  <Link key={label} href={href} className="block hover:bg-scruffs-beige/20 transition-colors">
                    {inner}
                  </Link>
                );
              })}
            </div>
          </section>
        ))}

        <div className="text-center py-4">
          <p className="text-[11px] text-scruffs-muted">Scruffs.ae · Est. 2022 · Dubai</p>
          <p className="text-[10px] text-scruffs-muted/60 mt-1">Professional mobile pet grooming</p>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}

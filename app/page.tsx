import Link from 'next/link';
import Image from 'next/image';
import { Scissors, Bath, PawPrint, Sparkles, Star, ArrowRight, ChevronRight, Clock, Shield, MapPin } from 'lucide-react';
import TopBar from '@/components/TopBar';
import BottomNav from '@/components/BottomNav';

const SERVICES = [
  { key: 'BASIC',   name: 'Bath & Brush',  sub: 'Deep clean & deshed',       icon: Bath,     href: '/book?service=BASIC'   },
  { key: 'SPECIAL', name: 'Full Groom',    sub: 'Haircut, bath & nails',      icon: Scissors, href: '/book?service=SPECIAL' },
  { key: 'FULL',    name: 'Luxury Spa',    sub: 'Premium full treatment',     icon: Sparkles, href: '/book?service=FULL'    },
  { key: 'PAWS',    name: 'Paws & Claws',  sub: 'Nail trim & pad care',       icon: PawPrint, href: '/book?service=BASIC'   },
];

const WHY_US = [
  { icon: MapPin,  title: 'We Come to You',     sub: 'Mobile salon at your door' },
  { icon: Shield,  title: 'Fully Insured',       sub: 'Your pet is always safe'   },
  { icon: Star,    title: 'Certified Groomers',  sub: 'Professional & caring'     },
  { icon: Clock,   title: 'Same-Day Available',  sub: 'Flexible scheduling'       },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-scruffs-light flex flex-col">
      <TopBar showNotification />

      <main className="flex-1 overflow-y-auto pb-28">
        <div className="max-w-lg mx-auto px-4 pt-5 space-y-6">

          {/* ── Promo card ── */}
          <div className="promo-card p-6 text-scruffs-beige">
            <div className="relative z-10">
              <p className="text-xs font-display font-bold tracking-widest uppercase text-scruffs-teal mb-2">
                EST. 2022 · DUBAI
              </p>
              <h2 className="font-display font-extrabold text-2xl text-white leading-tight mb-2">
                Pamper Your Pet<br/>at Your Doorstep
              </h2>
              <p className="text-sm text-scruffs-beige/80 leading-relaxed mb-4">
                Professional mobile grooming delivered across all Dubai areas.
              </p>
              <Link
                href="/book"
                className="inline-flex items-center gap-2 bg-scruffs-beige text-scruffs-dark px-5 py-2.5 rounded-xl font-display font-bold text-sm hover:bg-white transition-colors"
              >
                Book Now
                <ArrowRight size={15} strokeWidth={2.5} />
              </Link>
            </div>
            {/* Logo watermark */}
            <div className="absolute right-4 bottom-0 opacity-10 pointer-events-none">
              <Image src="/logo-icon-beige.png" alt="" width={100} height={100} />
            </div>
          </div>

          {/* ── Quick stats ── */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { num: '500+', label: 'Pets Groomed' },
              { num: '50+',  label: 'Areas Covered'},
              { num: '4.9',  label: 'Star Rating'  },
            ].map((s) => (
              <div key={s.label} className="card p-3 text-center">
                <p className="font-display font-extrabold text-xl text-scruffs-dark">{s.num}</p>
                <p className="text-[11px] text-scruffs-muted font-semibold mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* ── My Pets ── */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display font-extrabold text-base text-scruffs-dark">My Pets</h3>
              <Link href="/my-pets" className="text-scruffs-teal-dark text-xs font-bold flex items-center gap-1">
                Manage <ChevronRight size={13} strokeWidth={2.5} />
              </Link>
            </div>
            <Link href="/my-pets" className="card flex items-center justify-between px-4 py-3.5 border-l-4 border-scruffs-teal card-hover">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-scruffs-beige flex items-center justify-center">
                  <PawPrint size={20} className="text-scruffs-dark" strokeWidth={2} />
                </div>
                <div>
                  <p className="font-bold text-scruffs-dark text-sm">Add Your Pet</p>
                  <p className="text-xs text-scruffs-muted">Save details for faster booking</p>
                </div>
              </div>
              <ChevronRight size={16} className="text-scruffs-muted" strokeWidth={2} />
            </Link>
          </section>

          {/* ── Services grid ── */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display font-extrabold text-base text-scruffs-dark">Grooming Services</h3>
              <Link href="/book" className="text-scruffs-teal-dark text-xs font-bold flex items-center gap-1">
                All <ChevronRight size={13} strokeWidth={2.5} />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {SERVICES.map(({ key, name, sub, icon: Icon, href }) => (
                <Link
                  key={key}
                  href={href}
                  className="card p-4 card-hover group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-scruffs-beige flex items-center justify-center mb-3 group-hover:bg-scruffs-teal/20 transition-colors">
                    <Icon size={22} className="text-scruffs-dark" strokeWidth={1.8} />
                  </div>
                  <h4 className="font-display font-bold text-scruffs-dark text-sm mb-0.5">{name}</h4>
                  <p className="text-[11px] text-scruffs-muted font-medium">{sub}</p>
                </Link>
              ))}
            </div>
          </section>

          {/* ── Why choose us ── */}
          <section>
            <h3 className="font-display font-extrabold text-base text-scruffs-dark mb-3">Why Scruffs?</h3>
            <div className="card divide-y divide-scruffs-border">
              {WHY_US.map(({ icon: Icon, title, sub }) => (
                <div key={title} className="flex items-center gap-3 px-4 py-3">
                  <div className="w-9 h-9 rounded-xl bg-scruffs-light flex items-center justify-center flex-shrink-0">
                    <Icon size={17} className="text-scruffs-teal-dark" strokeWidth={2} />
                  </div>
                  <div>
                    <p className="font-bold text-scruffs-dark text-sm">{title}</p>
                    <p className="text-xs text-scruffs-muted">{sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── Testimonial strip ── */}
          <section>
            <h3 className="font-display font-extrabold text-base text-scruffs-dark mb-3">Happy Pets</h3>
            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
              {[
                { name: 'Sarah A.',  area: 'Downtown', text: 'Amazing! Barnaby came out looking like a show dog.', stars: 5 },
                { name: 'James T.',  area: 'Marina',   text: 'My cat Bella has never been this relaxed after grooming.', stars: 5 },
                { name: 'Fatima H.', area: 'Jumeirah', text: 'Super convenient. Arrived on time, great results!', stars: 5 },
              ].map((t) => (
                <div key={t.name} className="card flex-shrink-0 w-64 p-4">
                  <div className="flex gap-0.5 mb-2">
                    {Array(t.stars).fill(0).map((_, i) => (
                      <Star key={i} size={12} className="text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs text-scruffs-dark leading-relaxed mb-3 italic">&ldquo;{t.text}&rdquo;</p>
                  <p className="text-xs font-bold text-scruffs-dark">{t.name}</p>
                  <p className="text-[10px] text-scruffs-muted">{t.area}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ── Instagram CTA ── */}
          <div className="card p-4 flex items-center justify-between border-l-4 border-pink-400">
            <div>
              <p className="font-bold text-scruffs-dark text-sm">Follow us on Instagram</p>
              <p className="text-xs text-scruffs-muted">Before & afters, tips & offers</p>
            </div>
            <a
              href="https://instagram.com/scruffs.ae"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl text-xs font-display font-bold"
            >
              @scruffs.ae
            </a>
          </div>

        </div>
      </main>

      <BottomNav />
    </div>
  );
}

import Link from 'next/link';
import { Bath, Scissors, Sparkles, Star, ArrowRight, ChevronRight, Clock, Shield, MapPin, Plus, PawPrint } from 'lucide-react';
import TopBar from '@/components/TopBar';
import BottomNav from '@/components/BottomNav';

const PRICING_ROWS = [
  { label: 'Cat',        price: 149 },
  { label: 'Dog Small',  price: 179 },
  { label: 'Dog Medium', price: 219 },
  { label: 'Dog Large',  price: 259 },
  { label: 'Dog XL',     price: 299 },
];

const ADDONS_PREVIEW = [
  { icon: Scissors,  label: 'Full Groom (Trimming)', from: 90  },
  { icon: Sparkles,  label: 'Full Groom Bundle',     from: 130 },
];

const WHY_US = [
  { icon: MapPin,  title: 'We Come to You',    sub: 'Mobile salon at your door' },
  { icon: Shield,  title: 'Fully Insured',      sub: 'Your pet is always safe'   },
  { icon: Star,    title: 'Certified Groomers', sub: 'Professional & caring'     },
  { icon: Clock,   title: 'Same-Day Slots',     sub: 'Flexible scheduling'       },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TopBar showNotification />

      <main className="flex-1 overflow-y-auto pb-28">
        <div className="max-w-lg mx-auto px-4 pt-5 space-y-5">

          {/* ── Hero card ── */}
          <div className="promo-card p-5 relative">
            <div className="relative z-10">
              <span className="inline-block bg-primary/15 text-primary text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-3 border border-primary/20">
                Est. 2022 · Dubai
              </span>
              <h2 className="font-bold text-[22px] text-foreground leading-tight mb-2">
                Pamper Your Pet<br/>at Your Doorstep
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-5 max-w-[220px]">
                Professional mobile grooming across all Dubai areas.
              </p>
              <Link
                href="/book"
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl text-sm font-bold transition-opacity hover:opacity-90"
              >
                Book Now <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {/* ── Stats strip ── */}
          <div className="grid grid-cols-3 gap-2.5">
            {[
              { num: '500+', label: 'Pets Groomed' },
              { num: '50+',  label: 'Areas Covered' },
              { num: '4.9★', label: 'Avg Rating'    },
            ].map((s) => (
              <div key={s.label} className="bg-card border border-border rounded-2xl text-center py-4 px-2">
                <p className="font-bold text-xl text-foreground leading-none">{s.num}</p>
                <p className="text-[11px] text-muted-foreground font-medium mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          {/* ── My Pets quick link ── */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">My Pets</p>
              <Link href="/my-pets" className="text-primary text-xs font-semibold flex items-center gap-0.5">
                Manage <ChevronRight size={13} strokeWidth={2.5} />
              </Link>
            </div>
            <Link href="/my-pets">
              <div className="bg-card border border-border rounded-2xl flex items-center justify-between px-4 py-3.5 hover:border-primary/40 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <PawPrint size={19} className="text-primary" strokeWidth={2} />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm">Add Your Pet</p>
                    <p className="text-xs text-muted-foreground">Save details for faster booking</p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-muted-foreground" strokeWidth={2} />
              </div>
            </Link>
          </section>

          {/* ── Services ── */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Grooming Menu</p>
              <Link href="/book" className="text-primary text-xs font-semibold flex items-center gap-0.5">
                Book now <ChevronRight size={13} strokeWidth={2.5} />
              </Link>
            </div>

            {/* Base service */}
            <div className="bg-card border border-border rounded-2xl overflow-hidden mb-2.5">
              <div className="px-4 py-3 flex items-center justify-between border-b border-border">
                <div className="flex items-center gap-2.5">
                  <Bath size={15} className="text-primary" strokeWidth={2} />
                  <p className="font-bold text-foreground text-sm">Wash & Tidy</p>
                  <span className="text-[9px] font-bold uppercase tracking-wider bg-primary/15 text-primary px-2 py-0.5 rounded-full">BASE</span>
                </div>
                <p className="text-[10px] text-muted-foreground">+VAT</p>
              </div>
              <div>
                {PRICING_ROWS.map(({ label, price }, i) => (
                  <div key={label} className={`flex items-center justify-between px-4 py-2.5 ${i < PRICING_ROWS.length - 1 ? 'border-b border-border' : ''}`}>
                    <p className="text-sm font-medium text-foreground">{label}</p>
                    <p className="font-bold text-foreground text-sm">AED {price}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Add-ons */}
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              <div className="px-4 py-3 flex items-center gap-2 border-b border-border">
                <Plus size={13} className="text-primary" strokeWidth={2.5} />
                <p className="font-bold text-foreground text-sm">
                  Add-Ons <span className="font-normal text-muted-foreground text-xs">(select during booking)</span>
                </p>
              </div>
              <div>
                {ADDONS_PREVIEW.map(({ icon: Icon, label, from }, i) => (
                  <div key={label} className={`flex items-center gap-3 px-4 py-2.5 ${i < ADDONS_PREVIEW.length - 1 ? 'border-b border-border' : ''}`}>
                    <Icon size={14} className="text-primary flex-shrink-0" strokeWidth={2} />
                    <p className="flex-1 text-sm font-medium text-foreground">{label}</p>
                    <p className="font-bold text-foreground text-sm">from AED {from}</p>
                  </div>
                ))}
                <div className="px-4 py-2.5 border-t border-border">
                  <p className="text-[11px] text-muted-foreground">+ Nail Grind · Tooth Brushing · Medicated Shampoo · De-matting</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Care add-ons from AED 29 · All prices +VAT (5%)</p>
                </div>
              </div>
            </div>
          </section>

          {/* ── Book CTA ── */}
          <Link
            href="/book"
            className="w-full flex items-center justify-between bg-primary text-primary-foreground px-5 py-4 rounded-2xl font-bold text-sm"
          >
            <span>Book a Grooming Session</span>
            <ArrowRight size={16} />
          </Link>

          {/* ── Why Scruffs ── */}
          <section>
            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-3">Why Scruffs?</p>
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              {WHY_US.map(({ icon: Icon, title, sub }, i) => (
                <div key={title} className={`flex items-center gap-3 px-4 py-3.5 ${i < WHY_US.length - 1 ? 'border-b border-border' : ''}`}>
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Icon size={16} className="text-primary" strokeWidth={2} />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm">{title}</p>
                    <p className="text-xs text-muted-foreground">{sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── Testimonials ── */}
          <section>
            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-3">Happy Clients</p>
            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
              {[
                { name: 'Sarah A.',  area: 'Downtown', text: 'Amazing! Barnaby came out looking like a show dog.', stars: 5 },
                { name: 'James T.',  area: 'Marina',   text: 'My cat Bella has never been this relaxed after grooming.', stars: 5 },
                { name: 'Fatima H.', area: 'Jumeirah', text: 'Super convenient. Arrived on time, great results!', stars: 5 },
              ].map((t) => (
                <div key={t.name} className="flex-shrink-0 w-60 bg-card border border-border rounded-2xl p-4">
                  <div className="flex gap-0.5 mb-2.5">
                    {Array(t.stars).fill(0).map((_, i) => (
                      <Star key={i} size={11} className="text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs text-foreground/80 leading-relaxed mb-3 italic">&ldquo;{t.text}&rdquo;</p>
                  <p className="text-xs font-bold text-foreground">{t.name}</p>
                  <p className="text-[10px] text-muted-foreground">{t.area}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ── Instagram CTA ── */}
          <div className="bg-card border border-l-4 border-l-pink-400 border-t-border border-r-border border-b-border rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="font-semibold text-foreground text-sm">Follow us on Instagram</p>
              <p className="text-xs text-muted-foreground">Before & afters, tips & offers</p>
            </div>
            <a
              href="https://instagram.com/scruffs.ae"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-gradient-to-br from-pink-500 to-purple-500 text-white rounded-xl text-xs font-bold hover:opacity-90 transition-opacity"
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

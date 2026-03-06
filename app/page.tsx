import Link from 'next/link';
import Image from 'next/image';
import { Bath, Scissors, Sparkles, Star, ArrowRight, ChevronRight, Clock, Shield, MapPin, Plus, PawPrint } from 'lucide-react';
import TopBar from '@/components/TopBar';
import BottomNav from '@/components/BottomNav';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const PRICING_ROWS = [
  { label: 'Cat',       price: 149 },
  { label: 'Dog Small', price: 179 },
  { label: 'Dog Medium',price: 219 },
  { label: 'Dog Large', price: 259 },
  { label: 'Dog XL',    price: 299 },
];

const ADDONS_PREVIEW = [
  { icon: Scissors, label: 'Full Groom (Trimming)',    from: 90  },
  { icon: Sparkles, label: 'Full Groom Bundle',        from: 130 },
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
        <div className="max-w-lg mx-auto px-4 pt-5 space-y-6">

          {/* ── Hero promo card ── */}
          <div className="promo-card p-6">
            <div className="relative z-10">
              <Badge variant="teal" className="mb-3 text-[10px] tracking-widest uppercase">
                Est. 2022 · Dubai
              </Badge>
              <h2 className="font-display font-extrabold text-[22px] text-white leading-tight mb-2">
                Pamper Your Pet<br/>at Your Doorstep
              </h2>
              <p className="text-sm text-white/70 leading-relaxed mb-5 max-w-[200px]">
                Professional mobile grooming across all Dubai areas.
              </p>
              <Button asChild size="sm" className="bg-white text-primary hover:bg-white/90 font-display font-bold shadow-none">
                <Link href="/book">
                  Book Now <ArrowRight size={14} />
                </Link>
              </Button>
            </div>
            <div className="absolute right-4 bottom-0 opacity-10 pointer-events-none">
              <Image src="/logo-icon-beige.png" alt="" width={100} height={100} />
            </div>
          </div>

          {/* ── Stats strip ── */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { num: '500+', label: 'Pets Groomed' },
              { num: '50+',  label: 'Areas Covered'},
              { num: '4.9★', label: 'Avg Rating'   },
            ].map((s) => (
              <Card key={s.label} className="text-center py-4 px-2 shadow-brand-sm">
                <p className="font-display font-extrabold text-xl text-foreground leading-none">{s.num}</p>
                <p className="text-[11px] text-muted-foreground font-semibold mt-1">{s.label}</p>
              </Card>
            ))}
          </div>

          {/* ── My Pets quick link ── */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display font-bold text-sm text-foreground uppercase tracking-wide">My Pets</h3>
              <Link href="/my-pets" className="text-accent-foreground text-xs font-bold flex items-center gap-0.5 hover:underline">
                Manage <ChevronRight size={13} strokeWidth={2.5} />
              </Link>
            </div>
            <Link href="/my-pets">
              <Card className="flex items-center justify-between px-4 py-3.5 border-l-4 border-accent shadow-brand-sm hover:shadow-brand-md transition-shadow">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                    <PawPrint size={19} className="text-primary" strokeWidth={2} />
                  </div>
                  <div>
                    <p className="font-bold text-foreground text-sm">Add Your Pet</p>
                    <p className="text-xs text-muted-foreground">Save details for faster booking</p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-muted-foreground" strokeWidth={2} />
              </Card>
            </Link>
          </section>

          {/* ── Services ── */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display font-bold text-sm text-foreground uppercase tracking-wide">Grooming Menu</h3>
              <Link href="/book" className="text-accent-foreground text-xs font-bold flex items-center gap-0.5 hover:underline">
                Book now <ChevronRight size={13} strokeWidth={2.5} />
              </Link>
            </div>

            {/* Base service */}
            <Card className="overflow-hidden shadow-brand-md mb-3">
              <div className="bg-primary px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Bath size={16} className="text-primary-foreground/80" strokeWidth={2} />
                  <p className="font-display font-bold text-primary-foreground text-sm">Wash & Tidy</p>
                  <Badge variant="teal" className="text-[9px] tracking-wide">BASE</Badge>
                </div>
                <p className="text-[10px] text-primary-foreground/60 font-semibold">+VAT</p>
              </div>
              <div className="divide-y divide-border">
                {PRICING_ROWS.map(({ label, price }) => (
                  <div key={label} className="flex items-center justify-between px-4 py-2.5">
                    <p className="text-sm font-semibold text-foreground">{label}</p>
                    <p className="font-display font-bold text-foreground text-sm">AED {price}</p>
                  </div>
                ))}
              </div>
            </Card>

            {/* Add-ons */}
            <Card className="overflow-hidden shadow-brand-sm">
              <div className="bg-secondary px-4 py-3 flex items-center gap-2">
                <Plus size={14} className="text-accent-foreground" strokeWidth={2.5} />
                <p className="font-display font-bold text-foreground text-sm">Add-Ons <span className="font-normal text-muted-foreground text-xs">(select during booking)</span></p>
              </div>
              <div className="divide-y divide-border">
                {ADDONS_PREVIEW.map(({ icon: Icon, label, from }) => (
                  <div key={label} className="flex items-center gap-3 px-4 py-2.5">
                    <Icon size={14} className="text-accent-foreground flex-shrink-0" strokeWidth={2} />
                    <p className="flex-1 text-sm font-semibold text-foreground">{label}</p>
                    <p className="font-display font-bold text-foreground text-sm">from AED {from}</p>
                  </div>
                ))}
                <div className="px-4 py-2.5">
                  <p className="text-[11px] text-muted-foreground">+ Nail Grind · Tooth Brushing · Medicated Shampoo · De-matting</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Care add-ons from AED 29 each · All prices +VAT (5%)</p>
                </div>
              </div>
            </Card>
          </section>

          {/* ── Book CTA ── */}
          <Button asChild size="lg" className="w-full font-display font-bold tracking-wide">
            <Link href="/book">
              Book a Grooming Session <ArrowRight size={16} />
            </Link>
          </Button>

          {/* ── Why Scruffs ── */}
          <section>
            <h3 className="font-display font-bold text-sm text-foreground uppercase tracking-wide mb-3">Why Scruffs?</h3>
            <Card className="shadow-brand-sm overflow-hidden">
              {WHY_US.map(({ icon: Icon, title, sub }, i) => (
                <div key={title} className={`flex items-center gap-3 px-4 py-3.5 ${i < WHY_US.length - 1 ? 'border-b border-border' : ''}`}>
                  <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
                    <Icon size={16} className="text-accent-foreground" strokeWidth={2} />
                  </div>
                  <div>
                    <p className="font-bold text-foreground text-sm">{title}</p>
                    <p className="text-xs text-muted-foreground">{sub}</p>
                  </div>
                </div>
              ))}
            </Card>
          </section>

          {/* ── Testimonials ── */}
          <section>
            <h3 className="font-display font-bold text-sm text-foreground uppercase tracking-wide mb-3">Happy Clients</h3>
            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
              {[
                { name: 'Sarah A.',  area: 'Downtown', text: 'Amazing! Barnaby came out looking like a show dog.', stars: 5 },
                { name: 'James T.',  area: 'Marina',   text: 'My cat Bella has never been this relaxed after grooming.', stars: 5 },
                { name: 'Fatima H.', area: 'Jumeirah', text: 'Super convenient. Arrived on time, great results!', stars: 5 },
              ].map((t) => (
                <Card key={t.name} className="flex-shrink-0 w-64 p-4 shadow-brand-sm">
                  <div className="flex gap-0.5 mb-2.5">
                    {Array(t.stars).fill(0).map((_, i) => (
                      <Star key={i} size={12} className="text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs text-foreground/80 leading-relaxed mb-3 italic">&ldquo;{t.text}&rdquo;</p>
                  <p className="text-xs font-bold text-foreground">{t.name}</p>
                  <p className="text-[10px] text-muted-foreground">{t.area}</p>
                </Card>
              ))}
            </div>
          </section>

          {/* ── Instagram CTA ── */}
          <Card className="p-4 flex items-center justify-between border-l-4 border-pink-400 shadow-brand-sm">
            <div>
              <p className="font-bold text-foreground text-sm">Follow us on Instagram</p>
              <p className="text-xs text-muted-foreground">Before & afters, tips & offers</p>
            </div>
            <a
              href="https://instagram.com/scruffs.ae"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-gradient-to-br from-pink-500 to-purple-500 text-white rounded-xl text-xs font-display font-bold shadow-sm hover:opacity-90 transition-opacity"
            >
              @scruffs.ae
            </a>
          </Card>

        </div>
      </main>

      <BottomNav />
    </div>
  );
}

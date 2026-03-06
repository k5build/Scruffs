import Link from 'next/link';
import Image from 'next/image';
import { Bath, Scissors, Sparkles, Star, ArrowRight, ChevronRight, Clock, Shield, MapPin, PawPrint, Check, Droplets, Wind, Ear, Flower2 } from 'lucide-react';
import TopBar from '@/components/TopBar';
import BottomNav from '@/components/BottomNav';

/* ─── Service includes (matches BASE_SERVICE in utils) ─── */
const SERVICE_INCLUDES = [
  { icon: Droplets,  label: 'Luxury Bath',         sub: 'Premium shampoo & conditioner' },
  { icon: Wind,      label: 'Blow Dry',             sub: 'Full professional dry' },
  { icon: Bath,      label: 'Full Brush Out',       sub: 'Detangle & de-shed' },
  { icon: Ear,       label: 'Ear Cleaning',         sub: 'Safe & gentle' },
  { icon: PawPrint,  label: 'Paw Wipe',             sub: 'Pads cleaned & trimmed' },
  { icon: Flower2,   label: 'Cologne Finish',       sub: 'Fresh & fragrant' },
];

/* ─── Dog size pricing ─── */
const DOG_SIZES = [
  { size: 'Small',  range: '< 10 kg',  price: 179, mins: '45–60' },
  { size: 'Medium', range: '10–25 kg', price: 219, mins: '60–90' },
  { size: 'Large',  range: '25–40 kg', price: 259, mins: '90–120' },
  { size: 'XL',     range: '> 40 kg',  price: 299, mins: '120+' },
];

/* ─── Add-ons ─── */
const ADDONS_FULL = [
  { icon: Scissors, label: 'Full Groom',     sub: 'Breed-style haircut & scissor finish',   price: 'from AED 90',  mins: '+30 min', highlight: true },
  { icon: Sparkles, label: 'Groom Bundle',   sub: 'Trimming + Nail Grind + Teeth Brushing', price: 'from AED 130', mins: '+45 min', highlight: true },
  { icon: PawPrint, label: 'Nail Grind',     sub: 'Smooth nails with electric file',        price: 'AED 29',       mins: '+10 min' },
  { icon: Star,     label: 'Teeth Brushing', sub: 'Fresh breath & dental hygiene',          price: 'AED 29',       mins: '+10 min' },
  { icon: Droplets, label: 'Medicated Shampoo', sub: 'Vet-grade treatment shampoo',         price: 'AED 39',       mins: '+10 min' },
  { icon: Bath,     label: 'De-matting',     sub: 'Gentle mat removal for long coats',      price: 'AED 39',       mins: '/10 min' },
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
      <TopBar />

      <main className="flex-1 overflow-y-auto pb-28">
        <div className="max-w-lg mx-auto px-4 pt-5 space-y-6">

          {/* ── Hero card ── */}
          <div className="promo-card p-5 relative overflow-hidden">
            {/* Decorative logo watermark */}
            <div className="absolute right-0 bottom-0 opacity-[0.06] pointer-events-none">
              <Image src="/logo-dark.png" alt="" width={160} height={100} className="object-contain" />
            </div>
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

          {/* ── Grooming Menu ── */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Grooming Menu</p>
              <Link href="/book" className="text-primary text-xs font-semibold flex items-center gap-0.5">
                Book now <ChevronRight size={13} strokeWidth={2.5} />
              </Link>
            </div>

            {/* ── BASE SERVICE CARD ── */}
            <div className="bg-card border border-border rounded-2xl overflow-hidden mb-3">
              {/* Card header */}
              <div className="bg-primary px-5 py-4 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <Bath size={16} className="text-primary-foreground" strokeWidth={2} />
                    <span className="text-primary-foreground font-bold text-base">Wash &amp; Tidy</span>
                    <span className="text-[9px] font-bold uppercase tracking-wider bg-primary-foreground/15 text-primary-foreground px-2 py-0.5 rounded-full">
                      Base Service
                    </span>
                  </div>
                  <p className="text-primary-foreground/70 text-xs">Deep clean · Blow dry · Brush out</p>
                </div>
                <Image src="/logo-icon-beige.png" alt="Scruffs" width={36} height={36} className="rounded-xl opacity-70" />
              </div>

              {/* What's included */}
              <div className="px-5 pt-4 pb-2">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">Always Included</p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                  {SERVICE_INCLUDES.map(({ icon: Icon, label, sub }) => (
                    <div key={label} className="flex items-start gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Icon size={13} className="text-primary" strokeWidth={2} />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-foreground leading-tight">{label}</p>
                        <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">{sub}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pricing grid — Dog */}
              <div className="px-5 pt-4 pb-2">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2.5">Dog Pricing</p>
                <div className="grid grid-cols-4 gap-2">
                  {DOG_SIZES.map(({ size, range, price, mins }) => (
                    <div key={size} className="bg-secondary/60 rounded-xl p-2.5 text-center border border-border">
                      <p className="text-[10px] font-bold text-foreground uppercase">{size}</p>
                      <p className="text-[9px] text-muted-foreground mt-0.5">{range}</p>
                      <p className="font-bold text-foreground text-sm mt-1.5">AED {price}</p>
                      <p className="text-[9px] text-muted-foreground mt-0.5 flex items-center justify-center gap-0.5">
                        <Clock size={8} strokeWidth={2} />{mins}m
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cat pricing */}
              <div className="px-5 pt-3 pb-4">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2.5">Cat Pricing</p>
                <div className="bg-secondary/60 rounded-xl p-3 border border-border flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <PawPrint size={14} className="text-primary" strokeWidth={2} />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground text-sm">All Cats</p>
                      <p className="text-[10px] text-muted-foreground">Short & long hair · ~45–60 min</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-foreground text-base">AED 149</p>
                    <p className="text-[10px] text-muted-foreground">+VAT</p>
                  </div>
                </div>
              </div>

              {/* VAT footer */}
              <div className="px-5 py-2.5 border-t border-border bg-secondary/30">
                <p className="text-[11px] text-muted-foreground text-center">All prices exclude 5% VAT · Pay on the day</p>
              </div>
            </div>

            {/* ── ADD-ONS ── */}
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              <div className="px-5 py-3.5 border-b border-border flex items-center justify-between">
                <div>
                  <p className="font-bold text-foreground text-sm">Upgrade Add-Ons</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Added to your base service during booking</p>
                </div>
                <span className="text-[9px] font-bold uppercase tracking-wider bg-secondary text-muted-foreground px-2 py-1 rounded-full">Optional</span>
              </div>

              {/* Upgrade add-ons (highlighted) */}
              <div className="px-5 py-4 space-y-3">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Core Upgrades</p>
                <div className="grid grid-cols-2 gap-2.5">
                  {ADDONS_FULL.filter((a) => a.highlight).map(({ icon: Icon, label, sub, price, mins }) => (
                    <div key={label} className="bg-primary/5 border border-primary/20 rounded-xl p-3.5">
                      <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center mb-2.5">
                        <Icon size={15} className="text-primary" strokeWidth={2} />
                      </div>
                      <p className="font-bold text-foreground text-xs leading-tight">{label}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{sub}</p>
                      <div className="mt-2.5 flex items-center justify-between">
                        <p className="font-bold text-primary text-sm">{price}</p>
                        <span className="text-[9px] text-muted-foreground flex items-center gap-0.5">
                          <Clock size={8} strokeWidth={2} />{mins}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Care add-ons */}
              <div className="border-t border-border px-5 pt-3 pb-4 space-y-2">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">Care &amp; Coat</p>
                {ADDONS_FULL.filter((a) => !a.highlight).map(({ icon: Icon, label, sub, price, mins }, i) => (
                  <div key={label} className={`flex items-center gap-3 py-2 ${i > 0 ? 'border-t border-border' : ''}`}>
                    <div className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                      <Icon size={13} className="text-muted-foreground" strokeWidth={2} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground text-xs">{label}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{sub}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-bold text-foreground text-xs">{price}</p>
                      <p className="text-[9px] text-muted-foreground flex items-center gap-0.5 justify-end">
                        <Clock size={8} strokeWidth={2} />{mins}
                      </p>
                    </div>
                  </div>
                ))}
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

          {/* ── Full logo footer ── */}
          <div className="flex flex-col items-center py-4 opacity-40">
            <Image src="/logo-dark.png" alt="Scruffs" width={100} height={60} className="object-contain dark:invert" />
          </div>

        </div>
      </main>

      <BottomNav />
    </div>
  );
}

'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeft, Dog, Cat, Trash2, Plus, User, Mail, Phone,
  CalendarDays, MapPin, RotateCcw, LogOut, ChevronRight,
  Pencil, X, Settings, Shield, MessageCircle, PawPrint, CalendarCheck, Lock,
} from 'lucide-react';
import BottomNav from '@/components/BottomNav';

interface UserData { id: string; phone: string | null; name: string | null; email: string | null; }
interface Pet { id: string; name: string; type: string; breed: string; size: string | null; age: string; notes: string | null; }
interface Booking { id: string; bookingRef: string; petName: string; service: string; price: number; area: string; status: string; slot: { date: string; startTime: string }; }

function fmtDate(d: string) {
  try { return new Date(d).toLocaleDateString('en-AE', { day: 'numeric', month: 'short', year: 'numeric' }); }
  catch { return d; }
}

function StatusBadge({ s }: { s: string }) {
  const map: Record<string, string> = {
    CONFIRMED: 'bg-primary/15 text-primary', IN_PROGRESS: 'bg-blue-500/15 text-blue-400',
    COMPLETED: 'bg-secondary text-muted-foreground', CANCELLED: 'bg-destructive/15 text-destructive',
  };
  return <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${map[s] ?? 'bg-secondary text-muted-foreground'}`}>{s.replace('_', ' ')}</span>;
}

function ProfileContent() {
  const router  = useRouter();
  const params  = useSearchParams();
  const isSetup = params.get('setup') === '1';

  const [user,     setUser]     = useState<UserData | null>(null);
  const [pets,     setPets]     = useState<Pet[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [editMode, setEditMode] = useState(isSetup);
  const [name,     setName]     = useState('');
  const [email,    setEmail]    = useState('');
  const [saving,   setSaving]   = useState(false);
  const [saveMsg,  setSaveMsg]  = useState('');

  useEffect(() => {
    Promise.all([
      fetch('/api/auth/me').then((r) => r.json()),
      fetch('/api/users/pets').then((r) => r.ok ? r.json() : { pets: [] }),
      fetch('/api/users/bookings').then((r) => r.ok ? r.json() : { bookings: [] }),
    ]).then(([meData, petsData, bkData]) => {
      if (!meData.user) { router.replace('/auth'); return; }
      setUser(meData.user);
      setName(meData.user.name ?? '');
      setEmail(meData.user.email ?? '');
      setPets(petsData.pets ?? []);
      setBookings(bkData.bookings ?? []);
    }).finally(() => setLoading(false));
  }, [router]);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const res  = await fetch('/api/auth/profile', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, email }) });
      const json = await res.json();
      if (res.ok) { setUser(json.user); setEditMode(false); setSaveMsg('Saved!'); setTimeout(() => setSaveMsg(''), 2000); }
    } finally { setSaving(false); }
  };

  const handleDeletePet = async (petId: string) => {
    await fetch(`/api/users/pets/${petId}`, { method: 'DELETE' });
    setPets((prev) => prev.filter((p) => p.id !== petId));
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/'); router.refresh();
  };

  if (loading) {
    return <div className="flex-1 flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  }
  if (!user) return null;

  const initials = (user.name ?? user.email ?? user.phone ?? 'SC').slice(0, 2).toUpperCase();

  return (
    <main className="flex-1 max-w-lg mx-auto w-full px-4 py-5 pb-28 space-y-5">

      {/* Profile card */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="bg-primary px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-primary-foreground/20 flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">{initials}</span>
            </div>
            <div>
              <p className="text-primary-foreground font-bold text-base leading-tight">{user.name ?? 'Welcome!'}</p>
              <p className="text-primary-foreground/60 text-xs">{user.phone ?? user.email ?? 'Google account'}</p>
            </div>
          </div>
          <button onClick={() => setEditMode((v) => !v)} className="w-8 h-8 rounded-xl bg-primary-foreground/10 flex items-center justify-center text-primary-foreground/70 hover:bg-primary-foreground/20 transition-colors">
            {editMode ? <X size={15} /> : <Pencil size={14} />}
          </button>
        </div>

        {editMode ? (
          <div className="p-5 space-y-4">
            {isSetup && <p className="text-sm text-muted-foreground">Complete your profile to speed up future bookings.</p>}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Full Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="input-field mt-1.5" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Email (optional)</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="input-field mt-1.5" />
              <p className="text-[11px] text-muted-foreground">Receive booking confirmations by email</p>
            </div>
            <button onClick={handleSaveProfile} disabled={saving} className="w-full h-11 bg-primary text-primary-foreground rounded-xl font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50">
              {saving ? 'Saving…' : 'Save Profile'}
            </button>
          </div>
        ) : (
          <div className="px-5 py-4 space-y-2.5">
            {user.phone && (
              <div className="flex items-center gap-3 text-sm">
                <Phone size={14} className="text-muted-foreground flex-shrink-0" strokeWidth={2} />
                <span className="text-foreground font-medium">{user.phone}</span>
                <span className="text-[9px] font-bold uppercase tracking-wider bg-primary/15 text-primary px-2 py-0.5 rounded-full">Verified</span>
              </div>
            )}
            {user.email && (
              <div className="flex items-center gap-3 text-sm">
                <Mail size={14} className="text-muted-foreground flex-shrink-0" strokeWidth={2} />
                <span className="text-foreground font-medium">{user.email}</span>
              </div>
            )}
            {saveMsg && <p className="text-primary text-xs font-bold">{saveMsg}</p>}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="bg-card border border-border rounded-2xl p-4">
          <PawPrint size={18} className="text-primary mb-2" strokeWidth={2} />
          <p className="font-bold text-foreground text-2xl">{pets.length}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Saved Pets</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-4">
          <CalendarCheck size={18} className="text-primary mb-2" strokeWidth={2} />
          <p className="font-bold text-foreground text-2xl">{bookings.length}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Bookings</p>
        </div>
      </div>

      {/* My Pets */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">My Pets</p>
          <span className="text-[10px] text-muted-foreground">{pets.length}/5</span>
        </div>
        <div className="space-y-2">
          {pets.map((pet) => (
            <div key={pet.id} className="bg-card border border-border rounded-2xl flex items-center gap-3 px-4 py-3.5">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                {pet.type === 'DOG' ? <Dog size={18} className="text-primary" strokeWidth={2} /> : <Cat size={18} className="text-primary" strokeWidth={2} />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-foreground text-sm">{pet.name}</p>
                <p className="text-xs text-muted-foreground">{pet.breed} · {pet.size ?? pet.type} · {pet.age}</p>
              </div>
              <div className="flex items-center gap-1.5">
                <Link href="/book" className="text-[11px] h-8 px-3 bg-primary/10 text-primary rounded-xl font-bold flex items-center hover:bg-primary/20 transition-colors">Book</Link>
                <button onClick={() => handleDeletePet(pet.id)} className="w-8 h-8 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors flex items-center justify-center">
                  <Trash2 size={14} strokeWidth={2} />
                </button>
              </div>
            </div>
          ))}
          {pets.length < 5 && (
            <Link href="/book">
              <div className="bg-card border border-dashed border-primary/40 rounded-2xl flex items-center gap-3 px-4 py-3.5 text-primary hover:bg-primary/5 transition-colors cursor-pointer">
                <Plus size={16} strokeWidth={2.5} />
                <span className="font-semibold text-sm">Add Pet via Booking</span>
              </div>
            </Link>
          )}
        </div>
      </div>

      {/* Booking History */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Booking History</p>
          {bookings.length > 0 && <span className="text-[10px] text-muted-foreground">{bookings.length} bookings</span>}
        </div>

        {bookings.length === 0 ? (
          <div className="bg-card border border-dashed border-border rounded-2xl p-8 text-center">
            <CalendarDays size={28} className="text-primary/40 mx-auto mb-3" strokeWidth={1.5} />
            <p className="font-bold text-foreground text-sm">No bookings yet</p>
            <p className="text-xs text-muted-foreground mt-1 mb-4">Book your first grooming session</p>
            <Link href="/book" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl text-sm font-bold hover:opacity-90">Book Now</Link>
          </div>
        ) : (
          <div className="space-y-2.5">
            {bookings.map((b) => (
              <div key={b.id} className="bg-card border border-border rounded-2xl overflow-hidden">
                <div className="px-4 py-3.5 flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="font-bold text-foreground text-sm">{b.petName}</p>
                      <span className="text-[10px] font-mono text-muted-foreground">{b.bookingRef}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      <span className="flex items-center gap-1 text-[11px] text-muted-foreground"><CalendarDays size={10} strokeWidth={2} /> {fmtDate(b.slot.date)}</span>
                      <span className="flex items-center gap-1 text-[11px] text-muted-foreground"><MapPin size={10} strokeWidth={2} /> {b.area}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <StatusBadge s={b.status} />
                    <span className="font-bold text-foreground text-sm">AED {b.price}</span>
                  </div>
                </div>
                {b.status !== 'CANCELLED' && (
                  <div className="px-4 py-2.5 bg-secondary/40 border-t border-border flex items-center justify-between">
                    <Link href={`/booking/${b.id}`} className="text-xs text-primary font-bold flex items-center gap-1 hover:underline">View details <ChevronRight size={12} /></Link>
                    <button onClick={() => router.push(`/book?service=${b.service}&rebook=${b.id}`)} className="h-8 px-3 bg-secondary rounded-xl text-[11px] font-bold text-foreground flex items-center gap-1 hover:bg-border transition-colors">
                      <RotateCcw size={12} strokeWidth={2.5} /> Book Again
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* App links */}
      <div>
        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-2">App</p>
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          {[
            { icon: Settings,      label: 'Settings',           sub: 'Theme, preferences', href: '/settings' },
            { icon: MessageCircle, label: 'Contact Us',          sub: 'Get in touch',       href: '/contact'  },
            { icon: Shield,        label: 'Terms & Conditions',  sub: 'Usage policy',       href: '/terms'    },
            { icon: Lock,          label: 'Privacy Policy',      sub: 'How we use your data', href: '/privacy' },
          ].map(({ icon: Icon, label, sub, href }, i) => (
            <Link key={label} href={href} className="block">
              <div className={`flex items-center gap-3 px-4 py-3.5 hover:bg-secondary/50 transition-colors ${i < 3 ? 'border-b border-border' : ''}`}>
                <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
                  <Icon size={15} className="text-muted-foreground" strokeWidth={2} />
                </div>
                <div className="flex-1"><p className="font-semibold text-foreground text-sm">{label}</p><p className="text-xs text-muted-foreground">{sub}</p></div>
                <ChevronRight size={14} className="text-muted-foreground" strokeWidth={2} />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Logout */}
      <button onClick={handleLogout} className="w-full h-11 bg-card border border-destructive/30 text-destructive rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-destructive/5 transition-colors">
        <LogOut size={15} strokeWidth={2} /> Sign Out
      </button>
    </main>
  );
}

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="bg-card border-b border-border px-4 py-3.5 flex items-center gap-3 sticky top-0 z-30">
        <Link href="/" className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft size={17} strokeWidth={2.5} />
        </Link>
        <p className="font-bold text-foreground text-base">My Account</p>
      </div>
      <Suspense fallback={<div className="flex-1 flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>}>
        <ProfileContent />
      </Suspense>
      <BottomNav />
    </div>
  );
}

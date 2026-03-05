'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft, Dog, Cat, Trash2, Plus, User, Mail, Phone, CalendarDays, MapPin, RotateCcw, LogOut, ChevronRight, Pencil, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import BottomNav from '@/components/BottomNav';
import { Suspense } from 'react';

interface UserData {
  id: string;
  phone: string;
  name: string | null;
  email: string | null;
}

interface Pet {
  id: string;
  name: string;
  type: string;
  breed: string;
  size: string | null;
  age: string;
  notes: string | null;
}

interface Booking {
  id: string;
  bookingRef: string;
  petName: string;
  service: string;
  price: number;
  area: string;
  status: string;
  slot: { date: string; startTime: string };
}

const SERVICE_LABELS: Record<string, string> = {
  BASIC: 'Bath & Brush', SPECIAL: 'Full Groom', FULL: 'Luxury Spa',
};

function formatDateShort(d: string) {
  try { return new Date(d).toLocaleDateString('en-AE', { day: 'numeric', month: 'short', year: 'numeric' }); }
  catch { return d; }
}

function statusBadge(s: string) {
  const map: Record<string, 'success' | 'default' | 'secondary' | 'destructive'> = {
    CONFIRMED: 'success', IN_PROGRESS: 'default', COMPLETED: 'secondary', CANCELLED: 'destructive',
  };
  return <Badge variant={map[s] ?? 'secondary'}>{s.replace('_', ' ')}</Badge>;
}

function ProfileContent() {
  const router     = useRouter();
  const params     = useSearchParams();
  const isSetup    = params.get('setup') === '1';

  const [user,       setUser]       = useState<UserData | null>(null);
  const [pets,       setPets]       = useState<Pet[]>([]);
  const [bookings,   setBookings]   = useState<Booking[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [editMode,   setEditMode]   = useState(isSetup);
  const [name,       setName]       = useState('');
  const [email,      setEmail]      = useState('');
  const [saving,     setSaving]     = useState(false);
  const [saveMsg,    setSaveMsg]    = useState('');

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
      const res  = await fetch('/api/auth/profile', {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ name, email }),
      });
      const json = await res.json();
      if (res.ok) {
        setUser(json.user);
        setEditMode(false);
        setSaveMsg('Saved!');
        setTimeout(() => setSaveMsg(''), 2000);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePet = async (petId: string) => {
    await fetch(`/api/users/pets/${petId}`, { method: 'DELETE' });
    setPets((prev) => prev.filter((p) => p.id !== petId));
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
    router.refresh();
  };

  const handleRebook = (b: Booking) => {
    // Pre-fill booking wizard with service and navigate
    router.push(`/book?service=${b.service}&rebook=${b.id}`);
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <main className="flex-1 max-w-lg mx-auto w-full px-4 py-5 pb-28 space-y-5">

      {/* Profile Card */}
      <Card className="overflow-hidden shadow-brand-md">
        <div className="bg-primary px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary-foreground/20 flex items-center justify-center">
              <User size={22} className="text-primary-foreground" strokeWidth={1.8} />
            </div>
            <div>
              <p className="text-primary-foreground font-display font-bold text-base leading-tight">
                {user.name ?? 'Welcome!'}
              </p>
              <p className="text-primary-foreground/60 text-xs">{user.phone}</p>
            </div>
          </div>
          <Button
            onClick={() => setEditMode((v) => !v)}
            size="icon-sm"
            variant="ghost"
            className="text-primary-foreground/70 hover:text-primary-foreground hover:bg-white/10"
          >
            {editMode ? <X size={16} /> : <Pencil size={15} />}
          </Button>
        </div>

        {editMode ? (
          <div className="p-5 space-y-4">
            {isSetup && (
              <p className="text-sm text-muted-foreground">
                Complete your profile to speed up future bookings.
              </p>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="mt-1.5" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email (optional)</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="mt-1.5" />
              <p className="text-[11px] text-muted-foreground">Receive booking confirmations by email</p>
            </div>
            <Button onClick={handleSaveProfile} disabled={saving} className="w-full h-11 font-display font-bold">
              {saving ? 'Saving…' : 'Save Profile'}
            </Button>
          </div>
        ) : (
          <div className="px-5 py-4 space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Phone size={14} className="text-muted-foreground flex-shrink-0" strokeWidth={2} />
              <span className="text-foreground font-medium">{user.phone}</span>
              <Badge variant="success" className="text-[9px]">Verified</Badge>
            </div>
            {user.email && (
              <div className="flex items-center gap-3 text-sm">
                <Mail size={14} className="text-muted-foreground flex-shrink-0" strokeWidth={2} />
                <span className="text-foreground font-medium">{user.email}</span>
              </div>
            )}
            {saveMsg && <p className="text-accent-foreground text-xs font-bold">{saveMsg}</p>}
          </div>
        )}
      </Card>

      {/* My Pets */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display font-bold text-sm text-foreground uppercase tracking-wide">My Pets</h2>
          <Badge variant="secondary">{pets.length}/5</Badge>
        </div>

        <div className="space-y-2">
          {pets.map((pet) => (
            <Card key={pet.id} className="flex items-center gap-3 px-4 py-3.5 shadow-brand-sm">
              <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
                {pet.type === 'DOG'
                  ? <Dog size={19} className="text-primary" strokeWidth={2} />
                  : <Cat size={19} className="text-primary" strokeWidth={2} />
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-foreground text-sm">{pet.name}</p>
                <p className="text-xs text-muted-foreground">{pet.breed} · {pet.size ?? pet.type} · {pet.age}</p>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <Button asChild size="sm" variant="teal" className="h-8 px-3 text-[11px] font-bold">
                  <Link href={`/book`}>Book</Link>
                </Button>
                <Button
                  onClick={() => handleDeletePet(pet.id)}
                  size="icon-sm"
                  variant="ghost"
                  className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 size={14} strokeWidth={2} />
                </Button>
              </div>
            </Card>
          ))}

          {pets.length < 5 && (
            <Button asChild variant="outline" className="w-full h-11 border-dashed border-accent/60 text-accent-foreground font-bold">
              <Link href="/book">
                <Plus size={16} strokeWidth={2.5} /> Add Pet via Booking
              </Link>
            </Button>
          )}
        </div>
      </section>

      <Separator />

      {/* Booking History */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display font-bold text-sm text-foreground uppercase tracking-wide">Booking History</h2>
          {bookings.length > 0 && (
            <span className="text-xs text-muted-foreground">{bookings.length} bookings</span>
          )}
        </div>

        {bookings.length === 0 ? (
          <Card className="p-8 text-center shadow-none border-dashed">
            <CalendarDays size={28} className="text-primary/40 mx-auto mb-3" strokeWidth={1.5} />
            <p className="font-bold text-foreground text-sm">No bookings yet</p>
            <p className="text-xs text-muted-foreground mt-1 mb-4">Book your first grooming session</p>
            <Button asChild size="sm" className="font-display font-bold">
              <Link href="/book">Book Now</Link>
            </Button>
          </Card>
        ) : (
          <div className="space-y-3">
            {bookings.map((b) => (
              <Card key={b.id} className="shadow-brand-sm overflow-hidden">
                <div className="px-4 py-3 flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="font-display font-bold text-foreground text-sm">{b.petName}</p>
                      <span className="text-[10px] text-muted-foreground font-bold">{b.bookingRef}</span>
                    </div>
                    <p className="text-xs text-foreground font-semibold">{SERVICE_LABELS[b.service] ?? b.service}</p>
                    <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                      <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                        <CalendarDays size={10} strokeWidth={2} /> {formatDateShort(b.slot.date)}
                      </span>
                      <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                        <MapPin size={10} strokeWidth={2} /> {b.area}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {statusBadge(b.status)}
                    <span className="font-display font-bold text-foreground text-sm">AED {b.price}</span>
                  </div>
                </div>

                {b.status !== 'CANCELLED' && (
                  <div className="px-4 py-2.5 bg-secondary/40 border-t border-border flex items-center justify-between">
                    <Link href={`/booking/${b.id}`} className="text-xs text-accent-foreground font-bold flex items-center gap-1 hover:underline">
                      View details <ChevronRight size={12} />
                    </Link>
                    <Button
                      onClick={() => handleRebook(b)}
                      size="sm"
                      variant="outline"
                      className="h-8 px-3 text-[11px] font-bold border-accent/50 text-accent-foreground hover:bg-accent/10"
                    >
                      <RotateCcw size={12} strokeWidth={2.5} /> Book Again
                    </Button>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </section>

      <Separator />

      {/* Logout */}
      <Button
        onClick={handleLogout}
        variant="outline"
        className="w-full h-11 text-destructive border-destructive/30 hover:bg-destructive/5 font-bold"
      >
        <LogOut size={15} strokeWidth={2} /> Sign Out
      </Button>

    </main>
  );
}

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="bg-primary px-4 py-3.5 flex items-center gap-3">
        <Link href="/" className="p-1.5 rounded-xl text-primary-foreground/80 hover:bg-white/10 transition-colors">
          <ArrowLeft size={20} strokeWidth={2.5} />
        </Link>
        <Image src="/logo-icon-beige.png" alt="Scruffs" width={28} height={28} className="rounded-full opacity-80" />
        <span className="text-primary-foreground font-display font-black text-sm tracking-[0.15em]">SCRUFFS</span>
        <span className="text-primary-foreground font-display font-bold text-sm ml-1">/ My Account</span>
      </div>

      <Suspense fallback={<div className="flex-1 flex items-center justify-center"><div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div>}>
        <ProfileContent />
      </Suspense>

      <BottomNav />
    </div>
  );
}

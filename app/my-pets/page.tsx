'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Dog, Cat, Plus, Trash2, ArrowLeft, PawPrint } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import { SavedPet } from '@/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function MyPetsPage() {
  const [pets, setPets] = useState<SavedPet[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('scruffs_pets');
      if (raw) setPets(JSON.parse(raw));
    } catch { /* ignore */ }
  }, []);

  const removePet = (id: string) => {
    const updated = pets.filter((p) => p.id !== id);
    setPets(updated);
    localStorage.setItem('scruffs_pets', JSON.stringify(updated));
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="bg-primary px-4 py-3.5 flex items-center gap-3">
        <Link href="/" className="p-1.5 rounded-xl text-primary-foreground/80 hover:text-primary-foreground hover:bg-white/10 transition-colors">
          <ArrowLeft size={20} strokeWidth={2.5} />
        </Link>
        <div>
          <p className="text-primary-foreground/50 text-[10px] font-display font-bold uppercase tracking-widest">Scruffs</p>
          <p className="text-primary-foreground font-display font-bold text-sm">My Pets</p>
        </div>
      </div>

      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-5 pb-28 space-y-3">

        {pets.length === 0 ? (
          <Card className="p-10 text-center shadow-brand-sm border-dashed">
            <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
              <PawPrint size={28} className="text-primary/60" strokeWidth={1.5} />
            </div>
            <p className="font-display font-bold text-foreground text-base">No pets saved yet</p>
            <p className="text-xs text-muted-foreground mt-1 mb-6">
              Your pets are saved automatically after your first booking
            </p>
            <Button asChild size="sm" className="font-display font-bold">
              <Link href="/book">
                <Plus size={15} strokeWidth={2.5} />
                Book a Grooming
              </Link>
            </Button>
          </Card>
        ) : (
          <>
            <p className="text-xs font-display font-bold text-muted-foreground uppercase tracking-wide px-0.5">
              {pets.length} {pets.length === 1 ? 'pet' : 'pets'} saved
            </p>

            {pets.map((pet) => (
              <Card key={pet.id} className="flex items-center gap-3 px-4 py-4 shadow-brand-sm">
                <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center flex-shrink-0">
                  {pet.type === 'DOG'
                    ? <Dog size={22} className="text-primary" strokeWidth={2} />
                    : <Cat size={22} className="text-primary" strokeWidth={2} />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-display font-bold text-foreground text-sm">{pet.name}</p>
                    <Badge variant="teal" className="text-[9px]">{pet.type === 'DOG' ? (pet.size ?? 'DOG') : 'CAT'}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {pet.breed} · {pet.age}
                  </p>
                  {pet.notes && (
                    <p className="text-[11px] text-muted-foreground mt-1 italic truncate">{pet.notes}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button asChild size="sm" variant="teal" className="text-[11px] h-8 px-3 font-bold">
                    <Link href="/book">Book</Link>
                  </Button>
                  <Button
                    onClick={() => removePet(pet.id)}
                    size="icon-sm"
                    variant="ghost"
                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 size={15} strokeWidth={2} />
                  </Button>
                </div>
              </Card>
            ))}

            <Link href="/book">
              <Card className="flex items-center gap-3 px-4 py-3.5 border-dashed border-accent/60 text-accent-foreground hover:bg-accent/5 transition-colors cursor-pointer shadow-none">
                <Plus size={17} strokeWidth={2.5} />
                <span className="font-bold text-sm">Add a new pet</span>
              </Card>
            </Link>
          </>
        )}
      </main>

      <BottomNav />
    </div>
  );
}

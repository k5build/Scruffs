'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Dog, Cat, Plus, Trash2, ArrowLeft, PawPrint } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import { SavedPet } from '@/types';

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
      <div className="bg-card border-b border-border px-4 py-3.5 flex items-center gap-3 sticky top-0 z-30">
        <Link href="/" className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft size={17} strokeWidth={2.5} />
        </Link>
        <p className="font-bold text-foreground text-base">My Pets</p>
      </div>

      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-5 pb-28 space-y-3">

        {pets.length === 0 ? (
          <div className="bg-card border border-dashed border-border rounded-2xl p-10 text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <PawPrint size={28} className="text-primary/60" strokeWidth={1.5} />
            </div>
            <p className="font-bold text-foreground text-base">No pets saved yet</p>
            <p className="text-xs text-muted-foreground mt-1 mb-6">
              Your pets are saved automatically after your first booking
            </p>
            <Link
              href="/book"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl text-sm font-bold hover:opacity-90 transition-opacity"
            >
              <Plus size={15} strokeWidth={2.5} />
              Book a Grooming
            </Link>
          </div>
        ) : (
          <>
            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest px-0.5">
              {pets.length} {pets.length === 1 ? 'pet' : 'pets'} saved
            </p>

            {pets.map((pet) => (
              <div key={pet.id} className="bg-card border border-border rounded-2xl flex items-center gap-3 px-4 py-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  {pet.type === 'DOG'
                    ? <Dog size={22} className="text-primary" strokeWidth={2} />
                    : <Cat size={22} className="text-primary" strokeWidth={2} />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-foreground text-sm">{pet.name}</p>
                    <span className="text-[9px] font-bold uppercase tracking-wider bg-primary/15 text-primary px-2 py-0.5 rounded-full">
                      {pet.type === 'DOG' ? (pet.size ?? 'DOG') : 'CAT'}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{pet.breed} · {pet.age}</p>
                  {pet.notes && <p className="text-[11px] text-muted-foreground mt-1 italic truncate">{pet.notes}</p>}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Link
                    href="/book"
                    className="text-[11px] h-8 px-3 bg-primary/10 text-primary rounded-xl font-bold flex items-center hover:bg-primary/20 transition-colors"
                  >
                    Book
                  </Link>
                  <button
                    onClick={() => removePet(pet.id)}
                    className="w-8 h-8 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors flex items-center justify-center"
                  >
                    <Trash2 size={15} strokeWidth={2} />
                  </button>
                </div>
              </div>
            ))}

            <Link href="/book">
              <div className="bg-card border border-dashed border-primary/40 rounded-2xl flex items-center gap-3 px-4 py-3.5 text-primary hover:bg-primary/5 transition-colors cursor-pointer">
                <Plus size={17} strokeWidth={2.5} />
                <span className="font-semibold text-sm">Add a new pet</span>
              </div>
            </Link>
          </>
        )}
      </main>

      <BottomNav />
    </div>
  );
}

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
    <div className="min-h-screen bg-scruffs-light flex flex-col">
      {/* Header */}
      <div className="bg-scruffs-dark px-4 py-3 flex items-center gap-3">
        <Link href="/" className="p-1.5 rounded-xl text-scruffs-beige hover:bg-white/10 transition-colors">
          <ArrowLeft size={20} strokeWidth={2.5} />
        </Link>
        <div>
          <p className="text-scruffs-beige/60 text-[10px] font-display font-bold uppercase tracking-wider">Scruffs</p>
          <p className="text-white font-display font-bold text-sm">My Pets</p>
        </div>
      </div>

      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-5 pb-28 space-y-4">

        {pets.length === 0 ? (
          <div className="card p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-scruffs-beige flex items-center justify-center mx-auto mb-4">
              <PawPrint size={28} className="text-scruffs-dark" strokeWidth={1.5} />
            </div>
            <p className="font-display font-bold text-scruffs-dark text-base">No pets saved yet</p>
            <p className="text-xs text-scruffs-muted mt-1 mb-5">
              Your pets are saved automatically after your first booking
            </p>
            <Link
              href="/book"
              className="btn-primary inline-flex items-center gap-2 px-6 py-3 text-sm font-display font-bold"
            >
              <Plus size={16} strokeWidth={2.5} />
              Book a Grooming
            </Link>
          </div>
        ) : (
          <>
            <p className="text-xs font-display font-bold text-scruffs-muted uppercase tracking-wide">
              {pets.length} {pets.length === 1 ? 'pet' : 'pets'} saved
            </p>

            {pets.map((pet) => (
              <div key={pet.id} className="card px-4 py-4 flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-scruffs-beige flex items-center justify-center flex-shrink-0">
                  {pet.type === 'DOG'
                    ? <Dog size={22} className="text-scruffs-dark" strokeWidth={2} />
                    : <Cat size={22} className="text-scruffs-dark" strokeWidth={2} />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-display font-bold text-scruffs-dark text-sm">{pet.name}</p>
                  <p className="text-xs text-scruffs-muted mt-0.5">
                    {pet.breed} · {pet.size ?? (pet.type === 'CAT' ? 'Cat' : '—')} · {pet.age}
                  </p>
                  {pet.notes && (
                    <p className="text-[11px] text-scruffs-muted mt-1 italic truncate">{pet.notes}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Link
                    href={`/book`}
                    className="text-[11px] font-bold text-scruffs-teal-dark bg-scruffs-teal/10 px-3 py-1.5 rounded-lg hover:bg-scruffs-teal/20 transition-colors"
                  >
                    Book
                  </Link>
                  <button
                    onClick={() => removePet(pet.id)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-scruffs-muted hover:text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={15} strokeWidth={2} />
                  </button>
                </div>
              </div>
            ))}

            <Link
              href="/book"
              className="w-full card flex items-center gap-3 px-4 py-3.5 text-scruffs-teal-dark border border-dashed border-scruffs-teal"
            >
              <Plus size={18} strokeWidth={2.5} />
              <span className="font-bold text-sm">Add a new pet</span>
            </Link>
          </>
        )}
      </main>

      <BottomNav />
    </div>
  );
}

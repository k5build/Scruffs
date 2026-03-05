'use client';

import { useState, useEffect } from 'react';
import { Dog, Cat, ChevronRight, Plus } from 'lucide-react';
import { BookingData, PetType, PetSize, SavedPet } from '@/types';
import { DOG_BREEDS, CAT_BREEDS, PET_AGE_OPTIONS } from '@/lib/utils';

interface Props {
  data: BookingData;
  onChange: (p: Partial<BookingData>) => void;
  onNext: () => void;
}

const SIZES: { id: PetSize; label: string; range: string }[] = [
  { id: 'SMALL',  label: 'Small',  range: 'Under 10 kg' },
  { id: 'MEDIUM', label: 'Medium', range: '10–25 kg'    },
  { id: 'LARGE',  label: 'Large',  range: 'Over 25 kg'  },
];

export default function PetStep({ data, onChange, onNext }: Props) {
  const [savedPets, setSavedPets] = useState<SavedPet[]>([]);
  const [mode, setMode] = useState<'select' | 'new'>('select');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const breeds = data.petType === 'CAT' ? CAT_BREEDS : DOG_BREEDS;

  useEffect(() => {
    try {
      const raw = localStorage.getItem('scruffs_pets');
      if (raw) setSavedPets(JSON.parse(raw));
    } catch { /* ignore */ }
  }, []);

  const selectSaved = (pet: SavedPet) => {
    onChange({
      savedPetId: pet.id,
      petType:    pet.type,
      petSize:    pet.size,
      petName:    pet.name,
      petBreed:   pet.breed,
      petAge:     pet.age,
      petNotes:   pet.notes,
    });
    onNext();
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!data.petType)        e.petType  = 'Select dog or cat';
    if (!data.petName.trim()) e.petName  = 'Enter your pet\'s name';
    if (!data.petBreed)       e.petBreed = 'Select a breed';
    if (!data.petAge)         e.petAge   = 'Select age';
    if (data.petType === 'DOG' && !data.petSize) e.petSize = 'Select size';
    return e;
  };

  const handleNext = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    onNext();
  };

  return (
    <div className="animate-fade-in space-y-5 pb-24">
      <div>
        <h2 className="font-display font-extrabold text-2xl text-scruffs-dark">Who's getting groomed?</h2>
        <p className="text-scruffs-muted text-sm mt-1">Select a saved pet or add a new one</p>
      </div>

      {/* Saved pets */}
      {savedPets.length > 0 && mode === 'select' && (
        <div className="space-y-2">
          <p className="text-xs font-display font-bold text-scruffs-muted uppercase tracking-wide">Your Pets</p>
          {savedPets.map((pet) => (
            <button
              key={pet.id}
              onClick={() => selectSaved(pet)}
              className="w-full card flex items-center justify-between px-4 py-3.5 card-hover border-l-4 border-scruffs-teal text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-scruffs-beige flex items-center justify-center">
                  {pet.type === 'DOG'
                    ? <Dog size={20} className="text-scruffs-dark" strokeWidth={2} />
                    : <Cat size={20} className="text-scruffs-dark" strokeWidth={2} />
                  }
                </div>
                <div>
                  <p className="font-bold text-scruffs-dark text-sm">{pet.name}</p>
                  <p className="text-xs text-scruffs-muted">{pet.breed} · {pet.size ?? 'Cat'} · {pet.age}</p>
                </div>
              </div>
              <ChevronRight size={16} className="text-scruffs-muted" strokeWidth={2} />
            </button>
          ))}
          <button
            onClick={() => { setMode('new'); onChange({ savedPetId: '' }); }}
            className="w-full card flex items-center gap-3 px-4 py-3.5 text-scruffs-teal-dark border border-dashed border-scruffs-teal"
          >
            <Plus size={18} strokeWidth={2.5} />
            <span className="font-bold text-sm">Add a different pet</span>
          </button>
        </div>
      )}

      {/* New pet form */}
      {(mode === 'new' || savedPets.length === 0) && (
        <div className="space-y-4">
          {/* Pet type */}
          <div>
            <p className="text-xs font-display font-bold text-scruffs-dark uppercase tracking-wide mb-2">Pet Type</p>
            <div className="grid grid-cols-2 gap-3">
              {([['DOG', Dog, 'Dog', 'All breeds & sizes'], ['CAT', Cat, 'Cat', 'Short & long hair']] as const).map(
                ([type, Icon, label, sub]) => (
                  <button
                    key={type}
                    onClick={() => { onChange({ petType: type as PetType, petSize: type === 'CAT' ? null : data.petSize }); setErrors((e) => ({ ...e, petType: '' })); }}
                    className={`pet-card p-5 text-left ${data.petType === type ? 'selected' : ''}`}
                  >
                    <div className="w-11 h-11 rounded-xl bg-scruffs-beige flex items-center justify-center mb-3">
                      <Icon size={22} className="text-scruffs-dark" strokeWidth={2} />
                    </div>
                    <p className="font-display font-bold text-scruffs-dark text-sm">{label}</p>
                    <p className="text-[11px] text-scruffs-muted mt-0.5">{sub}</p>
                  </button>
                )
              )}
            </div>
            {errors.petType && <p className="text-red-500 text-xs mt-1">{errors.petType}</p>}
          </div>

          {/* Dog size */}
          {data.petType === 'DOG' && (
            <div>
              <p className="text-xs font-display font-bold text-scruffs-dark uppercase tracking-wide mb-2">Size</p>
              <div className="flex gap-2">
                {SIZES.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => { onChange({ petSize: s.id }); setErrors((e) => ({ ...e, petSize: '' })); }}
                    className={`flex-1 py-2.5 px-3 rounded-xl border-2 text-center transition-all text-sm font-bold ${
                      data.petSize === s.id
                        ? 'border-scruffs-dark bg-scruffs-dark text-scruffs-beige'
                        : 'border-scruffs-border text-scruffs-dark hover:border-scruffs-teal'
                    }`}
                  >
                    <span className="block text-xs font-extrabold">{s.label}</span>
                    <span className="block text-[9px] opacity-70 mt-0.5">{s.range}</span>
                  </button>
                ))}
              </div>
              {errors.petSize && <p className="text-red-500 text-xs mt-1">{errors.petSize}</p>}
            </div>
          )}

          {/* Pet name */}
          <div>
            <label className="text-xs font-display font-bold text-scruffs-dark uppercase tracking-wide block mb-2">
              Pet's Name
            </label>
            <input
              type="text"
              value={data.petName}
              onChange={(e) => { onChange({ petName: e.target.value }); setErrors((x) => ({ ...x, petName: '' })); }}
              placeholder="e.g. Barnaby, Luna, Max…"
              className={`input-field ${errors.petName ? 'error' : ''}`}
            />
            {errors.petName && <p className="text-red-500 text-xs mt-1">{errors.petName}</p>}
          </div>

          {/* Breed */}
          <div>
            <label className="text-xs font-display font-bold text-scruffs-dark uppercase tracking-wide block mb-2">
              Breed
            </label>
            <select
              value={data.petBreed}
              onChange={(e) => { onChange({ petBreed: e.target.value }); setErrors((x) => ({ ...x, petBreed: '' })); }}
              className={`input-field ${errors.petBreed ? 'error' : ''}`}
              disabled={!data.petType}
            >
              <option value="">Select breed…</option>
              {breeds.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
            {errors.petBreed && <p className="text-red-500 text-xs mt-1">{errors.petBreed}</p>}
          </div>

          {/* Age */}
          <div>
            <p className="text-xs font-display font-bold text-scruffs-dark uppercase tracking-wide mb-2">Age</p>
            <div className="grid grid-cols-2 gap-2">
              {PET_AGE_OPTIONS.map((age) => (
                <button
                  key={age}
                  onClick={() => { onChange({ petAge: age }); setErrors((x) => ({ ...x, petAge: '' })); }}
                  className={`py-2 px-3 rounded-xl border-2 text-left text-xs font-semibold transition-all ${
                    data.petAge === age
                      ? 'border-scruffs-dark bg-scruffs-dark text-scruffs-beige'
                      : 'border-scruffs-border text-scruffs-dark hover:border-scruffs-teal'
                  }`}
                >
                  {age}
                </button>
              ))}
            </div>
            {errors.petAge && <p className="text-red-500 text-xs mt-1">{errors.petAge}</p>}
          </div>

          {/* Notes (collapsible) */}
          <details className="group">
            <summary className="cursor-pointer text-xs font-display font-bold text-scruffs-teal-dark uppercase tracking-wide list-none flex items-center gap-1">
              <Plus size={13} strokeWidth={3} className="group-open:rotate-45 transition-transform" />
              Special requirements (optional)
            </summary>
            <textarea
              value={data.petNotes}
              onChange={(e) => onChange({ petNotes: e.target.value })}
              placeholder="Allergies, anxiety, specific instructions…"
              rows={3}
              className="input-field mt-2 resize-none"
            />
          </details>
        </div>
      )}

      {/* Continue */}
      {(mode === 'new' || savedPets.length === 0) && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-scruffs-light border-t border-scruffs-border z-20">
          <div className="max-w-lg mx-auto">
            <button onClick={handleNext} className="btn-primary w-full py-3.5 text-sm font-display font-bold tracking-wide">
              Continue to Service
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

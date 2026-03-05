'use client';

import { useState, useEffect } from 'react';
import { Dog, Cat, ChevronRight, Plus, Check } from 'lucide-react';
import { BookingData, PetType, PetSize, SavedPet } from '@/types';
import { DOG_BREEDS, CAT_BREEDS, PET_AGE_OPTIONS } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

interface Props {
  data: BookingData;
  onChange: (p: Partial<BookingData>) => void;
  onNext: () => void;
}

const SIZES: { id: PetSize; label: string; range: string }[] = [
  { id: 'SMALL',  label: 'Small',  range: '< 10 kg'  },
  { id: 'MEDIUM', label: 'Medium', range: '10–25 kg' },
  { id: 'LARGE',  label: 'Large',  range: '> 25 kg'  },
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
    onChange({ savedPetId: pet.id, petType: pet.type, petSize: pet.size, petName: pet.name, petBreed: pet.breed, petAge: pet.age, petNotes: pet.notes });
    onNext();
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!data.petType)        e.petType  = 'Select dog or cat';
    if (!data.petName.trim()) e.petName  = "Enter your pet's name";
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
    <div className="animate-fade-in space-y-6 pb-24">
      <div>
        <h2 className="font-display font-extrabold text-2xl text-foreground">Who&apos;s getting groomed?</h2>
        <p className="text-muted-foreground text-sm mt-1">Select a saved pet or add a new one</p>
      </div>

      {/* Saved pets */}
      {savedPets.length > 0 && mode === 'select' && (
        <div className="space-y-2">
          <Label className="text-muted-foreground">Your Pets</Label>
          <div className="space-y-2 mt-2">
            {savedPets.map((pet) => (
              <button
                key={pet.id}
                onClick={() => selectSaved(pet)}
                className="w-full text-left"
              >
                <Card className="flex items-center justify-between px-4 py-3.5 border-l-4 border-accent shadow-brand-sm hover:shadow-brand-md transition-shadow cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                      {pet.type === 'DOG'
                        ? <Dog size={19} className="text-primary" strokeWidth={2} />
                        : <Cat size={19} className="text-primary" strokeWidth={2} />
                      }
                    </div>
                    <div>
                      <p className="font-bold text-foreground text-sm">{pet.name}</p>
                      <p className="text-xs text-muted-foreground">{pet.breed} · {pet.size ?? 'Cat'} · {pet.age}</p>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-muted-foreground" strokeWidth={2} />
                </Card>
              </button>
            ))}
            <button
              onClick={() => { setMode('new'); onChange({ savedPetId: '' }); }}
              className="w-full"
            >
              <Card className="flex items-center gap-3 px-4 py-3.5 border-dashed border-accent/60 text-accent-foreground hover:bg-accent/5 transition-colors cursor-pointer shadow-none">
                <Plus size={17} strokeWidth={2.5} />
                <span className="font-bold text-sm">Add a different pet</span>
              </Card>
            </button>
          </div>
        </div>
      )}

      {/* New pet form */}
      {(mode === 'new' || savedPets.length === 0) && (
        <div className="space-y-5">

          {/* Pet type */}
          <div className="space-y-2">
            <Label>Pet Type</Label>
            <div className="grid grid-cols-2 gap-3 mt-2">
              {([['DOG', Dog, 'Dog', 'All breeds & sizes'], ['CAT', Cat, 'Cat', 'Short & long hair']] as const).map(
                ([type, Icon, label, sub]) => (
                  <button
                    key={type}
                    onClick={() => { onChange({ petType: type as PetType, petSize: type === 'CAT' ? null : data.petSize }); setErrors((e) => ({ ...e, petType: '' })); }}
                    className={`p-5 text-left rounded-2xl border-2 transition-all duration-200 ${
                      data.petType === type
                        ? 'border-primary bg-primary/5 shadow-brand-sm'
                        : 'border-border bg-card hover:border-accent'
                    }`}
                  >
                    <div className="w-11 h-11 rounded-xl bg-secondary flex items-center justify-center mb-3">
                      <Icon size={21} className="text-primary" strokeWidth={2} />
                    </div>
                    <p className="font-display font-bold text-foreground text-sm">{label}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{sub}</p>
                    {data.petType === type && (
                      <div className="mt-2">
                        <Check size={14} className="text-primary" strokeWidth={2.5} />
                      </div>
                    )}
                  </button>
                )
              )}
            </div>
            {errors.petType && <p className="text-destructive text-xs">{errors.petType}</p>}
          </div>

          {/* Dog size */}
          {data.petType === 'DOG' && (
            <div className="space-y-2">
              <Label>Size</Label>
              <div className="flex gap-2 mt-2">
                {SIZES.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => { onChange({ petSize: s.id }); setErrors((e) => ({ ...e, petSize: '' })); }}
                    className={`flex-1 py-3 px-2 rounded-xl border-2 text-center transition-all duration-200 ${
                      data.petSize === s.id
                        ? 'border-primary bg-primary text-primary-foreground shadow-brand-sm'
                        : 'border-border text-foreground hover:border-accent bg-card'
                    }`}
                  >
                    <span className="block text-xs font-extrabold font-display">{s.label}</span>
                    <span className="block text-[9px] opacity-70 mt-0.5">{s.range}</span>
                  </button>
                ))}
              </div>
              {errors.petSize && <p className="text-destructive text-xs">{errors.petSize}</p>}
            </div>
          )}

          {/* Pet name */}
          <div className="space-y-2">
            <Label htmlFor="petName">Pet&apos;s Name</Label>
            <Input
              id="petName"
              type="text"
              value={data.petName}
              onChange={(e) => { onChange({ petName: e.target.value }); setErrors((x) => ({ ...x, petName: '' })); }}
              placeholder="e.g. Barnaby, Luna, Max…"
              aria-invalid={!!errors.petName}
            />
            {errors.petName && <p className="text-destructive text-xs">{errors.petName}</p>}
          </div>

          {/* Breed */}
          <div className="space-y-2">
            <Label htmlFor="petBreed">Breed</Label>
            <select
              id="petBreed"
              value={data.petBreed}
              onChange={(e) => { onChange({ petBreed: e.target.value }); setErrors((x) => ({ ...x, petBreed: '' })); }}
              disabled={!data.petType}
              className={`flex h-11 w-full rounded-xl border bg-card px-4 py-2.5 text-sm text-foreground shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent disabled:opacity-50 ${errors.petBreed ? 'border-destructive' : 'border-border'}`}
            >
              <option value="">Select breed…</option>
              {breeds.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
            {errors.petBreed && <p className="text-destructive text-xs">{errors.petBreed}</p>}
          </div>

          {/* Age */}
          <div className="space-y-2">
            <Label>Age</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {PET_AGE_OPTIONS.map((age) => (
                <button
                  key={age}
                  onClick={() => { onChange({ petAge: age }); setErrors((x) => ({ ...x, petAge: '' })); }}
                  className={`py-2.5 px-3 rounded-xl border-2 text-left text-xs font-semibold transition-all duration-200 ${
                    data.petAge === age
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border text-foreground hover:border-accent bg-card'
                  }`}
                >
                  {age}
                </button>
              ))}
            </div>
            {errors.petAge && <p className="text-destructive text-xs">{errors.petAge}</p>}
          </div>

          {/* Notes */}
          <details className="group">
            <summary className="cursor-pointer text-xs font-display font-bold text-accent-foreground uppercase tracking-wide list-none flex items-center gap-1.5">
              <Plus size={13} strokeWidth={3} className="group-open:rotate-45 transition-transform duration-200" />
              Special requirements (optional)
            </summary>
            <div className="mt-3">
              <Textarea
                value={data.petNotes}
                onChange={(e) => onChange({ petNotes: e.target.value })}
                placeholder="Allergies, anxiety, specific instructions…"
                rows={3}
              />
            </div>
          </details>
        </div>
      )}

      {/* Continue button */}
      {(mode === 'new' || savedPets.length === 0) && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur-sm border-t border-border z-20">
          <div className="max-w-lg mx-auto">
            <Button onClick={handleNext} className="w-full h-12 font-display font-bold tracking-wide">
              Continue to Service
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

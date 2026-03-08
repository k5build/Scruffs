'use client';

import { useState, useEffect } from 'react';
import { Dog, Cat, Check, Plus, Trash2, ChevronDown, ChevronUp, Star } from 'lucide-react';
import { BookingData, BookingPetEntry, PetType, PetSize, ServiceLevel, SavedPet } from '@/types';
import { DOG_BREEDS, CAT_BREEDS, PET_AGE_OPTIONS, SERVICE_LEVELS, ADDONS, getServicePrice, getServiceDurationV2, calcAddonsPrice, calcAddonsDuration, formatDuration } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';

interface Props {
  data: BookingData;
  onChange: (p: Partial<BookingData>) => void;
  onNext: () => void;
}

const SIZES: { id: PetSize; label: string; range: string }[] = [
  { id: 'SMALL',  label: 'Small',  range: '< 10 kg'  },
  { id: 'MEDIUM', label: 'Medium', range: '10–25 kg' },
  { id: 'LARGE',  label: 'Large',  range: '25–40 kg' },
  { id: 'XL',     label: 'XL',     range: '> 40 kg'  },
];

interface NewPetForm {
  type:    PetType | null;
  size:    PetSize | null;
  name:    string;
  breed:   string;
  age:     string;
  service: ServiceLevel;
  addons:  string[];
  notes:   string;
}

const BLANK_FORM: NewPetForm = {
  type: null, size: null, name: '', breed: '', age: '', service: 'SPECIAL', addons: [], notes: '',
};

function applyAddonToggle(current: string[], addonKey: string): string[] {
  if (current.includes(addonKey)) return current.filter((k) => k !== addonKey);
  const def     = ADDONS.find((a) => a.key === addonKey);
  const exclude = new Set(def?.exclusive ?? []);
  return [...current.filter((k) => !exclude.has(k)), addonKey];
}

function calcTotals(pets: BookingPetEntry[]) {
  const price    = pets.reduce((s, p) => s + p.price, 0);
  const duration = pets.reduce((s, p) => s + p.duration, 0);
  return { price, duration };
}

export default function PetStep({ data, onChange, onNext }: Props) {
  const [savedPets, setSavedPets] = useState<SavedPet[]>([]);
  const [showForm, setShowForm]   = useState(false);
  const [form, setForm]           = useState<NewPetForm>({ ...BLANK_FORM });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [stepError, setStepError]   = useState('');

  // Track which saved-pet IDs are already added to this booking
  const addedSavedIds = new Set(data.pets.map((p) => p.savedPetId).filter(Boolean));

  useEffect(() => {
    try {
      const raw = localStorage.getItem('scruffs_pets');
      if (raw) setSavedPets(JSON.parse(raw));
    } catch { /* ignore */ }

    // If no pets yet and no form shown, auto-show form if no saved pets
  }, []);

  useEffect(() => {
    if (savedPets.length === 0 && data.pets.length === 0) {
      setShowForm(true);
    }
  }, [savedPets.length, data.pets.length]);

  // ── Saved pet quick-add ──────────────────────────────────────
  const addSavedPet = (pet: SavedPet) => {
    if (data.pets.length >= 5) return;
    if (addedSavedIds.has(pet.id)) return;
    const service: ServiceLevel = 'SPECIAL';
    const addons: string[] = [];
    const price    = getServicePrice(pet.type, pet.size, service);
    const duration = getServiceDurationV2(pet.type, pet.size, service);
    const entry: BookingPetEntry = {
      key: crypto.randomUUID(),
      name: pet.name, type: pet.type, breed: pet.breed,
      size: pet.size, age: pet.age, notes: pet.notes,
      service, addons, price, duration, savedPetId: pet.id,
    };
    const newPets = [...data.pets, entry];
    onChange({ pets: newPets, ...calcTotals(newPets) });
    setStepError('');
  };

  // ── New pet form handlers ────────────────────────────────────
  const updateForm = (patch: Partial<NewPetForm>) => {
    setForm((f) => ({ ...f, ...patch }));
    setFormErrors({});
  };

  const validateForm = (): Record<string, string> => {
    const e: Record<string, string> = {};
    if (!form.type)        e.type  = 'Select dog or cat';
    if (!form.name.trim()) e.name  = "Enter your pet's name";
    if (!form.breed)       e.breed = 'Select a breed';
    if (!form.age)         e.age   = 'Select age';
    if (form.type === 'DOG' && !form.size) e.size = 'Select size';
    return e;
  };

  const handleAddPet = () => {
    const e = validateForm();
    if (Object.keys(e).length) { setFormErrors(e); return; }
    if (data.pets.length >= 5) return;

    const service  = form.service;
    const addons   = form.addons;
    const price    = getServicePrice(form.type!, form.size, service) + calcAddonsPrice(addons, form.type!);
    const duration = getServiceDurationV2(form.type!, form.size, service) + calcAddonsDuration(addons);

    const entry: BookingPetEntry = {
      key: crypto.randomUUID(),
      name: form.name.trim(), type: form.type!, breed: form.breed,
      size: form.size, age: form.age, notes: form.notes,
      service, addons, price, duration,
    };
    const newPets = [...data.pets, entry];
    onChange({ pets: newPets, ...calcTotals(newPets) });
    setForm({ ...BLANK_FORM });
    setFormErrors({});
    setShowForm(false);
    setStepError('');
  };

  // ── Remove pet ───────────────────────────────────────────────
  const removePet = (key: string) => {
    const newPets = data.pets.filter((p) => p.key !== key);
    onChange({ pets: newPets, ...calcTotals(newPets) });
  };

  // ── Change service level for an existing pet ─────────────────
  const changePetService = (key: string, service: ServiceLevel) => {
    const newPets = data.pets.map((p) => {
      if (p.key !== key) return p;
      const addons   = p.addons ?? [];
      const price    = getServicePrice(p.type, p.size, service) + calcAddonsPrice(addons, p.type);
      const duration = getServiceDurationV2(p.type, p.size, service) + calcAddonsDuration(addons);
      return { ...p, service, price, duration };
    });
    onChange({ pets: newPets, ...calcTotals(newPets) });
  };

  // ── Toggle add-on for an existing pet ────────────────────────
  const togglePetAddon = (key: string, addonKey: string) => {
    const newPets = data.pets.map((p) => {
      if (p.key !== key) return p;
      const addons   = applyAddonToggle(p.addons ?? [], addonKey);
      const price    = getServicePrice(p.type, p.size, p.service) + calcAddonsPrice(addons, p.type);
      const duration = getServiceDurationV2(p.type, p.size, p.service) + calcAddonsDuration(addons);
      return { ...p, addons, price, duration };
    });
    onChange({ pets: newPets, ...calcTotals(newPets) });
  };

  const handleNext = () => {
    if (data.pets.length === 0) {
      setStepError('Add at least one pet to continue');
      return;
    }
    onNext();
  };

  const breeds = form.type === 'CAT' ? CAT_BREEDS : DOG_BREEDS;
  const totals  = calcTotals(data.pets);

  // Unselected saved pets (not already in booking)
  const availableSavedPets = savedPets.filter((p) => !addedSavedIds.has(p.id));

  return (
    <div className="animate-fade-in space-y-5 pb-36">
      <div>
        <h2 className="font-bold text-2xl text-foreground">Who&apos;s getting groomed?</h2>
        <p className="text-muted-foreground text-sm mt-1">Add 1–5 pets. Each pet gets its own service.</p>
      </div>

      {/* ── Saved pets to quick-add ── */}
      {availableSavedPets.length > 0 && data.pets.length < 5 && (
        <div className="space-y-2">
          <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Your Saved Pets</p>
          <p className="text-xs text-muted-foreground">Tap to add to this booking</p>
          <div className="space-y-2 mt-1">
            {availableSavedPets.map((pet) => (
              <button key={pet.id} onClick={() => addSavedPet(pet)} className="w-full text-left">
                <div className="bg-card border border-border rounded-2xl flex items-center justify-between px-4 py-3.5 hover:border-primary/40 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      {pet.type === 'DOG'
                        ? <Dog size={19} className="text-primary" strokeWidth={2} />
                        : <Cat size={19} className="text-primary" strokeWidth={2} />}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground text-sm">{pet.name}</p>
                      <p className="text-xs text-muted-foreground">{pet.breed}{pet.size ? ` · ${pet.size}` : ''} · {pet.age}</p>
                    </div>
                  </div>
                  <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Plus size={15} className="text-primary" strokeWidth={2.5} />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Pets in this booking ── */}
      {data.pets.length > 0 && (
        <div className="space-y-2">
          <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
            Pets in This Booking ({data.pets.length})
          </p>
          <div className="space-y-3 mt-1">
            {data.pets.map((pet) => (
              <PetCard
                key={pet.key}
                pet={pet}
                onRemove={() => removePet(pet.key)}
                onServiceChange={(s) => changePetService(pet.key, s)}
                onAddonToggle={(a) => togglePetAddon(pet.key, a)}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── Add new pet button / form ── */}
      {data.pets.length < 5 && (
        <div>
          {!showForm ? (
            <button
              onClick={() => setShowForm(true)}
              className="w-full bg-card border border-dashed border-primary/40 rounded-2xl flex items-center gap-3 px-4 py-3.5 text-primary hover:bg-primary/5 transition-colors cursor-pointer"
            >
              <Plus size={17} strokeWidth={2.5} />
              <span className="font-semibold text-sm">Add{data.pets.length > 0 ? ' Another' : ' a'} Pet</span>
            </button>
          ) : (
            <div className="bg-card border border-border rounded-2xl p-4 space-y-4">
              <div className="flex items-center justify-between">
                <p className="font-bold text-sm text-foreground">New Pet Details</p>
                {data.pets.length > 0 && (
                  <button onClick={() => { setShowForm(false); setForm({ ...BLANK_FORM }); setFormErrors({}); }} className="text-xs text-muted-foreground hover:text-foreground">
                    Cancel
                  </button>
                )}
              </div>

              {/* Type */}
              <div className="space-y-2">
                <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Pet Type</p>
                <div className="grid grid-cols-2 gap-3">
                  {([['DOG', Dog, 'Dog', 'All breeds & sizes'], ['CAT', Cat, 'Cat', 'Short & long hair']] as const).map(
                    ([type, Icon, label, sub]) => (
                      <button
                        key={type}
                        onClick={() => updateForm({ type: type as PetType, size: type === 'CAT' ? null : form.size, breed: '' })}
                        className={`p-4 text-left rounded-xl border transition-all duration-150 ${
                          form.type === type
                            ? 'border-primary bg-primary/8'
                            : 'border-border hover:border-primary/40'
                        }`}
                      >
                        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                          <Icon size={18} className="text-primary" strokeWidth={2} />
                        </div>
                        <p className="font-bold text-foreground text-sm">{label}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{sub}</p>
                      </button>
                    )
                  )}
                </div>
                {formErrors.type && <p className="text-destructive text-xs">{formErrors.type}</p>}
              </div>

              {/* Size (dog only) */}
              {form.type === 'DOG' && (
                <div className="space-y-2">
                  <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Size</p>
                  <div className="grid grid-cols-4 gap-2">
                    {SIZES.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => updateForm({ size: s.id })}
                        className={`py-2.5 px-1 rounded-xl border text-center transition-all duration-150 ${
                          form.size === s.id
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-border text-foreground hover:border-primary/40 bg-card'
                        }`}
                      >
                        <span className="block text-xs font-bold">{s.label}</span>
                        <span className="block text-[9px] opacity-70 mt-0.5">{s.range}</span>
                      </button>
                    ))}
                  </div>
                  {formErrors.size && <p className="text-destructive text-xs">{formErrors.size}</p>}
                </div>
              )}

              {/* Name */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                  Pet&apos;s Name
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => updateForm({ name: e.target.value })}
                  placeholder="e.g. Buddy, Luna, Max…"
                  className={`input-field ${formErrors.name ? 'error' : ''}`}
                />
                {formErrors.name && <p className="text-destructive text-xs">{formErrors.name}</p>}
              </div>

              {/* Breed */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                  Breed
                </label>
                <select
                  value={form.breed}
                  onChange={(e) => updateForm({ breed: e.target.value })}
                  disabled={!form.type}
                  className={`flex h-11 w-full rounded-xl border bg-card px-4 py-2.5 text-sm text-foreground transition-colors focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50 ${formErrors.breed ? 'border-destructive' : 'border-border'}`}
                >
                  <option value="">Select breed…</option>
                  {breeds.map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
                {formErrors.breed && <p className="text-destructive text-xs">{formErrors.breed}</p>}
              </div>

              {/* Age */}
              <div className="space-y-1.5">
                <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Age</p>
                <div className="grid grid-cols-2 gap-2">
                  {PET_AGE_OPTIONS.map((age) => (
                    <button
                      key={age}
                      onClick={() => updateForm({ age })}
                      className={`py-2.5 px-3 rounded-xl border text-left text-xs font-semibold transition-all duration-150 ${
                        form.age === age
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border text-foreground hover:border-primary/40 bg-card'
                      }`}
                    >
                      {age}
                    </button>
                  ))}
                </div>
                {formErrors.age && <p className="text-destructive text-xs">{formErrors.age}</p>}
              </div>

              {/* Service */}
              <div className="space-y-1.5">
                <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Service</p>
                <div className="space-y-2">
                  {SERVICE_LEVELS.map((lvl) => {
                    const price    = (form.type && (form.type !== 'DOG' || form.size))
                      ? getServicePrice(form.type, form.size, lvl.key)
                      : null;
                    const duration = (form.type && (form.type !== 'DOG' || form.size))
                      ? getServiceDurationV2(form.type, form.size, lvl.key)
                      : null;
                    const selected = form.service === lvl.key;
                    return (
                      <button
                        key={lvl.key}
                        onClick={() => updateForm({ service: lvl.key })}
                        className={`w-full text-left rounded-xl border p-3.5 transition-all duration-150 ${
                          selected ? 'border-primary bg-primary/8' : 'border-border hover:border-primary/40 bg-card'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-sm text-foreground">{lvl.label}</p>
                            {'popular' in lvl && lvl.popular && (
                              <span className="text-[9px] font-bold uppercase tracking-wider bg-primary/15 text-primary px-2 py-0.5 rounded-full border border-primary/20">
                                Popular
                              </span>
                            )}
                          </div>
                          <div className="text-right">
                            {price !== null
                              ? <p className="font-bold text-sm text-foreground">AED {price}</p>
                              : <p className="text-xs text-muted-foreground">Select type</p>
                            }
                            {duration !== null && (
                              <p className="text-[10px] text-muted-foreground">~{formatDuration(duration)}</p>
                            )}
                          </div>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-1">{lvl.tagline}</p>
                        {selected && (
                          <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
                            {lvl.includes.map((inc) => (
                              <span key={inc} className="flex items-center gap-1 text-[10px] text-foreground">
                                <Check size={9} strokeWidth={3} className="text-primary flex-shrink-0" />
                                {inc}
                              </span>
                            ))}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Add-ons */}
              <div className="space-y-2">
                <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                  Add-ons <span className="normal-case font-normal">(optional)</span>
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {ADDONS.map((addon) => {
                    const selected   = form.addons.includes(addon.key);
                    const addonPrice = form.type === 'CAT' ? addon.priceCat : addon.priceDog;
                    return (
                      <button
                        key={addon.key}
                        type="button"
                        onClick={() => updateForm({ addons: applyAddonToggle(form.addons, addon.key) })}
                        className={`text-left p-3 rounded-xl border transition-all duration-150 ${
                          selected ? 'border-primary bg-primary/8' : 'border-border hover:border-primary/40 bg-card'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-1">
                          <p className="text-xs font-semibold text-foreground leading-tight">{addon.label}</p>
                          <p className={`text-xs font-bold flex-shrink-0 ${selected ? 'text-primary' : 'text-muted-foreground'}`}>
                            +{addonPrice}
                          </p>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{addon.description}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Notes */}
              <details className="group">
                <summary className="cursor-pointer text-xs font-bold text-primary uppercase tracking-wide list-none flex items-center gap-1.5">
                  <Plus size={13} strokeWidth={3} className="group-open:rotate-45 transition-transform duration-200" />
                  Special requirements (optional)
                </summary>
                <div className="mt-3">
                  <Textarea
                    value={form.notes}
                    onChange={(e) => updateForm({ notes: e.target.value })}
                    placeholder="Allergies, anxiety, specific instructions…"
                    rows={3}
                  />
                </div>
              </details>

              <button
                onClick={handleAddPet}
                className="w-full bg-primary text-primary-foreground h-11 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
              >
                <Plus size={16} strokeWidth={2.5} />
                Add Pet
              </button>
            </div>
          )}
        </div>
      )}

      {stepError && (
        <p className="text-destructive text-sm font-medium">{stepError}</p>
      )}

      {/* Running total + continue */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur-sm border-t border-border z-20">
        <div className="max-w-lg mx-auto space-y-2">
          {data.pets.length > 0 && (
            <div className="flex items-center justify-between text-sm px-1">
              <span className="text-muted-foreground font-medium">
                {data.pets.length} pet{data.pets.length > 1 ? 's' : ''} · ~{formatDuration(totals.duration)}
              </span>
              <span className="font-bold text-foreground">AED {totals.price}</span>
            </div>
          )}
          <button
            onClick={handleNext}
            className="w-full bg-primary text-primary-foreground h-12 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
          >
            Continue to Time Selection
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Pet card (already in booking) ──────────────────────────────
function PetCard({
  pet,
  onRemove,
  onServiceChange,
  onAddonToggle,
}: {
  pet: BookingPetEntry;
  onRemove: () => void;
  onServiceChange: (s: ServiceLevel) => void;
  onAddonToggle: (addonKey: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      {/* Header row */}
      <div className="flex items-center gap-3 px-4 py-3.5">
        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
          {pet.type === 'DOG'
            ? <Dog size={17} className="text-primary" strokeWidth={2} />
            : <Cat size={17} className="text-primary" strokeWidth={2} />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-foreground text-sm">{pet.name}</p>
          <p className="text-[11px] text-muted-foreground truncate">
            {pet.breed}{pet.size ? ` · ${pet.size}` : ''}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setExpanded((v) => !v)}
            className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          >
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          <button
            onClick={onRemove}
            className="w-7 h-7 rounded-lg bg-destructive/10 flex items-center justify-center text-destructive hover:bg-destructive/20 transition-colors"
          >
            <Trash2 size={13} strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* Service selector row */}
      <div className="px-4 pb-3">
        <div className="grid grid-cols-3 gap-1.5">
          {SERVICE_LEVELS.map((lvl) => {
            const price    = getServicePrice(pet.type, pet.size, lvl.key);
            const selected = pet.service === lvl.key;
            return (
              <button
                key={lvl.key}
                onClick={() => onServiceChange(lvl.key)}
                className={`relative py-2.5 px-2 rounded-xl border text-center transition-all duration-150 ${
                  selected ? 'border-primary bg-primary text-primary-foreground' : 'border-border hover:border-primary/40 bg-background text-foreground'
                }`}
              >
                {'popular' in lvl && lvl.popular && !selected && (
                  <span className="absolute -top-1.5 left-1/2 -translate-x-1/2">
                    <Star size={8} className="text-primary fill-primary" />
                  </span>
                )}
                <span className="block text-[10px] font-bold leading-tight">{lvl.label}</span>
                <span className={`block text-[9px] mt-0.5 font-semibold ${selected ? 'text-primary-foreground/80' : 'text-primary'}`}>
                  AED {price}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Add-ons section */}
      <div className="px-4 pb-3 border-t border-border/50 pt-2.5">
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">
          Add-ons
          {(pet.addons ?? []).length > 0 && (
            <span className="ml-1 text-primary normal-case font-semibold">
              · +AED {calcAddonsPrice(pet.addons ?? [], pet.type)}
            </span>
          )}
        </p>
        <div className="grid grid-cols-2 gap-1.5">
          {ADDONS.map((addon) => {
            const selected   = (pet.addons ?? []).includes(addon.key);
            const addonPrice = pet.type === 'CAT' ? addon.priceCat : addon.priceDog;
            return (
              <button
                key={addon.key}
                type="button"
                onClick={() => onAddonToggle(addon.key)}
                className={`text-left px-2.5 py-2 rounded-xl border transition-all duration-150 ${
                  selected ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/40 bg-background'
                }`}
              >
                <div className="flex items-start justify-between gap-1">
                  <span className="text-[10px] font-semibold text-foreground leading-tight">{addon.label}</span>
                  <span className={`text-[10px] font-bold flex-shrink-0 ${selected ? 'text-primary' : 'text-muted-foreground'}`}>
                    +{addonPrice}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="border-t border-border px-4 py-3">
          <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-[11px]">
            <span className="text-muted-foreground">Service: <span className="text-foreground font-semibold">{SERVICE_LEVELS.find((l) => l.key === pet.service)?.label}</span></span>
            <span className="text-muted-foreground">Duration: <span className="text-foreground font-semibold">~{formatDuration(pet.duration)}</span></span>
            <span className="text-muted-foreground">Price: <span className="text-foreground font-semibold">AED {pet.price}</span></span>
            {pet.age && <span className="text-muted-foreground">Age: <span className="text-foreground font-semibold">{pet.age}</span></span>}
          </div>
          {pet.notes && (
            <p className="mt-2 text-[11px] text-muted-foreground italic">{pet.notes}</p>
          )}
        </div>
      )}
    </div>
  );
}

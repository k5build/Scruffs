'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, ToggleLeft, ToggleRight, Pencil, X, Check } from 'lucide-react';

interface Promotion {
  id: string;
  title: string;
  subtitle: string | null;
  ctaText: string;
  ctaUrl: string;
  bgColor: string;
  textColor: string;
  active: boolean;
  priority: number;
  createdAt: string;
}

const BLANK: Omit<Promotion, 'id' | 'createdAt'> = {
  title: '',
  subtitle: '',
  ctaText: 'Book Now',
  ctaUrl: '/book',
  bgColor: '#3A4F4A',
  textColor: '#DBD4C7',
  active: true,
  priority: 0,
};

export default function AdminPromotionsPage() {
  const [promos,  setPromos]  = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [form,    setForm]    = useState<typeof BLANK & { id?: string }>(BLANK);
  const [editing, setEditing] = useState(false);
  const [saving,  setSaving]  = useState(false);
  const [msg,     setMsg]     = useState('');

  const load = async () => {
    setLoading(true);
    const res = await fetch('/api/admin/promotions');
    const d   = await res.json();
    setPromos(d.promotions ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form.title) return;
    setSaving(true);
    setMsg('');
    const body = form.id ? { action: 'update', ...form } : form;
    const res = await fetch('/api/admin/promotions', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(body),
    });
    if (res.ok) { setMsg('Saved!'); setEditing(false); setForm(BLANK); load(); }
    else { setMsg('Error saving'); }
    setSaving(false);
  };

  const toggle = async (id: string) => {
    await fetch('/api/admin/promotions', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ action: 'toggle', id }),
    });
    load();
  };

  const del = async (id: string) => {
    if (!confirm('Delete this promotion?')) return;
    await fetch('/api/admin/promotions', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ action: 'delete', id }),
    });
    load();
  };

  const edit = (p: Promotion) => {
    setForm({ ...p, subtitle: p.subtitle ?? '' });
    setEditing(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Promotions</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Manage banners shown on the home page</p>
        </div>
        <button
          onClick={() => { setForm(BLANK); setEditing(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-bold hover:opacity-90 transition-opacity"
        >
          <Plus size={15} /> New Promotion
        </button>
      </div>

      {/* Form */}
      {editing && (
        <div className="bg-card rounded-2xl border border-border p-5 space-y-4">
          <div className="flex items-center justify-between">
            <p className="font-bold text-foreground">{form.id ? 'Edit Promotion' : 'New Promotion'}</p>
            <button
              onClick={() => { setEditing(false); setForm(BLANK); }}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-xs font-bold text-muted-foreground mb-1 block uppercase tracking-wide">Title *</label>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. 20% Off This Weekend!"
                className="input-field"
              />
            </div>
            <div className="col-span-2">
              <label className="text-xs font-bold text-muted-foreground mb-1 block uppercase tracking-wide">Subtitle</label>
              <input
                value={form.subtitle ?? ''}
                onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                placeholder="e.g. Book before Sunday — limited slots"
                className="input-field"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground mb-1 block uppercase tracking-wide">Button Text</label>
              <input
                value={form.ctaText}
                onChange={(e) => setForm({ ...form, ctaText: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground mb-1 block uppercase tracking-wide">Button URL</label>
              <input
                value={form.ctaUrl}
                onChange={(e) => setForm({ ...form, ctaUrl: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground mb-1 block uppercase tracking-wide">Background Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={form.bgColor}
                  onChange={(e) => setForm({ ...form, bgColor: e.target.value })}
                  className="w-10 h-10 rounded-lg border border-border cursor-pointer"
                />
                <input
                  value={form.bgColor}
                  onChange={(e) => setForm({ ...form, bgColor: e.target.value })}
                  className="input-field font-mono"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground mb-1 block uppercase tracking-wide">Text Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={form.textColor}
                  onChange={(e) => setForm({ ...form, textColor: e.target.value })}
                  className="w-10 h-10 rounded-lg border border-border cursor-pointer"
                />
                <input
                  value={form.textColor}
                  onChange={(e) => setForm({ ...form, textColor: e.target.value })}
                  className="input-field font-mono"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground mb-1 block uppercase tracking-wide">Priority (higher = first)</label>
              <input
                type="number"
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: parseInt(e.target.value) || 0 })}
                className="input-field"
              />
            </div>
            <div className="flex items-center gap-2 pt-5">
              <input
                type="checkbox"
                id="active"
                checked={form.active}
                onChange={(e) => setForm({ ...form, active: e.target.checked })}
                className="w-4 h-4 accent-primary"
              />
              <label htmlFor="active" className="text-sm font-medium text-foreground">Active (visible on home page)</label>
            </div>
          </div>

          {/* Preview */}
          <div className="rounded-xl p-4" style={{ backgroundColor: form.bgColor }}>
            <p className="font-black text-lg" style={{ color: form.textColor }}>{form.title || 'Title preview'}</p>
            {form.subtitle && <p className="text-sm mt-1 opacity-75" style={{ color: form.textColor }}>{form.subtitle}</p>}
            <button className="mt-3 text-xs font-bold px-3 py-1.5 rounded-lg" style={{ backgroundColor: form.textColor, color: form.bgColor }}>
              {form.ctaText}
            </button>
          </div>

          {msg && <p className="text-sm font-medium text-green-600">{msg}</p>}

          <div className="flex gap-3">
            <button
              onClick={save}
              disabled={saving || !form.title}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-bold hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              <Check size={14} /> {saving ? 'Saving...' : 'Save Promotion'}
            </button>
            <button
              onClick={() => { setEditing(false); setForm(BLANK); }}
              className="px-5 py-2.5 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Promotions list */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : promos.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-lg mb-2">No promotions yet</p>
          <p className="text-sm">Create your first promotion to show it on the home page</p>
        </div>
      ) : (
        <div className="space-y-3">
          {promos.map((p) => (
            <div key={p.id} className="bg-card rounded-2xl border border-border overflow-hidden">
              <div className="flex items-center gap-4 p-4">
                <div className="w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center" style={{ backgroundColor: p.bgColor }}>
                  <span className="text-[10px] font-bold" style={{ color: p.textColor }}>{p.priority}</span>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-bold text-foreground text-sm">{p.title}</p>
                  {p.subtitle && <p className="text-xs text-muted-foreground truncate">{p.subtitle}</p>}
                  <p className="text-xs text-muted-foreground mt-0.5">{p.ctaText} · {p.ctaUrl}</p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${p.active ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-muted text-muted-foreground border border-border'}`}>
                    {p.active ? 'Live' : 'Off'}
                  </span>
                  <button onClick={() => toggle(p.id)} className="text-muted-foreground hover:text-foreground transition-colors">
                    {p.active
                      ? <ToggleRight size={22} className="text-green-600" />
                      : <ToggleLeft size={22} />
                    }
                  </button>
                  <button onClick={() => edit(p)} className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted transition-colors">
                    <Pencil size={15} />
                  </button>
                  <button onClick={() => del(p.id)} className="text-muted-foreground hover:text-destructive p-1 rounded-lg hover:bg-destructive/10 transition-colors">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

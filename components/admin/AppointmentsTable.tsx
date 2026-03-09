'use client';

import { useState } from 'react';
import {
  Dog, Cat, MessageCircle, FileText, ClipboardList,
  X, MapPin, Phone, Calendar, Clock, Package, Trash2,
} from 'lucide-react';
import { formatDate, formatTime, formatPrice } from '@/lib/utils';

interface Slot { id: string; date: string; startTime: string; endTime: string; }

interface PetEntry {
  name: string; type: string; breed: string; size?: string | null;
  age: string; notes?: string; service: string; addons: string[];
  price: number; duration: number;
}

interface Booking {
  id: string; bookingRef: string; petName: string; petType: string;
  petBreed: string; service: string; price: number; duration: number;
  area: string; address: string; buildingNote?: string; mapsLink?: string;
  ownerName: string; ownerPhone: string; ownerEmail?: string;
  status: string; paymentStatus: string; pets: string; addons: string;
  loyaltyPointsEarned: number; slot: Slot; adminNotes?: string; createdAt: string;
}

interface Props {
  bookings: Booking[];
  onUpdate: (id: string, status: string) => void;
  onNotes:  (id: string, notes: string) => void;
  onDelete: (id: string) => void;
}

const STATUS_CFG: Record<string, { dot: string; bg: string; text: string; label: string }> = {
  PENDING:     { dot: '#f59e0b', bg: 'rgba(245,158,11,0.1)',  text: '#92400e', label: 'Pending'     },
  CONFIRMED:   { dot: '#3b82f6', bg: 'rgba(59,130,246,0.1)',  text: '#1e40af', label: 'Confirmed'   },
  IN_PROGRESS: { dot: '#8b5cf6', bg: 'rgba(139,92,246,0.1)',  text: '#5b21b6', label: 'In Progress' },
  COMPLETED:   { dot: '#10b981', bg: 'rgba(16,185,129,0.1)',  text: '#065f46', label: 'Completed'   },
  CANCELLED:   { dot: '#ef4444', bg: 'rgba(239,68,68,0.1)',   text: '#991b1b', label: 'Cancelled'   },
};

const PAY_CFG: Record<string, { bg: string; text: string }> = {
  UNPAID:   { bg: 'rgba(245,158,11,0.1)',  text: '#92400e' },
  PAID:     { bg: 'rgba(16,185,129,0.1)',  text: '#065f46' },
  REFUNDED: { bg: 'rgba(59,130,246,0.1)',  text: '#1e40af' },
};

const STATUS_OPTIONS = ['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];

function parsePets(raw: string): PetEntry[] {
  try { const p = JSON.parse(raw); return Array.isArray(p) && p.length > 0 ? p : []; }
  catch { return []; }
}

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CFG[status];
  if (!cfg) return <span className="text-xs text-muted-foreground">{status}</span>;
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-lg"
      style={{ background: cfg.bg, color: cfg.text }}>
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: cfg.dot }} />
      {cfg.label}
    </span>
  );
}

function BookingDetailModal({ booking, onClose, onUpdate, onNotes, onDelete }: {
  booking: Booking; onClose: () => void;
  onUpdate: (id: string, status: string) => void;
  onNotes:  (id: string, notes: string) => void;
  onDelete: (id: string) => void;
}) {
  const [notes,  setNotes]  = useState(booking.adminNotes ?? '');
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);
  const pets = parsePets(booking.pets);

  const saveNotes = async () => {
    setSaving(true);
    await onNotes(booking.id, notes);
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleDelete = () => {
    if (!confirm(`Delete booking ${booking.bookingRef}? This cannot be undone.`)) return;
    onDelete(booking.id); onClose();
  };

  const cfg = STATUS_CFG[booking.status];
  const pay = PAY_CFG[booking.paymentStatus];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}>
      <div
        className="bg-card rounded-3xl w-full max-w-2xl max-h-[92vh] overflow-hidden border border-border flex flex-col"
        style={{ boxShadow: '0 32px 64px rgba(0,0,0,0.2)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-border">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(58,79,74,0.1)' }}>
              {booking.petType === 'DOG'
                ? <Dog size={18} strokeWidth={2} style={{ color: '#3A4F4A' }} />
                : <Cat size={18} strokeWidth={2} style={{ color: '#3A4F4A' }} />}
            </div>
            <div>
              <p className="font-mono text-[10px] text-muted-foreground tracking-wider">{booking.bookingRef}</p>
              <h3 className="font-black text-foreground text-lg leading-tight">{booking.ownerName}</h3>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={booking.status} />
            <button onClick={onClose}
              className="text-muted-foreground hover:text-foreground p-1.5 rounded-lg hover:bg-muted transition-all duration-150 ml-1">
              <X size={17} />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto flex-1">
          <div className="p-6 space-y-5">

            {/* Status + Payment controls */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground font-medium">Status</span>
                <select
                  value={booking.status}
                  onChange={(e) => onUpdate(booking.id, e.target.value)}
                  className="text-xs font-semibold rounded-lg px-2.5 py-1.5 border border-border bg-card cursor-pointer outline-none focus:ring-2 focus:ring-[#3A4F4A]/20 transition-all"
                >
                  {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              {pay && (
                <span className="inline-flex items-center text-[11px] font-semibold px-2.5 py-1 rounded-lg"
                  style={{ background: pay.bg, color: pay.text }}>
                  {booking.paymentStatus}
                </span>
              )}
              {booking.loyaltyPointsEarned > 0 && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-lg"
                  style={{ background: 'rgba(58,79,74,0.1)', color: '#3A4F4A' }}>
                  +{booking.loyaltyPointsEarned} pts
                </span>
              )}
            </div>

            {/* Info grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Owner */}
              <div className="bg-muted/40 border border-border/60 rounded-2xl p-4 space-y-2.5">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Owner</p>
                <p className="font-semibold text-foreground text-sm">{booking.ownerName}</p>
                <a href={`tel:${booking.ownerPhone}`}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  onClick={(e) => e.stopPropagation()}>
                  <Phone size={12} /> {booking.ownerPhone}
                </a>
                {booking.ownerEmail && <p className="text-xs text-muted-foreground">{booking.ownerEmail}</p>}
              </div>

              {/* Appointment */}
              <div className="bg-muted/40 border border-border/60 rounded-2xl p-4 space-y-2.5">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Appointment</p>
                <div className="flex items-center gap-2 text-sm text-foreground">
                  <Calendar size={13} className="text-muted-foreground flex-shrink-0" />
                  {formatDate(booking.slot.date)}
                </div>
                <div className="flex items-center gap-2 text-sm text-foreground">
                  <Clock size={13} className="text-muted-foreground flex-shrink-0" />
                  {formatTime(booking.slot.startTime)} – {formatTime(booking.slot.endTime)}
                  <span className="text-muted-foreground text-xs">({booking.duration} min)</span>
                </div>
                <div className="flex items-start gap-2 text-sm text-foreground">
                  <MapPin size={13} className="text-muted-foreground flex-shrink-0 mt-0.5" />
                  <span className="text-xs">{booking.area} — {booking.address}</span>
                </div>
                {booking.mapsLink && (
                  <a href={booking.mapsLink} target="_blank" rel="noopener noreferrer"
                    className="text-[11px] font-semibold underline underline-offset-2 text-[#3A4F4A] hover:opacity-70 transition-opacity">
                    Open in Maps
                  </a>
                )}
              </div>
            </div>

            {/* Pets */}
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">
                Pets ({pets.length || 1})
              </p>
              <div className="space-y-2">
                {pets.length > 0 ? pets.map((pet, i) => (
                  <div key={i} className="bg-card border border-border rounded-2xl p-4">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(58,79,74,0.08)' }}>
                          {pet.type === 'DOG'
                            ? <Dog size={14} strokeWidth={2} style={{ color: '#3A4F4A' }} />
                            : <Cat size={14} strokeWidth={2} style={{ color: '#3A4F4A' }} />}
                        </div>
                        <div>
                          <p className="font-bold text-foreground text-sm">{pet.name}</p>
                          <p className="text-[11px] text-muted-foreground">{pet.breed}{pet.size ? ` · ${pet.size}` : ''} · {pet.age}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black" style={{ color: '#3A4F4A' }}>{formatPrice(pet.price)}</p>
                        <p className="text-[11px] text-muted-foreground">{pet.duration} min</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-lg" style={{ background: 'rgba(58,79,74,0.1)', color: '#3A4F4A' }}>
                        {pet.service}
                      </span>
                      {pet.addons?.map((a) => (
                        <span key={a} className="text-[11px] px-2 py-0.5 rounded-lg bg-muted text-muted-foreground flex items-center gap-1">
                          <Package size={9} />{a}
                        </span>
                      ))}
                    </div>
                    {pet.notes && <p className="text-xs text-muted-foreground mt-2 italic">"{pet.notes}"</p>}
                  </div>
                )) : (
                  <div className="bg-card border border-border rounded-2xl p-4">
                    <div className="flex items-center gap-2.5 mb-2">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(58,79,74,0.08)' }}>
                        {booking.petType === 'DOG' ? <Dog size={14} strokeWidth={2} style={{ color: '#3A4F4A' }} /> : <Cat size={14} strokeWidth={2} style={{ color: '#3A4F4A' }} />}
                      </div>
                      <div>
                        <p className="font-bold text-foreground text-sm">{booking.petName}</p>
                        <p className="text-[11px] text-muted-foreground">{booking.petBreed}</p>
                      </div>
                    </div>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-lg" style={{ background: 'rgba(58,79,74,0.1)', color: '#3A4F4A' }}>
                      {booking.service}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between px-1 pt-1">
                  <span className="text-sm font-semibold text-foreground">Total</span>
                  <span className="text-lg font-black" style={{ color: '#3A4F4A' }}>{formatPrice(booking.price)}</span>
                </div>
              </div>
            </div>

            {/* Admin Notes */}
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Admin Notes</p>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="input-field resize-none text-sm"
                placeholder="Internal notes visible only to admin..."
              />
              <div className="flex gap-2 mt-2.5 flex-wrap">
                <button
                  onClick={saveNotes}
                  disabled={saving}
                  className="px-4 py-2 rounded-xl text-sm font-bold text-white transition-all duration-200 disabled:opacity-50"
                  style={{ background: saved ? '#10b981' : '#3A4F4A' }}
                >
                  {saving ? 'Saving…' : saved ? 'Saved!' : 'Save Notes'}
                </button>
                <a
                  href={`https://wa.me/${booking.ownerPhone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi ${booking.ownerName}! This is Scruffs.ae regarding booking ${booking.bookingRef}.`)}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-white transition-all duration-200 hover:-translate-y-px"
                  style={{ background: '#25d366' }}
                >
                  <MessageCircle size={13} /> WhatsApp
                </a>
                <button
                  onClick={handleDelete}
                  className="ml-auto flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 hover:bg-red-600 hover:text-white"
                  style={{ background: 'rgba(239,68,68,0.1)', color: '#991b1b' }}
                >
                  <Trash2 size={13} /> Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AppointmentsTable({ bookings, onUpdate, onNotes, onDelete }: Props) {
  const [detail, setDetail] = useState<Booking | null>(null);

  if (bookings.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
          <ClipboardList size={24} className="text-muted-foreground" strokeWidth={1.5} />
        </div>
        <p className="font-bold text-foreground text-sm">No appointments found</p>
        <p className="text-muted-foreground text-xs mt-1">Try adjusting your filters</p>
      </div>
    );
  }

  return (
    <>
      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="admin-table">
          <thead>
            <tr>
              {['Ref', 'Pet', 'Service', 'Date & Time', 'Location', 'Owner', 'Status', ''].map((h) => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => {
              const pets = parsePets(b.pets);
              const petCount = pets.length || 1;
              return (
                <tr key={b.id} className="cursor-pointer group" onClick={() => setDetail(b)}>
                  <td className="font-mono text-[11px] text-muted-foreground">{b.bookingRef}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all group-hover:scale-110" style={{ background: 'rgba(58,79,74,0.08)' }}>
                        {b.petType === 'DOG'
                          ? <Dog size={13} strokeWidth={2} style={{ color: '#3A4F4A' }} />
                          : <Cat size={13} strokeWidth={2} style={{ color: '#3A4F4A' }} />}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground text-sm flex items-center gap-1.5">
                          {pets.length > 0 ? pets[0].name : b.petName}
                          {petCount > 1 && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md" style={{ background: 'rgba(58,79,74,0.1)', color: '#3A4F4A' }}>
                              +{petCount - 1}
                            </span>
                          )}
                        </p>
                        <p className="text-[11px] text-muted-foreground">{b.petBreed}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <p className="font-medium text-foreground text-xs">{b.service}</p>
                    <p className="text-xs font-bold" style={{ color: '#3A4F4A' }}>{formatPrice(b.price)}</p>
                  </td>
                  <td>
                    <p className="text-sm text-foreground font-medium">{b.slot.date}</p>
                    <p className="text-[11px] text-muted-foreground">{formatTime(b.slot.startTime)}</p>
                  </td>
                  <td>
                    <p className="font-medium text-foreground text-sm">{b.area}</p>
                    <p className="text-[11px] text-muted-foreground max-w-[120px] truncate">{b.address}</p>
                  </td>
                  <td>
                    <p className="font-medium text-foreground text-sm">{b.ownerName}</p>
                    <a href={`tel:${b.ownerPhone}`}
                      className="text-[11px] text-muted-foreground hover:text-foreground transition-colors"
                      onClick={(e) => e.stopPropagation()}>
                      {b.ownerPhone}
                    </a>
                  </td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <select
                      value={b.status}
                      onChange={(e) => onUpdate(b.id, e.target.value)}
                      className="text-[11px] font-semibold rounded-lg px-2 py-1 border-0 cursor-pointer outline-none"
                      style={STATUS_CFG[b.status] ? {
                        background: STATUS_CFG[b.status].bg,
                        color: STATUS_CFG[b.status].text,
                      } : {}}
                    >
                      {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-1">
                      <button onClick={() => setDetail(b)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-150" title="Details">
                        <FileText size={14} />
                      </button>
                      <a
                        href={`https://wa.me/${b.ownerPhone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi ${b.ownerName}! This is Scruffs.ae regarding booking ${b.bookingRef}.`)}`}
                        target="_blank" rel="noopener noreferrer"
                        className="p-1.5 rounded-lg transition-all duration-150 hover:bg-[#25d366]/10"
                        style={{ color: '#25d366' }} title="WhatsApp">
                        <MessageCircle size={14} />
                      </a>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3 p-4">
        {bookings.map((b) => {
          const pets = parsePets(b.pets);
          const cfg = STATUS_CFG[b.status];
          return (
            <div key={b.id}
              onClick={() => setDetail(b)}
              className="bg-card rounded-2xl border border-border overflow-hidden active:scale-[0.98] transition-transform duration-100 cursor-pointer">
              <div className="flex items-center justify-between p-3.5 border-b border-border">
                <div>
                  <p className="font-mono text-[10px] text-muted-foreground">{b.bookingRef}</p>
                  <p className="font-bold text-foreground text-sm flex items-center gap-1.5 mt-0.5">
                    {b.petType === 'DOG' ? <Dog size={13} strokeWidth={2} /> : <Cat size={13} strokeWidth={2} />}
                    {pets.length > 0 ? pets.map(p => p.name).join(', ') : b.petName}
                  </p>
                </div>
                {cfg && (
                  <span className="flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-lg"
                    style={{ background: cfg.bg, color: cfg.text }}>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: cfg.dot }} />
                    {cfg.label}
                  </span>
                )}
              </div>
              <div className="p-3.5 grid grid-cols-2 gap-2 text-xs">
                <div><p className="text-muted-foreground">Service</p><p className="font-semibold text-foreground mt-0.5">{b.service}</p></div>
                <div><p className="text-muted-foreground">Price</p><p className="font-bold mt-0.5" style={{ color: '#3A4F4A' }}>{formatPrice(b.price)}</p></div>
                <div><p className="text-muted-foreground">Date</p><p className="font-semibold text-foreground mt-0.5">{b.slot.date}</p></div>
                <div><p className="text-muted-foreground">Time</p><p className="font-semibold text-foreground mt-0.5">{formatTime(b.slot.startTime)}</p></div>
                <div><p className="text-muted-foreground">Owner</p><p className="font-semibold text-foreground mt-0.5">{b.ownerName}</p></div>
                <div><p className="text-muted-foreground">Area</p><p className="font-semibold text-foreground mt-0.5">{b.area}</p></div>
              </div>
            </div>
          );
        })}
      </div>

      {detail && (
        <BookingDetailModal
          booking={detail}
          onClose={() => setDetail(null)}
          onUpdate={(id, status) => { onUpdate(id, status); setDetail(prev => prev ? { ...prev, status } : null); }}
          onNotes={onNotes}
          onDelete={onDelete}
        />
      )}
    </>
  );
}

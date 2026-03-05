'use client';

import { useState } from 'react';
import { Dog, Cat } from 'lucide-react';
import { formatDate, formatTime, formatPrice } from '@/lib/utils';

interface Slot {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
}
interface Booking {
  id: string;
  bookingRef: string;
  petName: string;
  petType: string;
  petBreed: string;
  service: string;
  price: number;
  area: string;
  address: string;
  ownerName: string;
  ownerPhone: string;
  status: string;
  slot: Slot;
  adminNotes?: string;
  createdAt: string;
}

interface Props {
  bookings: Booking[];
  onUpdate: (id: string, status: string) => void;
  onNotes:  (id: string, notes: string) => void;
}

const STATUS_COLORS: Record<string, string> = {
  PENDING:     'badge-pending',
  CONFIRMED:   'badge-confirmed',
  IN_PROGRESS: 'badge-in_progress',
  COMPLETED:   'badge-completed',
  CANCELLED:   'badge-cancelled',
};

const STATUS_OPTIONS = ['PENDING','CONFIRMED','IN_PROGRESS','COMPLETED','CANCELLED'];

export default function AppointmentsTable({ bookings, onUpdate, onNotes }: Props) {
  const [notesModal, setNotesModal] = useState<{ id: string; notes: string } | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (bookings.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
        </div>
        <p className="font-medium text-gray-500">No appointments found</p>
      </div>
    );
  }

  return (
    <>
      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto rounded-2xl border border-gray-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              {['Ref','Pet','Service','Date & Time','Location','Owner','Status','Actions'].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {bookings.map((b) => (
              <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-gray-500 whitespace-nowrap">{b.bookingRef}</td>
                <td className="px-4 py-3">
                  <div className="font-semibold text-gray-900 flex items-center gap-1">
                    {b.petType === 'DOG' ? <Dog size={14} strokeWidth={2} /> : <Cat size={14} strokeWidth={2} />}
                    {b.petName}
                  </div>
                  <div className="text-xs text-gray-400">{b.petBreed}</div>
                </td>
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-900">{b.service}</div>
                  <div className="text-xs text-yellow-600 font-semibold">{formatPrice(b.price)}</div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="text-gray-900">{formatDate(b.slot.date).split(',')[0]}, {b.slot.date.split('-').slice(1).join('/')}</div>
                  <div className="text-xs text-gray-400">{formatTime(b.slot.startTime)} – {formatTime(b.slot.endTime)}</div>
                </td>
                <td className="px-4 py-3">
                  <div className="text-gray-900 font-medium">{b.area}</div>
                  <div className="text-xs text-gray-400 max-w-[140px] truncate">{b.address}</div>
                </td>
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-900">{b.ownerName}</div>
                  <a href={`tel:${b.ownerPhone}`} className="text-xs text-blue-500 hover:underline">{b.ownerPhone}</a>
                </td>
                <td className="px-4 py-3">
                  <select
                    value={b.status}
                    onChange={(e) => onUpdate(b.id, e.target.value)}
                    className={`text-xs font-semibold rounded-lg px-2 py-1 border ${STATUS_COLORS[b.status] ?? ''} cursor-pointer`}
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <a
                      href={`https://wa.me/${b.ownerPhone.replace(/\D/g, '')}?text=Hi%20${b.ownerName}!%20This%20is%20Scruffs.ae%20confirming%20your%20appointment%20for%20${b.petName}.`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-600 hover:text-green-700 p-1.5 rounded-lg hover:bg-green-50 transition-colors"
                      title="WhatsApp"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                    </a>
                    <button
                      onClick={() => setNotesModal({ id: b.id, notes: b.adminNotes ?? '' })}
                      className="text-gray-500 hover:text-gray-700 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                      title="Notes"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-4">
        {bookings.map((b) => (
          <div key={b.id} className="bg-white rounded-2xl border border-gray-200 shadow-card overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <div>
                <span className="font-mono text-xs text-gray-400">{b.bookingRef}</span>
                <p className="font-bold text-gray-900 flex items-center gap-1">
                  {b.petType === 'DOG' ? <Dog size={14} strokeWidth={2} /> : <Cat size={14} strokeWidth={2} />}
                  {b.petName}
                </p>
              </div>
              <select
                value={b.status}
                onChange={(e) => onUpdate(b.id, e.target.value)}
                className={`text-xs font-semibold rounded-lg px-2 py-1 border ${STATUS_COLORS[b.status] ?? ''}`}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="p-4 space-y-2 text-sm">
              <p><span className="text-gray-400">Service:</span> <span className="font-medium">{b.service} · {formatPrice(b.price)}</span></p>
              <p><span className="text-gray-400">Date:</span> <span className="font-medium">{b.slot.date} · {formatTime(b.slot.startTime)}</span></p>
              <p><span className="text-gray-400">Location:</span> <span className="font-medium">{b.area}, {b.address}</span></p>
              <p><span className="text-gray-400">Owner:</span> <span className="font-medium">{b.ownerName} · {b.ownerPhone}</span></p>
            </div>
          </div>
        ))}
      </div>

      {/* Notes modal */}
      {notesModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="font-bold text-gray-900 mb-3">Admin Notes</h3>
            <textarea
              value={notesModal.notes}
              onChange={(e) => setNotesModal({ ...notesModal, notes: e.target.value })}
              rows={4}
              className="input-field resize-none"
              placeholder="Internal notes about this appointment..."
            />
            <div className="flex gap-3 mt-4">
              <button onClick={() => setNotesModal(null)} className="flex-1 py-2 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50">
                Cancel
              </button>
              <button
                onClick={() => {
                  onNotes(notesModal.id, notesModal.notes);
                  setNotesModal(null);
                }}
                className="flex-1 py-2 rounded-xl btn-gold font-bold"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, RefreshCw, X, Download } from 'lucide-react';
import AppointmentsTable from '@/components/admin/AppointmentsTable';
import { formatTime, formatPrice } from '@/lib/utils';

const STATUS_OPTIONS = ['ALL', 'PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];

function exportToCSV(bookings: any[]) {
  const headers = ['Ref', 'Date', 'Time', 'Pet', 'Breed', 'Service', 'Price (AED)', 'Owner', 'Phone', 'Area', 'Address', 'Status', 'Payment'];
  const rows = bookings.map((b) => [
    b.bookingRef,
    b.slot.date,
    formatTime(b.slot.startTime),
    b.petName,
    b.petBreed,
    b.service,
    b.price,
    b.ownerName,
    b.ownerPhone,
    b.area,
    b.address,
    b.status,
    b.paymentStatus,
  ]);
  const csv = [headers, ...rows].map((r) => r.map((c: any) => `"${String(c ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `scruffs-bookings-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function AppointmentsPage() {
  const [bookings,     setBookings]     = useState<any[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [dateFilter,   setDateFilter]   = useState('');
  const [search,       setSearch]       = useState('');

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'ALL') params.set('status', statusFilter);
      if (dateFilter) params.set('date', dateFilter);
      const res = await fetch(`/api/admin/bookings?${params}`);
      if (!res.ok) throw new Error('Unauthorized');
      const { bookings: data } = await res.json();
      setBookings(data ?? []);
    } catch {
      window.location.href = '/admin/login';
    } finally {
      setLoading(false);
    }
  }, [statusFilter, dateFilter]);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  const handleUpdate = async (id: string, status: string) => {
    const res = await fetch(`/api/admin/bookings/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (res.ok) setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)));
  };

  const handleNotes = async (id: string, adminNotes: string) => {
    await fetch(`/api/admin/bookings/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminNotes }),
    });
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, adminNotes } : b)));
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/admin/bookings/${id}`, { method: 'DELETE' });
    if (res.ok) setBookings((prev) => prev.filter((b) => b.id !== id));
  };

  const filtered = bookings.filter((b) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      b.ownerName.toLowerCase().includes(q) ||
      b.petName.toLowerCase().includes(q) ||
      b.bookingRef.toLowerCase().includes(q) ||
      b.ownerPhone.includes(q) ||
      b.area.toLowerCase().includes(q)
    );
  });

  const hasFilters = statusFilter !== 'ALL' || dateFilter || search;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">Appointments</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {filtered.length} appointment{filtered.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => exportToCSV(filtered)}
            disabled={filtered.length === 0}
            className="flex items-center gap-2 px-3 py-2 bg-card border border-border rounded-xl text-sm font-medium text-foreground hover:bg-muted transition-colors disabled:opacity-40"
          >
            <Download size={14} /> Export CSV
          </button>
          <button
            onClick={fetchBookings}
            className="flex items-center gap-2 px-3 py-2 bg-card border border-border rounded-xl text-sm font-medium text-foreground hover:bg-muted transition-colors"
          >
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-2xl border border-border p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, ref, phone, area..."
              className="input-field pl-9"
            />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-field sm:w-44">
            {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s === 'ALL' ? 'All Statuses' : s}</option>)}
          </select>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="input-field sm:w-44"
          />
          {hasFilters && (
            <button
              onClick={() => { setStatusFilter('ALL'); setDateFilter(''); setSearch(''); }}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-card text-muted-foreground text-sm font-medium hover:bg-muted transition-colors whitespace-nowrap border border-border"
            >
              <X size={13} /> Clear
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="bg-card rounded-2xl border border-border p-16 text-center">
          <div className="inline-block w-8 h-8 border-4 border-[#3A4F4A] border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-muted-foreground text-sm">Loading appointments...</p>
        </div>
      ) : (
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <AppointmentsTable
            bookings={filtered}
            onUpdate={handleUpdate}
            onNotes={handleNotes}
            onDelete={handleDelete}
          />
        </div>
      )}
    </div>
  );
}

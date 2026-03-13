import { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { verifyAdminToken, ADMIN_COOKIE_NAME } from '@/lib/adminAuth';
import { format } from 'date-fns';
import { ShieldCheck } from 'lucide-react';

export const metadata: Metadata = { title: 'Audit Log – Scruffs Admin' };
export const dynamic = 'force-dynamic';

const PAGE_SIZE = 50;

function getActionBadge(action: string): { bg: string; text: string; label: string } {
  if (action.startsWith('login.success') || action.startsWith('admin.login')) {
    return { bg: 'rgba(16,185,129,0.12)', text: '#065f46', label: action };
  }
  if (action.includes('fail') || action.includes('invalid') || action.includes('rate_limit')) {
    return { bg: 'rgba(239,68,68,0.10)', text: '#991b1b', label: action };
  }
  if (action.startsWith('booking.')) {
    return { bg: 'rgba(59,130,246,0.10)', text: '#1e40af', label: action };
  }
  if (action.startsWith('loyalty.')) {
    return { bg: 'rgba(245,158,11,0.10)', text: '#92400e', label: action };
  }
  return { bg: 'rgba(163,192,190,0.12)', text: '#3A4F4A', label: action };
}

export default async function AuditLogPage({
  searchParams,
}: {
  searchParams: { page?: string; action?: string; actor?: string };
}) {
  // Auth check
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  if (!token || !(await verifyAdminToken(token))) {
    redirect('/admin/login');
  }

  const page   = Math.max(1, parseInt(searchParams.page ?? '1', 10));
  const action = searchParams.action ?? undefined;
  const actor  = searchParams.actor  ?? undefined;

  const where = {
    ...(action ? { action: { contains: action } } : {}),
    ...(actor  ? { actor:  { contains: actor  } } : {}),
  };

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip:    (page - 1) * PAGE_SIZE,
      take:    PAGE_SIZE,
    }),
    prisma.auditLog.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(163,192,190,0.15)' }}>
              <ShieldCheck size={16} strokeWidth={2} style={{ color: '#A3C0BE' }} />
            </div>
            <h1 className="text-2xl font-black text-foreground tracking-tight">Audit Log</h1>
          </div>
          <p className="text-muted-foreground text-sm">{total.toLocaleString()} total events · Page {page} of {totalPages}</p>
        </div>
      </div>

      {/* Filter bar */}
      <form className="flex flex-wrap gap-3">
        <input
          type="text"
          name="action"
          defaultValue={action}
          placeholder="Filter by action (e.g. booking.created)"
          className="flex-1 min-w-[200px] bg-card border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#A3C0BE]/30"
        />
        <input
          type="text"
          name="actor"
          defaultValue={actor}
          placeholder="Filter by actor (e.g. admin)"
          className="flex-1 min-w-[160px] bg-card border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#A3C0BE]/30"
        />
        <button
          type="submit"
          className="px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-200 hover:-translate-y-0.5"
          style={{ background: 'linear-gradient(135deg, #3A4F4A 0%, #2d5c54 100%)' }}
        >
          Filter
        </button>
        {(action || actor) && (
          <a
            href="/admin/audit"
            className="px-4 py-2.5 rounded-xl text-sm font-semibold text-muted-foreground border border-border bg-card hover:bg-muted transition-colors"
          >
            Clear
          </a>
        )}
      </form>

      {/* Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        {logs.length === 0 ? (
          <div className="p-14 text-center">
            <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-3">
              <ShieldCheck size={20} className="text-muted-foreground" strokeWidth={1.5} />
            </div>
            <p className="font-semibold text-foreground text-sm">No audit events</p>
            <p className="text-muted-foreground text-xs mt-1">Events will appear here as actions are performed</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-4 py-3 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Timestamp</th>
                  <th className="text-left px-4 py-3 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Action</th>
                  <th className="text-left px-4 py-3 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Actor</th>
                  <th className="text-left px-4 py-3 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Target</th>
                  <th className="text-left px-4 py-3 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">IP</th>
                  <th className="text-left px-4 py-3 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {logs.map((log) => {
                  const badge = getActionBadge(log.action);
                  let details: string | null = null;
                  if (log.details) {
                    try {
                      const parsed = JSON.parse(log.details);
                      details = Object.entries(parsed)
                        .map(([k, v]) => `${k}: ${String(v)}`)
                        .join(', ')
                        .slice(0, 120);
                    } catch {
                      details = log.details.slice(0, 120);
                    }
                  }

                  return (
                    <tr key={log.id} className="hover:bg-muted/40 transition-colors">
                      <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap font-mono">
                        {format(new Date(log.createdAt), 'dd MMM HH:mm:ss')}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="inline-block text-[11px] font-semibold px-2.5 py-0.5 rounded-lg whitespace-nowrap"
                          style={{ background: badge.bg, color: badge.text }}
                        >
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-foreground font-mono">
                        {log.actor ?? <span className="text-muted-foreground">—</span>}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground font-mono max-w-[140px] truncate">
                        {log.targetId ?? '—'}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground font-mono whitespace-nowrap">
                        {log.ip ?? '—'}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground max-w-[240px] truncate" title={details ?? undefined}>
                        {details ?? '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} of {total.toLocaleString()}
          </p>
          <div className="flex gap-2">
            {page > 1 && (
              <a
                href={`/admin/audit?page=${page - 1}${action ? `&action=${encodeURIComponent(action)}` : ''}${actor ? `&actor=${encodeURIComponent(actor)}` : ''}`}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-border bg-card hover:bg-muted transition-colors text-foreground"
              >
                Previous
              </a>
            )}
            {page < totalPages && (
              <a
                href={`/admin/audit?page=${page + 1}${action ? `&action=${encodeURIComponent(action)}` : ''}${actor ? `&actor=${encodeURIComponent(actor)}` : ''}`}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-border bg-card hover:bg-muted transition-colors text-foreground"
              >
                Next
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

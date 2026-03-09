'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Plus, Minus, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';

interface LoyaltyUser {
  id: string;
  name: string | null;
  phone: string | null;
  email: string | null;
  loyaltyPoints: number;
  loyaltyTier: string;
  loyaltyTransactions: Array<{
    id: string;
    points: number;
    reason: string;
    note: string | null;
    createdAt: string;
  }>;
}

const TIER_STYLES: Record<string, string> = {
  BRONZE: 'text-amber-700 bg-amber-50 border border-amber-200',
  SILVER: 'text-muted-foreground bg-muted border border-border',
  GOLD:   'text-primary bg-primary/10 border border-primary/20',
};

export default function AdminLoyaltyPage() {
  const [query,   setQuery]   = useState('');
  const [users,   setUsers]   = useState<LoyaltyUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [active,  setActive]  = useState<string | null>(null);
  const [pts,     setPts]     = useState('');
  const [note,    setNote]    = useState('');
  const [working, setWorking] = useState(false);
  const [msg,     setMsg]     = useState('');

  const search = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/loyalty?q=${encodeURIComponent(query)}`);
    const d   = await res.json();
    setUsers(d.users ?? []);
    setLoading(false);
  }, [query]);

  useEffect(() => { search(); }, [search]);

  const award = async (userId: string, positive: boolean) => {
    const p = parseInt(pts);
    if (!p || isNaN(p)) return;
    setWorking(true);
    setMsg('');
    const res = await fetch('/api/admin/loyalty', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        userId,
        points: positive ? p : -p,
        reason: positive ? 'ADMIN_AWARD' : 'ADMIN_DEDUCT',
        note:   note || undefined,
      }),
    });
    const d = await res.json();
    setMsg(res.ok ? `Done — new balance: ${d.newPoints} pts (${d.newTier})` : d.error);
    setPts('');
    setNote('');
    setWorking(false);
    if (res.ok) search();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Loyalty Points</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Search customers and manage their points</p>
        </div>
        <button
          onClick={search}
          className="flex items-center gap-2 px-3 py-2 bg-card border border-border rounded-xl text-sm font-medium text-foreground hover:bg-muted transition-colors"
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, phone, or email..."
          className="input-field pl-9"
        />
      </div>

      {/* Tier stats */}
      <div className="grid grid-cols-3 gap-4">
        {(['BRONZE', 'SILVER', 'GOLD'] as const).map((t) => (
          <div key={t} className="bg-card rounded-2xl border border-border p-4 text-center">
            <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full inline-block mb-2 ${TIER_STYLES[t]}`}>
              {t}
            </span>
            <p className="text-2xl font-bold text-foreground">
              {users.filter((u) => u.loyaltyTier === t).length}
            </p>
            <p className="text-xs text-muted-foreground">members</p>
          </div>
        ))}
      </div>

      {/* User list */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-3">
          {users.length === 0 && (
            <p className="text-center text-muted-foreground py-10">No users found</p>
          )}
          {users.map((u) => (
            <div key={u.id} className="bg-card rounded-2xl border border-border overflow-hidden">
              <button
                onClick={() => setActive(active === u.id ? null : u.id)}
                className="w-full flex items-center gap-4 px-4 py-4 text-left hover:bg-muted/50 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center font-bold text-primary text-sm flex-shrink-0">
                  {(u.name ?? u.phone ?? '?')[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-foreground text-sm">{u.name ?? '—'}</p>
                  <p className="text-xs text-muted-foreground truncate">{u.phone ?? u.email ?? '—'}</p>
                </div>
                <div className="text-right flex-shrink-0 mr-1">
                  <p className="font-bold text-foreground">{u.loyaltyPoints.toLocaleString()} pts</p>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${TIER_STYLES[u.loyaltyTier]}`}>
                    {u.loyaltyTier}
                  </span>
                </div>
                {active === u.id ? <ChevronUp size={16} className="text-muted-foreground flex-shrink-0" /> : <ChevronDown size={16} className="text-muted-foreground flex-shrink-0" />}
              </button>

              {active === u.id && (
                <div className="border-t border-border px-4 py-4 space-y-4 bg-muted/30">
                  {/* Award / deduct form */}
                  <div className="flex gap-2 flex-wrap">
                    <input
                      type="number"
                      value={pts}
                      onChange={(e) => setPts(e.target.value)}
                      placeholder="Points"
                      min="1"
                      className="input-field w-24"
                    />
                    <input
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Note (optional)"
                      className="input-field flex-1 min-w-[140px]"
                    />
                    <button
                      onClick={() => award(u.id, true)}
                      disabled={working}
                      className="flex items-center gap-1.5 px-3 py-2 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 disabled:opacity-50 transition-colors"
                    >
                      <Plus size={14} /> Award
                    </button>
                    <button
                      onClick={() => award(u.id, false)}
                      disabled={working}
                      className="flex items-center gap-1.5 px-3 py-2 bg-destructive text-destructive-foreground rounded-xl text-sm font-bold hover:opacity-90 disabled:opacity-50 transition-opacity"
                    >
                      <Minus size={14} /> Deduct
                    </button>
                  </div>

                  {msg && <p className="text-sm font-medium text-green-600">{msg}</p>}

                  {/* Transaction history */}
                  <div>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Recent Transactions</p>
                    {u.loyaltyTransactions.length === 0 ? (
                      <p className="text-xs text-muted-foreground">No transactions yet</p>
                    ) : (
                      <div className="space-y-1.5">
                        {u.loyaltyTransactions.map((tx) => (
                          <div key={tx.id} className="flex items-center justify-between text-xs">
                            <div>
                              <span className="font-medium text-foreground">{tx.reason}</span>
                              {tx.note && <span className="text-muted-foreground ml-1.5">{tx.note}</span>}
                            </div>
                            <span className={`font-bold ${tx.points > 0 ? 'text-green-600' : 'text-destructive'}`}>
                              {tx.points > 0 ? '+' : ''}{tx.points}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[Admin Error]', error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center max-w-sm">
        <div className="w-12 h-12 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle size={20} className="text-destructive" strokeWidth={1.5} />
        </div>
        <h2 className="text-base font-bold text-foreground mb-1">Page failed to load</h2>
        <p className="text-muted-foreground text-sm mb-5">
          {error.message ?? 'An unexpected error occurred.'}
        </p>
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={reset}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#3A4F4A] text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            <RefreshCw size={13} /> Retry
          </button>
          <Link
            href="/admin"
            className="flex items-center gap-1.5 px-4 py-2 bg-muted text-foreground rounded-xl text-sm font-semibold hover:bg-muted/80 transition-colors"
          >
            <ArrowLeft size={13} /> Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

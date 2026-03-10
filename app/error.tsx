'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[App Error]', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="text-center max-w-sm">
        <div className="w-14 h-14 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle size={24} className="text-destructive" strokeWidth={1.5} />
        </div>
        <h1 className="text-lg font-bold text-foreground mb-1">Something went wrong</h1>
        <p className="text-muted-foreground text-sm mb-6">
          An unexpected error occurred. Please try again.
        </p>
        <button
          onClick={reset}
          className="flex items-center gap-2 mx-auto px-5 py-2.5 bg-[#3A4F4A] text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          <RefreshCw size={14} /> Try again
        </button>
      </div>
    </div>
  );
}

'use client';

import { LogOut } from 'lucide-react';

export default function LogoutButton() {
  const handleLogout = async () => {
    await fetch('/api/admin/auth', { method: 'DELETE' });
    window.location.href = '/admin/login';
  };

  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive font-medium transition-colors"
    >
      <LogOut size={13} />
      Sign Out
    </button>
  );
}

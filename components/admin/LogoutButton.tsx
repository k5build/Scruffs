'use client';

export default function LogoutButton() {
  const handleLogout = async () => {
    await fetch('/api/admin/auth', { method: 'DELETE' });
    window.location.href = '/admin/login';
  };

  return (
    <button
      onClick={handleLogout}
      className="text-xs text-red-500 hover:text-red-700 font-medium transition-colors"
    >
      Sign Out
    </button>
  );
}

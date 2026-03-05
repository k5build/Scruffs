import type { Metadata } from 'next';
import Link from 'next/link';
import LogoutButton from '@/components/admin/LogoutButton';

export const metadata: Metadata = {
  title: 'Admin – Scruffs.ae',
  robots: 'noindex, nofollow',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-6">
              <Link href="/admin" className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-base shadow-gold">
                  🐾
                </div>
                <span className="font-display font-bold text-gray-900">
                  Scruffs<span className="text-yellow-500">.ae</span>
                </span>
                <span className="ml-1 text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium">
                  Admin
                </span>
              </Link>

              <nav className="hidden md:flex items-center gap-4 text-sm">
                <Link href="/admin" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
                  Dashboard
                </Link>
                <Link href="/admin/appointments" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
                  Appointments
                </Link>
                <Link href="/admin/slots" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
                  Manage Slots
                </Link>
              </nav>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/"
                target="_blank"
                className="text-xs text-gray-500 hover:text-gray-700 font-medium transition-colors"
              >
                View Site ↗
              </Link>
              <LogoutButton />
            </div>
          </div>
        </div>
      </header>

      {/* Page content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}

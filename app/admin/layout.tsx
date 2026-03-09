import type { Metadata } from 'next';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminMobileHeader from '@/components/admin/AdminMobileHeader';

export const metadata: Metadata = {
  title: 'Admin – Scruffs.ae',
  robots: 'noindex, nofollow',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen" style={{ background: 'hsl(var(--background))' }}>
      {/* Sidebar — desktop only */}
      <AdminSidebar />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Subtle top-right glow */}
        <div
          className="absolute top-0 right-0 w-96 h-96 pointer-events-none"
          style={{
            background: 'radial-gradient(circle at top right, rgba(163,192,190,0.07) 0%, transparent 65%)',
          }}
        />

        {/* Mobile top bar */}
        <AdminMobileHeader />

        <main className="flex-1 px-5 sm:px-8 py-7 relative">
          {children}
        </main>
      </div>
    </div>
  );
}

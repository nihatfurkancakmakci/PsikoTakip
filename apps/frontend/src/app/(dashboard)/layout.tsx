'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { User } from '@/types';

const clientNav = [
  { href: '/client', label: 'Ana Sayfa', icon: '🏠' },
  { href: '/client/appointments', label: 'Randevularım', icon: '📅' },
  { href: '/client/appointments/new', label: 'Randevu Al', icon: '➕' },
  { href: '/client/tests', label: 'Testlerim', icon: '🧪' },
  { href: '/client/sessions', label: 'Seans Notları', icon: '📝' },
  { href: '/client/progress', label: 'İlerleme Grafiğim', icon: '📊' },
  { href: '/client/notifications', label: 'Bildirimler', icon: '🔔' },
  { href: '/client/profile', label: 'Profilim', icon: '👤' },
];

const psychNav = [
  { href: '/psychologist', label: 'Ana Sayfa', icon: '🏠' },
  { href: '/psychologist/appointments', label: 'Randevular', icon: '📅' },
  { href: '/psychologist/clients', label: 'Danışanlar', icon: '👥' },
  { href: '/psychologist/tests', label: 'Testler', icon: '🧪' },
  { href: '/psychologist/notifications', label: 'Bildirimler', icon: '🔔' },
  { href: '/psychologist/profile', label: 'Profilim', icon: '👤' },
];

const adminNav = [
  { href: '/admin', label: 'Ana Sayfa', icon: '🏠' },
  { href: '/admin/users', label: 'Kullanıcılar', icon: '👥' },
  { href: '/admin/audit', label: 'Audit Log', icon: '📋' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  if (loading || !user) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">Yükleniyor...</div>;
  }

  const navItems =
    user.role === 'ADMIN' ? adminNav :
    user.role === 'PSYCHOLOGIST' ? psychNav :
    clientNav;

  const roleLabel = user.role === 'ADMIN' ? 'Admin' : user.role === 'PSYCHOLOGIST' ? 'Psikolog' : 'Danışan';
  const roleColor = user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : user.role === 'PSYCHOLOGIST' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700';

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0`}>

        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-5 border-b border-gray-100">
            <h1 className="text-xl font-bold text-primary-700">PsikoTakip</h1>
            <span className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-block ${roleColor}`}>{roleLabel}</span>
          </div>

          {/* Nav */}
          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                  ${pathname === item.href
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>

          {/* User */}
          <div className="p-4 border-t border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold text-sm">
                {user.firstName[0]}{user.lastName[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{user.firstName} {user.lastName}</p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>
            </div>
            <button
              onClick={async () => { await logout(); router.push('/login'); }}
              className="w-full text-left text-sm text-red-500 hover:text-red-700 px-2 py-1 rounded hover:bg-red-50 transition-colors"
            >
              Çıkış Yap
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 lg:hidden">
          <button onClick={() => setSidebarOpen(true)} className="p-1 rounded-lg hover:bg-gray-100">
            <span className="text-xl">☰</span>
          </button>
          <span className="font-semibold text-gray-800">PsikoTakip</span>
        </header>

        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

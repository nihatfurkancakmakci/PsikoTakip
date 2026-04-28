'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import {
  Home,
  Calendar,
  CalendarPlus,
  FlaskConical,
  FileText,
  LineChart,
  Bell,
  User,
  Users,
  ClipboardList,
  LogOut,
  Brain,
  Menu,
  X,
  type LucideIcon,
} from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const clientNav: NavItem[] = [
  { href: '/client', label: 'Ana Sayfa', icon: Home },
  { href: '/client/appointments', label: 'Randevularım', icon: Calendar },
  { href: '/client/appointments/new', label: 'Randevu Al', icon: CalendarPlus },
  { href: '/client/tests', label: 'Testlerim', icon: FlaskConical },
  { href: '/client/sessions', label: 'Seans Notları', icon: FileText },
  { href: '/client/progress', label: 'İlerleme Grafiğim', icon: LineChart },
  { href: '/client/notifications', label: 'Bildirimler', icon: Bell },
  { href: '/client/profile', label: 'Profilim', icon: User },
];

const psychNav: NavItem[] = [
  { href: '/psychologist', label: 'Ana Sayfa', icon: Home },
  { href: '/psychologist/appointments', label: 'Randevular', icon: Calendar },
  { href: '/psychologist/clients', label: 'Danışanlar', icon: Users },
  { href: '/psychologist/tests', label: 'Testler', icon: FlaskConical },
  { href: '/psychologist/notifications', label: 'Bildirimler', icon: Bell },
  { href: '/psychologist/profile', label: 'Profilim', icon: User },
];

const adminNav: NavItem[] = [
  { href: '/admin', label: 'Ana Sayfa', icon: Home },
  { href: '/admin/users', label: 'Kullanıcılar', icon: Users },
  { href: '/admin/audit', label: 'Audit Log', icon: ClipboardList },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-slate-200 border-t-primary-500 rounded-full animate-spin" />
          <p className="text-slate-500 text-sm font-medium">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  const navItems =
    user.role === 'ADMIN' ? adminNav :
    user.role === 'PSYCHOLOGIST' ? psychNav :
    clientNav;

  const roleLabel =
    user.role === 'ADMIN' ? 'Admin' :
    user.role === 'PSYCHOLOGIST' ? 'Psikolog' : 'Danışan';

  const roleBadge =
    user.role === 'ADMIN'
      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
      : user.role === 'PSYCHOLOGIST'
      ? 'bg-primary-500/20 text-primary-300 border border-primary-500/30'
      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30';

  const initials = `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();

  return (
    <div className="min-h-screen flex bg-surface-50">

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden animate-fade-in"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-surface-900 flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:relative lg:translate-x-0
        `}
      >
        {/* Logo */}
        <div className="px-5 py-5 flex items-center justify-between border-b border-white/5 flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-primary-500/30">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-white font-bold text-base leading-tight">PsikoTakip</h1>
              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${roleBadge}`}>
                {roleLabel}
              </span>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-slate-500 hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-colors flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                  transition-all duration-150 relative
                  ${active
                    ? 'bg-primary-500 text-white shadow-md shadow-primary-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }
                `}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 transition-transform duration-150 ${!active ? 'group-hover:scale-110' : ''}`} />
                <span className="flex-1 truncate">{item.label}</span>
                {active && <span className="w-1.5 h-1.5 rounded-full bg-white/60 flex-shrink-0" />}
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div className="px-3 py-4 border-t border-white/5 flex-shrink-0 space-y-1">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user.firstName} {user.lastName}</p>
              <p className="text-xs text-slate-500 truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={async () => { await logout(); router.push('/login'); }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-500 hover:text-red-400 hover:bg-red-500/5 rounded-xl transition-all duration-150"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            Çıkış Yap
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile topbar */}
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 py-3 flex items-center gap-3 lg:hidden sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-xl hover:bg-slate-100 transition-colors text-slate-600 -ml-1"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-sm">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-slate-900 text-sm">PsikoTakip</span>
          </div>
        </header>

        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Appointment, TestResult } from '@/types';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import Link from 'next/link';
import { Calendar, FlaskConical, CalendarPlus, Video, MapPin, ChevronRight, TrendingUp } from 'lucide-react';

const statusLabels: Record<string, string> = {
  PENDING: 'Bekliyor',
  CONFIRMED: 'Onaylandı',
  CANCELLED: 'İptal',
  COMPLETED: 'Tamamlandı',
  NO_SHOW: 'Gelmedi',
};

const statusColors: Record<string, string> = {
  PENDING: 'bg-amber-50 text-amber-700 border border-amber-200',
  CONFIRMED: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  CANCELLED: 'bg-red-50 text-red-700 border border-red-200',
  COMPLETED: 'bg-primary-50 text-primary-700 border border-primary-200',
  NO_SHOW: 'bg-slate-100 text-slate-600 border border-slate-200',
};

export default function ClientDashboard() {
  const { data: appointments, isLoading } = useQuery<Appointment[]>({
    queryKey: ['appointments'],
    queryFn: () => api.get('/appointments').then((r) => r.data),
  });

  const { data: testResults } = useQuery<TestResult[]>({
    queryKey: ['my-tests'],
    queryFn: () => api.get('/tests/results/me').then((r) => r.data),
  });

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-slate-200 border-t-primary-500 rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  const upcoming = appointments?.filter((a) =>
    ['PENDING', 'CONFIRMED'].includes(a.status)
  ) ?? [];

  return (
    <div className="p-6 space-y-6 animate-slide-up">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Danışan Paneli</h1>
        <p className="text-slate-500 text-sm mt-0.5">Randevularınızı ve ilerlemenizi takip edin</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 stagger">
        <div className="card">
          <div className="flex items-start justify-between mb-3">
            <p className="text-sm font-medium text-slate-500">Toplam Randevu</p>
            <div className="w-9 h-9 rounded-xl bg-primary-50 flex items-center justify-center">
              <Calendar className="w-4.5 h-4.5 text-primary-500" />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-900">{appointments?.length ?? 0}</p>
          <p className="text-xs text-slate-400 mt-1">{upcoming.length} yaklaşan</p>
        </div>

        <div className="card">
          <div className="flex items-start justify-between mb-3">
            <p className="text-sm font-medium text-slate-500">Tamamlanan Testler</p>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
              <FlaskConical className="w-4.5 h-4.5 text-emerald-500" />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-900">{testResults?.length ?? 0}</p>
          <Link href="/client/progress" className="text-xs text-primary-600 hover:text-primary-700 mt-1 flex items-center gap-1 transition-colors">
            <TrendingUp className="w-3 h-3" />
            İlerlemeyi gör
          </Link>
        </div>

        <div className="card flex flex-col justify-between">
          <p className="text-sm font-medium text-slate-500 mb-3">Hızlı İşlem</p>
          <Link href="/client/appointments/new" className="btn-primary text-sm py-2.5 w-full">
            <CalendarPlus className="w-4 h-4" />
            Randevu Al
          </Link>
        </div>
      </div>

      {/* Upcoming appointments */}
      <div className="card">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-semibold text-slate-900">Yaklaşan Randevular</h2>
          <Link
            href="/client/appointments"
            className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-0.5 transition-colors font-medium"
          >
            Tümü <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        {!appointments?.length ? (
          <div className="text-center py-10">
            <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-3">
              <Calendar className="w-6 h-6 text-slate-300" />
            </div>
            <p className="text-slate-500 text-sm font-medium">Henüz randevunuz yok</p>
            <p className="text-slate-400 text-xs mt-1">İlk randevunuzu almak için aşağıdaki butona tıklayın</p>
            <Link href="/client/appointments/new" className="btn-primary text-sm py-2 px-4 mt-4 inline-flex">
              Randevu Al
            </Link>
          </div>
        ) : (
          <div className="space-y-2.5 stagger">
            {appointments.slice(0, 5).map((a) => (
              <div
                key={a.id}
                className="flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors duration-150"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-primary-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-primary-600">
                      {a.psychologist?.user.firstName?.[0]}{a.psychologist?.user.lastName?.[0]}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-800 text-sm truncate">
                      {a.psychologist?.user.firstName} {a.psychologist?.user.lastName}
                    </p>
                    <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                      {format(new Date(a.startTime), 'dd MMM yyyy HH:mm', { locale: tr })}
                      <span className="text-slate-300">·</span>
                      {a.sessionType === 'ONLINE' ? (
                        <span className="flex items-center gap-1"><Video className="w-3 h-3" /> Online</span>
                      ) : (
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> Yüz yüze</span>
                      )}
                    </p>
                  </div>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${statusColors[a.status]}`}>
                  {statusLabels[a.status]}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Test results */}
      {!!testResults?.length && (
        <div className="card">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-slate-900">Son Test Sonuçları</h2>
            <Link href="/client/tests" className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-0.5 transition-colors font-medium">
              Tümü <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="space-y-2.5 stagger">
            {testResults.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors duration-150"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-violet-50 flex items-center justify-center flex-shrink-0">
                    <FlaskConical className="w-4 h-4 text-violet-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-800 text-sm truncate">{r.test.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Skor: <span className="font-medium text-slate-700">{r.totalScore}</span>
                      {r.completedAt && (
                        <> · {format(new Date(r.completedAt), 'dd MMM yyyy', { locale: tr })}</>
                      )}
                    </p>
                  </div>
                </div>
                <span className={`badge-${r.scoreCategory.toLowerCase()}`}>
                  {r.scoreCategory}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

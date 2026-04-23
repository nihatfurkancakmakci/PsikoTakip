'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Appointment, TestResult } from '@/types';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import Link from 'next/link';

const statusLabels: Record<string, string> = {
  PENDING: 'Bekliyor',
  CONFIRMED: 'Onaylandı',
  CANCELLED: 'İptal',
  COMPLETED: 'Tamamlandı',
  NO_SHOW: 'Gelmedi',
};

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  CONFIRMED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
  COMPLETED: 'bg-blue-100 text-blue-700',
  NO_SHOW: 'bg-gray-100 text-gray-700',
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

  if (isLoading) return <div className="p-8 text-center text-gray-500">Yükleniyor...</div>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Danışan Paneli</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card">
          <p className="text-sm text-gray-500">Toplam Randevu</p>
          <p className="text-3xl font-bold text-primary-600">{appointments?.length ?? 0}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Tamamlanan Testler</p>
          <p className="text-3xl font-bold text-calm-600">{testResults?.length ?? 0}</p>
        </div>
        <div className="card">
          <Link href="/client/appointments/new" className="btn-primary block text-center">
            + Randevu Al
          </Link>
        </div>
      </div>

      <div className="card">
        <h2 className="font-semibold text-gray-800 mb-4">Yaklaşan Randevular</h2>
        {!appointments?.length ? (
          <p className="text-gray-500 text-sm">Henüz randevunuz yok.</p>
        ) : (
          <div className="space-y-3">
            {appointments.slice(0, 5).map((a) => (
              <div key={a.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-800">
                    {a.psychologist?.user.firstName} {a.psychologist?.user.lastName}
                  </p>
                  <p className="text-sm text-gray-500">
                    {format(new Date(a.startTime), 'dd MMM yyyy HH:mm', { locale: tr })}
                    {' '} • {a.sessionType === 'ONLINE' ? '🎥 Online' : '🏥 Yüz yüze'}
                  </p>
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusColors[a.status]}`}>
                  {statusLabels[a.status]}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {!!testResults?.length && (
        <div className="card">
          <h2 className="font-semibold text-gray-800 mb-4">Son Test Sonuçları</h2>
          <div className="space-y-3">
            {testResults.map((r) => (
              <div key={r.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{r.test.name}</p>
                  <p className="text-sm text-gray-500">
                    Skor: {r.totalScore} | {r.completedAt ? format(new Date(r.completedAt), 'dd MMM yyyy') : ''}
                  </p>
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

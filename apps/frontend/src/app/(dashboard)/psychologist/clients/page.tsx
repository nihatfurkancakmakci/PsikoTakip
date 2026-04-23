'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { api } from '@/lib/api';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { toast } from 'sonner';

interface ClientSummary {
  id: string;
  userId: string;
  user: { firstName: string; lastName: string; email: string; phone?: string };
  appointmentCount: number;
  lastAppointmentAt?: string;
}

interface Appointment {
  id: string;
  startTime: string;
  endTime: string;
  status: string;
  sessionType: string;
}

interface TestResult {
  id: string;
  totalScore: number;
  scoreCategory: string;
  completedAt: string | null;
  isSharedWithClient: boolean;
  test: { name: string; code: string };
}

const statusLabel: Record<string, string> = {
  PENDING: 'Bekliyor', CONFIRMED: 'Onaylandı', CANCELLED: 'İptal', COMPLETED: 'Tamamlandı', NO_SHOW: 'Gelmedi',
};
const statusColor: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  CONFIRMED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
  COMPLETED: 'bg-blue-100 text-blue-700',
  NO_SHOW: 'bg-gray-100 text-gray-600',
};
const categoryColor: Record<string, string> = {
  NORMAL: 'text-green-700', HAFIF: 'text-yellow-700', ORTA: 'text-orange-600', AGIR: 'text-red-700',
};

function ClientPanel({ client, onClose }: { client: ClientSummary; onClose: () => void }) {
  const qc = useQueryClient();

  const { data: appointments } = useQuery<Appointment[]>({
    queryKey: ['client-appointments', client.userId],
    queryFn: () => api.get('/appointments').then(r =>
      r.data.filter((a: any) => a.client?.userId === client.userId || a.clientId === client.id)
    ),
  });

  const { data: testResults } = useQuery<TestResult[]>({
    queryKey: ['client-tests', client.userId],
    queryFn: () => api.get(`/tests/progress/${client.userId}`).then(r => r.data),
  });

  const toggleShare = useMutation({
    mutationFn: ({ resultId, shared }: { resultId: string; shared: boolean }) =>
      api.patch(`/tests/results/${resultId}/share`, { isSharedWithClient: shared }),
    onSuccess: () => {
      toast.success('Güncellendi');
      qc.invalidateQueries({ queryKey: ['client-tests', client.userId] });
    },
  });

  const initials = `${client.user.firstName[0]}${client.user.lastName[0]}`;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-40 bg-black/40" onClick={onClose} />

      {/* Panel */}
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-lg bg-white shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-4 p-6 border-b border-gray-100">
          <div className="w-14 h-14 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-xl flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-gray-900">{client.user.firstName} {client.user.lastName}</h2>
            <p className="text-sm text-gray-500 truncate">{client.user.email}</p>
            {client.user.phone && <p className="text-sm text-gray-400">{client.user.phone}</p>}
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 px-6 py-4 border-b border-gray-100">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary-600">{client.appointmentCount}</p>
            <p className="text-xs text-gray-500 mt-0.5">Randevu</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-calm-600">{testResults?.filter(r => r.completedAt).length ?? 0}</p>
            <p className="text-xs text-gray-500 mt-0.5">Test</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">
              {appointments?.filter(a => a.status === 'COMPLETED').length ?? 0}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">Tamamlanan</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 px-6 py-4 border-b border-gray-100">
          <Link
            href={`/psychologist/clients/${client.userId}/progress`}
            className="flex-1 py-2.5 bg-primary-600 text-white text-sm font-semibold rounded-lg text-center hover:bg-primary-700 transition-colors"
          >
            📊 İlerleme Grafiği
          </Link>
          <Link
            href={`/psychologist/tests`}
            className="flex-1 py-2.5 border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg text-center hover:bg-gray-50 transition-colors"
          >
            🧪 Test Ata
          </Link>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Son Randevular */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Son Randevular</h3>
            {!appointments?.length ? (
              <p className="text-sm text-gray-400 text-center py-4">Randevu yok</p>
            ) : (
              <div className="space-y-2">
                {appointments.slice(0, 5).map(a => (
                  <div key={a.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        {format(new Date(a.startTime), 'dd MMM yyyy', { locale: tr })}
                      </p>
                      <p className="text-xs text-gray-500">
                        {format(new Date(a.startTime), 'HH:mm')} – {format(new Date(a.endTime), 'HH:mm')}
                        {' · '}{a.sessionType === 'ONLINE' ? '🎥 Online' : '🏥 Yüz yüze'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColor[a.status]}`}>
                        {statusLabel[a.status]}
                      </span>
                      {a.status === 'COMPLETED' && (
                        <Link
                          href={`/psychologist/sessions/${a.id}`}
                          className="text-xs bg-primary-50 text-primary-700 px-2 py-1 rounded-lg hover:bg-primary-100"
                        >
                          Not
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Test Sonuçları */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Test Sonuçları</h3>
            {!testResults?.filter(r => r.completedAt).length ? (
              <p className="text-sm text-gray-400 text-center py-4">Tamamlanan test yok</p>
            ) : (
              <div className="space-y-2">
                {testResults?.filter(r => r.completedAt).map(r => (
                  <div key={r.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{r.test?.name ?? '—'}</p>
                      <p className="text-xs text-gray-500">
                        {r.completedAt ? format(new Date(r.completedAt), 'dd MMM yyyy', { locale: tr }) : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className={`text-lg font-bold ${categoryColor[r.scoreCategory] ?? 'text-gray-700'}`}>
                          {r.totalScore}
                        </p>
                        <p className="text-xs text-gray-400">{r.scoreCategory}</p>
                      </div>
                      <button
                        onClick={() => toggleShare.mutate({ resultId: r.id, shared: !r.isSharedWithClient })}
                        className={`text-xs px-2 py-1 rounded-lg border transition-colors ${
                          r.isSharedWithClient
                            ? 'bg-green-50 border-green-200 text-green-700'
                            : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'
                        }`}
                        title={r.isSharedWithClient ? 'Paylaşımı kaldır' : 'Danışanla paylaş'}
                      >
                        {r.isSharedWithClient ? '👁 Paylaşıldı' : '🔒 Gizli'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default function PsychClientsPage() {
  const [selected, setSelected] = useState<ClientSummary | null>(null);

  const { data: clients, isLoading } = useQuery<ClientSummary[]>({
    queryKey: ['psych-clients'],
    queryFn: () => api.get('/users/my-clients').then(r => r.data),
  });

  if (isLoading) return <div className="p-6 text-gray-500">Yükleniyor...</div>;

  return (
    <div className="p-6 space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Danışanlar</h1>
        <p className="text-gray-500 text-sm mt-1">Randevu geçmişi olan danışanlarınız — detaylar için üstüne tıklayın</p>
      </div>

      <div className="space-y-3">
        {!clients || clients.length === 0 ? (
          <div className="card text-center py-10">
            <p className="text-4xl mb-3">👥</p>
            <p className="text-sm text-gray-400">Henüz danışan yok.</p>
          </div>
        ) : (
          clients.map(c => (
            <button
              key={c.id}
              onClick={() => setSelected(c)}
              className="w-full text-left bg-white border border-gray-100 rounded-xl p-4 hover:border-primary-200 hover:shadow-md transition-all duration-150 group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary-50 flex items-center justify-center text-primary-700 font-bold text-base flex-shrink-0 group-hover:bg-primary-100 transition-colors">
                  {c.user.firstName[0]}{c.user.lastName[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 group-hover:text-primary-700 transition-colors">
                    {c.user.firstName} {c.user.lastName}
                  </p>
                  <p className="text-sm text-gray-500 truncate">{c.user.email}</p>
                  {c.lastAppointmentAt && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      Son randevu: {format(new Date(c.lastAppointmentAt), 'dd MMM yyyy', { locale: tr })}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="text-center">
                    <p className="text-xl font-bold text-primary-600">{c.appointmentCount}</p>
                    <p className="text-xs text-gray-400">randevu</p>
                  </div>
                  <span className="text-gray-300 text-xl group-hover:text-primary-400 transition-colors">›</span>
                </div>
              </div>
            </button>
          ))
        )}
      </div>

      {selected && <ClientPanel client={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

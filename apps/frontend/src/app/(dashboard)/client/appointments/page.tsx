'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { api } from '@/lib/api';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { toast } from 'sonner';

interface Appointment {
  id: string;
  startTime: string;
  endTime: string;
  status: string;
  sessionType: string;
  notes?: string;
  psychologistId: string;
  psychologist?: { id: string; sessionDurationMin: number; user: { firstName: string; lastName: string } };
}

interface BookedSlot { startTime: string; endTime: string }

const statusLabel: Record<string, string> = {
  PENDING: 'Onay Bekliyor', CONFIRMED: 'Onaylandı', CANCELLED: 'İptal', COMPLETED: 'Tamamlandı', NO_SHOW: 'Gelmedi',
};
const statusColor: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  CONFIRMED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
  COMPLETED: 'bg-blue-100 text-blue-700',
  NO_SHOW: 'bg-gray-100 text-gray-600',
};

function EditModal({ appointment, onClose }: { appointment: Appointment; onClose: () => void }) {
  const qc = useQueryClient();
  const [date, setDate] = useState(appointment.startTime.split('T')[0]);
  const [startTime, setStartTime] = useState(format(new Date(appointment.startTime), 'HH:mm'));
  const [sessionType, setSessionType] = useState(appointment.sessionType);

  const { data: slots } = useQuery<{ bookedSlots: BookedSlot[]; sessionDurationMin: number }>({
    queryKey: ['slots', appointment.psychologistId, date],
    queryFn: () => api.get(`/appointments/slots?psychologistId=${appointment.psychologistId}&date=${date}`).then(r => r.data),
    enabled: !!date,
  });

  const reschedule = useMutation({
    mutationFn: (data: object) => api.patch(`/appointments/${appointment.id}/reschedule`, data),
    onSuccess: () => {
      toast.success('Randevu güncellendi');
      qc.invalidateQueries({ queryKey: ['appointments'] });
      onClose();
    },
    onError: (e: any) => toast.error(e.response?.data?.message ?? 'Hata oluştu'),
  });

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    const durationMin = slots?.sessionDurationMin ?? appointment.psychologist?.sessionDurationMin ?? 50;
    const start = new Date(`${date}T${startTime}:00`);
    const end = new Date(start.getTime() + durationMin * 60000);
    reschedule.mutate({ startTime: start.toISOString(), endTime: end.toISOString(), sessionType });
  };

  const busyTimes = (slots?.bookedSlots ?? []).filter(s => {
    const sId = appointment.id;
    return true;
  });

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900">Randevuyu Düzenle</h2>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600">✕</button>
          </div>

          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <div>
              <label className="label">Tarih</label>
              <input
                type="date"
                className="input-field"
                value={date}
                min={new Date().toISOString().split('T')[0]}
                onChange={e => setDate(e.target.value)}
                required
              />
            </div>

            {/* Dolu saatler */}
            {busyTimes.length > 0 && (
              <div className="bg-red-50 border border-red-100 rounded-xl p-3">
                <p className="text-xs font-semibold text-red-700 mb-2">Bu gün dolu saatler:</p>
                <div className="flex flex-wrap gap-1.5">
                  {busyTimes.map((s, i) => (
                    <span key={i} className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-lg font-medium">
                      {format(new Date(s.startTime), 'HH:mm')}–{format(new Date(s.endTime), 'HH:mm')}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="label">Saat</label>
              <input type="time" className="input-field" value={startTime} onChange={e => setStartTime(e.target.value)} required />
              {slots?.sessionDurationMin && (
                <p className="text-xs text-gray-400 mt-1">Seans süresi: {slots.sessionDurationMin} dk</p>
              )}
            </div>

            <div>
              <label className="label">Seans Türü</label>
              <div className="flex gap-3">
                {(['IN_PERSON', 'ONLINE'] as const).map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setSessionType(t)}
                    className={`flex-1 py-2.5 rounded-lg border text-sm font-medium transition-colors
                      ${sessionType === t ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                  >
                    {t === 'ONLINE' ? '🎥 Online' : '🏥 Yüz Yüze'}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors">
                Vazgeç
              </button>
              <button type="submit" className="flex-1 btn-primary py-2.5" disabled={reschedule.isPending}>
                {reschedule.isPending ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default function ClientAppointmentsPage() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Appointment | null>(null);

  const { data: appointments, isLoading } = useQuery<Appointment[]>({
    queryKey: ['appointments'],
    queryFn: () => api.get('/appointments').then(r => r.data),
  });

  const cancel = useMutation({
    mutationFn: (id: string) => api.patch(`/appointments/${id}/status`, { status: 'CANCELLED' }),
    onSuccess: () => {
      toast.success('Randevu iptal edildi');
      qc.invalidateQueries({ queryKey: ['appointments'] });
    },
    onError: (e: any) => toast.error(e.response?.data?.message ?? 'İptal edilemedi'),
  });

  const handleCancel = (a: Appointment) => {
    const hoursLeft = (new Date(a.startTime).getTime() - Date.now()) / 3600000;
    if (a.status === 'CONFIRMED' && hoursLeft < 24) {
      return toast.error('Randevuya 24 saatten az kaldığı için iptal edilemez');
    }
    if (!confirm('Randevuyu iptal etmek istediğinize emin misiniz?')) return;
    cancel.mutate(a.id);
  };

  if (isLoading) return <div className="p-6 text-gray-500">Yükleniyor...</div>;

  const upcoming = appointments?.filter(a => ['PENDING', 'CONFIRMED'].includes(a.status) && new Date(a.startTime) > new Date()) ?? [];
  const past = appointments?.filter(a => !upcoming.find(u => u.id === a.id)) ?? [];

  return (
    <div className="p-6 space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Randevularım</h1>
          <p className="text-gray-500 text-sm mt-1">Randevularınızı görüntüleyin, düzenleyin veya iptal edin</p>
        </div>
        <Link href="/client/appointments/new" className="btn-primary px-4 py-2.5 text-sm">
          + Yeni Randevu
        </Link>
      </div>

      {/* Yaklaşan */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Yaklaşan ({upcoming.length})</h2>
        {upcoming.length === 0 ? (
          <div className="card text-center py-8">
            <p className="text-3xl mb-2">📅</p>
            <p className="text-gray-400 text-sm">Yaklaşan randevu yok.</p>
            <Link href="/client/appointments/new" className="text-primary-600 text-sm font-medium hover:underline mt-1 block">
              Randevu alın →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {upcoming.map(a => (
              <div key={a.id} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900">
                      {a.psychologist?.user.firstName} {a.psychologist?.user.lastName}
                    </p>
                    <p className="text-sm text-gray-600 mt-0.5">
                      {format(new Date(a.startTime), 'dd MMMM yyyy, EEEE', { locale: tr })}
                    </p>
                    <p className="text-sm text-gray-500">
                      {format(new Date(a.startTime), 'HH:mm')} – {format(new Date(a.endTime), 'HH:mm')}
                      {' · '}{a.sessionType === 'ONLINE' ? '🎥 Online' : '🏥 Yüz yüze'}
                    </p>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium shrink-0 ${statusColor[a.status]}`}>
                    {statusLabel[a.status]}
                  </span>
                </div>

                {a.status === 'PENDING' && (
                  <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => setEditing(a)}
                      className="flex-1 py-2 text-sm font-semibold bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100 transition-colors"
                    >
                      ✏️ Düzenle / Yeniden Zamanla
                    </button>
                    <button
                      onClick={() => handleCancel(a)}
                      className="px-4 py-2 text-sm font-semibold bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      İptal
                    </button>
                  </div>
                )}

                {a.status === 'CONFIRMED' && (
                  <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => handleCancel(a)}
                      className="px-4 py-2 text-sm font-semibold bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      İptal Et
                    </button>
                    <p className="text-xs text-gray-400 self-center ml-1">24 saatten az kaldıysa iptal edilemez</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Geçmiş */}
      {past.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Geçmiş ({past.length})</h2>
          <div className="space-y-2">
            {past.map(a => (
              <div key={a.id} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm opacity-75">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-medium text-gray-800">
                      {a.psychologist?.user.firstName} {a.psychologist?.user.lastName}
                    </p>
                    <p className="text-sm text-gray-500">
                      {format(new Date(a.startTime), 'dd MMM yyyy HH:mm', { locale: tr })}
                      {' · '}{a.sessionType === 'ONLINE' ? '🎥 Online' : '🏥 Yüz yüze'}
                    </p>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium shrink-0 ${statusColor[a.status]}`}>
                    {statusLabel[a.status]}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {editing && <EditModal appointment={editing} onClose={() => setEditing(null)} />}
    </div>
  );
}

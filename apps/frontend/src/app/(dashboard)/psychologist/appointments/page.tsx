'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Appointment, AppointmentStatus } from '@/types';
import { toast } from 'sonner';
import AutoTextarea from '@/components/AutoTextarea';

const statusLabel: Record<AppointmentStatus, string> = {
  PENDING: 'Bekliyor',
  CONFIRMED: 'Onaylandı',
  CANCELLED: 'İptal',
  COMPLETED: 'Tamamlandı',
  NO_SHOW: 'Gelmedi',
};

const statusColor: Record<AppointmentStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  CONFIRMED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
  COMPLETED: 'bg-blue-100 text-blue-700',
  NO_SHOW: 'bg-gray-100 text-gray-600',
};

interface NewAppointmentForm {
  clientUserId: string;
  date: string;
  startHour: string;
  endHour: string;
  sessionType: 'IN_PERSON' | 'ONLINE';
  notes: string;
}

export default function PsychAppointmentsPage() {
  const qc = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<NewAppointmentForm>({
    clientUserId: '',
    date: '',
    startHour: '10:00',
    endHour: '11:00',
    sessionType: 'IN_PERSON',
    notes: '',
  });

  const { data: appointments, isLoading } = useQuery<Appointment[]>({
    queryKey: ['psych-appointments'],
    queryFn: () => api.get('/appointments?role=psychologist').then(r => r.data),
  });

  const { data: clients } = useQuery<{ userId: string; firstName: string; lastName: string }[]>({
    queryKey: ['my-clients'],
    queryFn: () =>
      api.get('/users/my-clients').then(r =>
        r.data.map((c: any) => ({ userId: c.userId, firstName: c.user.firstName, lastName: c.user.lastName }))
      ),
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: AppointmentStatus }) =>
      api.patch(`/appointments/${id}/status`, { status }),
    onSuccess: () => {
      toast.success('Randevu güncellendi');
      qc.invalidateQueries({ queryKey: ['psych-appointments'] });
    },
    onError: (e: any) => toast.error(e.response?.data?.message ?? 'Hata oluştu'),
  });

  const createForClient = useMutation({
    mutationFn: (data: any) => api.post('/appointments/for-client', data),
    onSuccess: () => {
      toast.success('Randevu oluşturuldu');
      qc.invalidateQueries({ queryKey: ['psych-appointments'] });
      setShowModal(false);
      setForm({ clientUserId: '', date: '', startHour: '10:00', endHour: '11:00', sessionType: 'IN_PERSON', notes: '' });
    },
    onError: (e: any) => toast.error(e.response?.data?.message ?? 'Randevu oluşturulamadı'),
  });

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.clientUserId || !form.date) {
      toast.error('Danışan ve tarih zorunludur');
      return;
    }
    const startTime = new Date(`${form.date}T${form.startHour}:00`).toISOString();
    const endTime = new Date(`${form.date}T${form.endHour}:00`).toISOString();
    createForClient.mutate({
      clientUserId: form.clientUserId,
      startTime,
      endTime,
      sessionType: form.sessionType,
      notes: form.notes || undefined,
    });
  }

  if (isLoading) return <div className="p-6 text-gray-500">Yükleniyor...</div>;

  const grouped = {
    upcoming: appointments?.filter(a => ['PENDING', 'CONFIRMED'].includes(a.status)) ?? [],
    past: appointments?.filter(a => ['COMPLETED', 'CANCELLED', 'NO_SHOW'].includes(a.status)) ?? [],
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Randevular</h1>
          <p className="text-gray-500 text-sm mt-1">Tüm danışan randevularınızı yönetin</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary text-sm"
        >
          + Yeni Randevu
        </button>
      </div>

      <Section title="Yaklaşan Randevular" count={grouped.upcoming.length}>
        {grouped.upcoming.length === 0 ? (
          <p className="text-sm text-gray-400 py-4 text-center">Bekleyen randevu yok.</p>
        ) : (
          grouped.upcoming.map(a => (
            <AppointmentRow key={a.id} appointment={a} onUpdate={(status) => updateStatus.mutate({ id: a.id, status })} />
          ))
        )}
      </Section>

      <Section title="Geçmiş Randevular" count={grouped.past.length}>
        {grouped.past.length === 0 ? (
          <p className="text-sm text-gray-400 py-4 text-center">Geçmiş randevu yok.</p>
        ) : (
          grouped.past.map(a => (
            <AppointmentRow key={a.id} appointment={a} />
          ))
        )}
      </Section>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-800">Danışana Randevu Oluştur</h2>
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="label">Danışan</label>
                <select
                  className="input"
                  value={form.clientUserId}
                  onChange={e => setForm(f => ({ ...f, clientUserId: e.target.value }))}
                  required
                >
                  <option value="">Danışan seçin...</option>
                  {clients?.map(c => (
                    <option key={c.userId} value={c.userId}>
                      {c.firstName} {c.lastName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Tarih</label>
                <input
                  type="date"
                  className="input"
                  value={form.date}
                  onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Başlangıç</label>
                  <input
                    type="time"
                    className="input"
                    value={form.startHour}
                    onChange={e => setForm(f => ({ ...f, startHour: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="label">Bitiş</label>
                  <input
                    type="time"
                    className="input"
                    value={form.endHour}
                    onChange={e => setForm(f => ({ ...f, endHour: e.target.value }))}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="label">Seans Türü</label>
                <select
                  className="input"
                  value={form.sessionType}
                  onChange={e => setForm(f => ({ ...f, sessionType: e.target.value as any }))}
                >
                  <option value="IN_PERSON">Yüz Yüze</option>
                  <option value="ONLINE">Online</option>
                </select>
              </div>
              <div>
                <label className="label">Not (isteğe bağlı)</label>
                <AutoTextarea
                  className="input"
                  minRows={2}
                  value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  placeholder="Randevu notu..."
                />
              </div>
              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 btn-secondary"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={createForClient.isPending}
                  className="flex-1 btn-primary"
                >
                  {createForClient.isPending ? 'Oluşturuluyor...' : 'Oluştur'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function Section({ title, count, children }: { title: string; count: number; children: React.ReactNode }) {
  return (
    <div className="card space-y-3">
      <h2 className="text-base font-semibold text-gray-700">{title} <span className="text-gray-400 font-normal text-sm">({count})</span></h2>
      {children}
    </div>
  );
}

function AppointmentRow({ appointment: a, onUpdate }: { appointment: Appointment; onUpdate?: (s: AppointmentStatus) => void }) {
  const start = new Date(a.startTime);
  const end = new Date(a.endTime);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 border border-gray-100 rounded-lg">
      <div className="space-y-0.5">
        <p className="font-medium text-gray-800 text-sm">
          {a.client?.user.firstName} {a.client?.user.lastName}
        </p>
        <p className="text-xs text-gray-500">
          {start.toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' })}
          {' · '}{start.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
          {' – '}{end.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
        </p>
        <p className="text-xs text-gray-400">
          {a.sessionType === 'ONLINE' ? '🎥 Online' : '🏥 Yüz Yüze'}
          {a.videoMeetingUrl && (
            <a href={a.videoMeetingUrl} target="_blank" rel="noreferrer" className="ml-2 text-blue-500 underline">Toplantı Linki</a>
          )}
        </p>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColor[a.status]}`}>{statusLabel[a.status]}</span>
        {onUpdate && a.status === 'PENDING' && (
          <>
            <button onClick={() => onUpdate('CONFIRMED')} className="text-xs bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 transition-colors">Onayla</button>
            <button onClick={() => onUpdate('CANCELLED')} className="text-xs bg-red-100 text-red-700 px-3 py-1 rounded-lg hover:bg-red-200 transition-colors">İptal</button>
          </>
        )}
        {onUpdate && a.status === 'CONFIRMED' && (
          <>
            <button onClick={() => onUpdate('COMPLETED')} className="text-xs bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition-colors">Tamamlandı</button>
            <button onClick={() => onUpdate('NO_SHOW')} className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-lg hover:bg-gray-200 transition-colors">Gelmedi</button>
            <button onClick={() => onUpdate('CANCELLED')} className="text-xs bg-red-100 text-red-700 px-3 py-1 rounded-lg hover:bg-red-200 transition-colors">İptal</button>
          </>
        )}
        {a.status === 'COMPLETED' && (
          <Link
            href={`/psychologist/sessions/${a.id}`}
            className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-lg hover:bg-purple-200 transition-colors"
          >
            Seans Notu
          </Link>
        )}
      </div>
    </div>
  );
}

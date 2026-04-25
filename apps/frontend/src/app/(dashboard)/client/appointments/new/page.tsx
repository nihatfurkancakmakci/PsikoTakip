'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { Psychologist } from '@/types';
import { toast } from 'sonner';
import AutoTextarea from '@/components/AutoTextarea';

export default function NewAppointmentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedPsych, setSelectedPsych] = useState(searchParams.get('psychologistId') ?? '');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [sessionType, setSessionType] = useState<'IN_PERSON' | 'ONLINE'>('IN_PERSON');
  const [notes, setNotes] = useState('');

  const { data: psychologists } = useQuery<Psychologist[]>({
    queryKey: ['approved-psychologists'],
    queryFn: () => api.get('/users/psychologists?status=APPROVED').then(r => r.data),
  });

  const { data: slots } = useQuery({
    queryKey: ['slots', selectedPsych, date],
    queryFn: () => api.get(`/appointments/slots?psychologistId=${selectedPsych}&date=${date}`).then(r => r.data),
    enabled: !!selectedPsych && !!date,
  });

  const mutation = useMutation({
    mutationFn: (data: object) => api.post('/appointments', data),
    onSuccess: () => {
      toast.success('Randevu talebiniz alındı!');
      router.push('/client');
    },
    onError: (e: any) => toast.error(e.response?.data?.message ?? 'Hata oluştu'),
  });

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!selectedPsych || !date || !startTime) return toast.error('Tüm alanları doldurun');

    const psych = psychologists?.find(p => p.id === selectedPsych);
    const durationMin = psych?.sessionDurationMin ?? 50;
    const start = new Date(`${date}T${startTime}:00`);
    const end = new Date(start.getTime() + durationMin * 60000);

    mutation.mutate({ psychologistId: selectedPsych, startTime: start.toISOString(), endTime: end.toISOString(), sessionType, notes });
  };

  return (
    <div className="p-6 max-w-lg mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Randevu Al</h1>
        <p className="text-gray-500 text-sm mt-1">Psikolog seçin ve uygun zaman dilimini belirleyin</p>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Psikolog</label>
          <select className="input-field" value={selectedPsych} onChange={e => setSelectedPsych(e.target.value)} required>
            <option value="">Psikolog seçin...</option>
            {psychologists?.map(p => (
              <option key={p.id} value={p.id}>
                {p.user.firstName} {p.user.lastName} — {p.specialization}
              </option>
            ))}
          </select>
        </div>

        {selectedPsych && (
          <div className="p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
            {psychologists?.find(p => p.id === selectedPsych)?.biography ?? 'Biyografi girilmemiş'}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tarih</label>
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
        {slots?.bookedSlots?.length > 0 && (
          <div className="bg-red-50 border border-red-100 rounded-xl p-3">
            <p className="text-xs font-semibold text-red-700 mb-2">Bu gün dolu saatler (seçmekten kaçının):</p>
            <div className="flex flex-wrap gap-1.5">
              {slots.bookedSlots.map((s: { startTime: string; endTime: string }, i: number) => (
                <span key={i} className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-lg font-medium">
                  {new Date(s.startTime).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                  –{new Date(s.endTime).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                </span>
              ))}
            </div>
          </div>
        )}
        {slots?.bookedSlots?.length === 0 && date && (
          <p className="text-xs text-green-600 bg-green-50 px-3 py-2 rounded-lg">Seçilen tarihte psikolog müsait ✓</p>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Saat</label>
          <input type="time" className="input-field" value={startTime} onChange={e => setStartTime(e.target.value)} required />
          {slots?.sessionDurationMin && (
            <p className="text-xs text-gray-400 mt-1">Seans süresi: {slots.sessionDurationMin} dakika</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Seans Türü</label>
          <div className="flex gap-3">
            {(['IN_PERSON', 'ONLINE'] as const).map(t => (
              <button
                key={t}
                type="button"
                onClick={() => setSessionType(t)}
                className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-colors
                  ${sessionType === t ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
              >
                {t === 'ONLINE' ? '🎥 Online' : '🏥 Yüz Yüze'}
              </button>
            ))}
          </div>
          {sessionType === 'ONLINE' && (
            <p className="text-xs text-blue-500 mt-1">Onaylandıktan sonra video görüşme linki gönderilecek</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Not (opsiyonel)</label>
          <AutoTextarea className="input-field" minRows={2} placeholder="Seans öncesi belirtmek istedikleriniz..." value={notes} onChange={e => setNotes(e.target.value)} />
        </div>

        <button type="submit" className="btn-primary w-full py-3" disabled={mutation.isPending}>
          {mutation.isPending ? 'Randevu alınıyor...' : 'Randevu Al'}
        </button>
      </form>
    </div>
  );
}

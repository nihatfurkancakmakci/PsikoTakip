'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import AutoTextarea from '@/components/AutoTextarea';

interface SessionNote {
  id: string;
  content: string;
  emotionalState?: string;
  goals?: string;
  isSharedWithClient: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AppointmentDetail {
  id: string;
  startTime: string;
  endTime: string;
  sessionType: string;
  status: string;
  client?: { user: { firstName: string; lastName: string } };
}

export default function SessionNotePage() {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const router = useRouter();
  const qc = useQueryClient();

  const [content, setContent] = useState('');
  const [emotionalState, setEmotionalState] = useState('');
  const [goals, setGoals] = useState('');
  const [isShared, setIsShared] = useState(false);
  const [editing, setEditing] = useState(false);

  const { data: appointment } = useQuery<AppointmentDetail>({
    queryKey: ['appointment', appointmentId],
    queryFn: () => api.get(`/appointments/${appointmentId}`).then(r => r.data),
  });

  const { data: note, isLoading } = useQuery<SessionNote>({
    queryKey: ['session-note', appointmentId],
    queryFn: async () => {
      const res = await api.get<SessionNote>(`/sessions/notes/${appointmentId}`);
      setContent(res.data.content);
      setEmotionalState(res.data.emotionalState ?? '');
      setGoals(res.data.goals ?? '');
      setIsShared(res.data.isSharedWithClient);
      return res.data;
    },
    retry: false,
    staleTime: 0,
  });

  const createMutation = useMutation({
    mutationFn: () => api.post('/sessions/notes', {
      appointmentId,
      content,
      emotionalState: emotionalState || undefined,
      goals: goals || undefined,
      isSharedWithClient: isShared,
    }),
    onSuccess: () => {
      toast.success('Seans notu kaydedildi');
      qc.invalidateQueries({ queryKey: ['session-note', appointmentId] });
      setEditing(false);
    },
    onError: (e: any) => toast.error(e.response?.data?.message ?? 'Hata oluştu'),
  });

  const updateMutation = useMutation({
    mutationFn: () => api.patch(`/sessions/notes/${note!.id}`, {
      content,
      emotionalState: emotionalState || undefined,
      goals: goals || undefined,
      isSharedWithClient: isShared,
    }),
    onSuccess: () => {
      toast.success('Not güncellendi');
      qc.invalidateQueries({ queryKey: ['session-note', appointmentId] });
      setEditing(false);
    },
    onError: (e: any) => toast.error(e.response?.data?.message ?? 'Hata oluştu'),
  });

  const isCompleted = appointment?.status === 'COMPLETED' || appointment?.status === 'CONFIRMED';
  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="text-gray-400 hover:text-gray-600 text-sm">← Geri</button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Seans Notu</h1>
          {appointment && (
            <p className="text-gray-500 text-sm mt-0.5">
              {appointment.client?.user.firstName} {appointment.client?.user.lastName}
              {' · '}
              {new Date(appointment.startTime).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          )}
        </div>
      </div>

      {appointment?.status === 'CONFIRMED' && (
        <div className="card !p-4 bg-blue-50 border-blue-200 text-blue-800 text-sm">
          Seans devam ediyor — not alabilirsiniz. Seans bittikten sonra randevuyu "Tamamlandı" olarak işaretlemeyi unutmayın.
        </div>
      )}
      {appointment && !['CONFIRMED', 'COMPLETED'].includes(appointment.status) && (
        <div className="card !p-4 bg-yellow-50 border-yellow-200 text-yellow-800 text-sm">
          Bu randevu için not eklenemez (durum: {appointment.status}).
        </div>
      )}

      {isLoading ? (
        <div className="text-gray-400 text-sm">Yükleniyor...</div>
      ) : (
        <div className="card space-y-4">
          {!note || editing ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Seans İçeriği <span className="text-red-500">*</span></label>
                <AutoTextarea
                  className="input-field"
                  minRows={4}
                  placeholder="Seans sırasında görüşülen konular, gözlemler, müdahaleler..."
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  disabled={!isCompleted}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duygusal Durum</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="örn. Kaygılı, sakin, içe kapanık..."
                    value={emotionalState}
                    onChange={e => setEmotionalState(e.target.value)}
                    disabled={!isCompleted}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hedefler / Ödevler</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Bir sonraki seansa kadar yapılacaklar..."
                    value={goals}
                    onChange={e => setGoals(e.target.value)}
                    disabled={!isCompleted}
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isShared}
                  onChange={e => setIsShared(e.target.checked)}
                  className="accent-primary-600"
                  disabled={!isCompleted}
                />
                <span className="text-sm text-gray-700">Bu notu danışanla paylaş</span>
                <span className="text-xs text-gray-400">(danışan kendi panelinde görebilir)</span>
              </label>

              <div className="flex gap-3">
                <button
                  onClick={() => note ? updateMutation.mutate() : createMutation.mutate()}
                  disabled={isPending || !content.trim() || !isCompleted}
                  className="btn-primary flex-1 py-2.5"
                >
                  {isPending ? 'Kaydediliyor...' : note ? 'Güncelle' : 'Notu Kaydet'}
                </button>
                {editing && (
                  <button onClick={() => { setEditing(false); setContent(note!.content); }} className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
                    İptal
                  </button>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Seans İçeriği</p>
                  <p className="text-sm text-gray-800 whitespace-pre-wrap bg-gray-50 rounded-lg p-3">{note.content}</p>
                </div>

                {note.emotionalState && (
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Duygusal Durum</p>
                    <p className="text-sm text-gray-700">{note.emotionalState}</p>
                  </div>
                )}

                {note.goals && (
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Hedefler / Ödevler</p>
                    <p className="text-sm text-gray-700">{note.goals}</p>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${note.isSharedWithClient ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {note.isSharedWithClient ? 'Danışanla paylaşıldı' : 'Sadece siz görebilirsiniz'}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(note.createdAt).toLocaleString('tr-TR')}
                  </span>
                </div>
              </div>

              <button onClick={() => setEditing(true)} className="btn-primary w-full py-2.5">
                Notu Düzenle
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

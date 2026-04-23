'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface SessionNote {
  id: string;
  appointmentId: string;
  content: string;
  emotionalState?: string;
  goals?: string;
  isSharedWithClient: boolean;
  createdAt: string;
}

export default function ClientSessionsPage() {
  const { data: appointments, isLoading } = useQuery<{ id: string; startTime: string; psychologist?: { user: { firstName: string; lastName: string } } }[]>({
    queryKey: ['appointments'],
    queryFn: () => api.get('/appointments').then(r => r.data),
  });

  const completedIds = appointments?.filter(a => true).map(a => a.id) ?? [];

  const noteQueries = useQuery<SessionNote[]>({
    queryKey: ['client-session-notes', completedIds.join(',')],
    queryFn: async () => {
      const results: SessionNote[] = [];
      for (const id of completedIds) {
        try {
          const note = await api.get(`/sessions/notes/${id}`).then(r => r.data);
          if (note?.isSharedWithClient) results.push(note);
        } catch {
          // randevuda not yoksa atla
        }
      }
      return results;
    },
    enabled: completedIds.length > 0,
  });

  const notes = noteQueries.data ?? [];

  if (isLoading || noteQueries.isLoading) return <div className="p-6 text-gray-500">Yükleniyor...</div>;

  const getAppointmentInfo = (appointmentId: string) =>
    appointments?.find(a => a.id === appointmentId);

  return (
    <div className="p-6 space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Seans Notları</h1>
        <p className="text-gray-500 text-sm mt-1">Psikologunuzun sizinle paylaştığı seans notları</p>
      </div>

      <div className="space-y-4">
        {notes.length === 0 ? (
          <div className="card text-center py-8">
            <p className="text-gray-400 text-sm">Henüz paylaşılmış seans notu yok.</p>
            <p className="text-gray-300 text-xs mt-1">Psikologunuz notları paylaştığında burada görünecek.</p>
          </div>
        ) : (
          notes.map(note => {
            const apt = getAppointmentInfo(note.appointmentId);
            return (
              <div key={note.id} className="card space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    {apt && (
                      <p className="text-sm font-medium text-gray-700">
                        {apt.psychologist?.user.firstName} {apt.psychologist?.user.lastName}
                      </p>
                    )}
                    <p className="text-xs text-gray-400">
                      {new Date(note.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Paylaşıldı</span>
                </div>

                <p className="text-sm text-gray-800 whitespace-pre-wrap bg-gray-50 rounded-lg p-3 leading-relaxed">
                  {note.content}
                </p>

                {note.emotionalState && (
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Duygusal Durum</p>
                    <p className="text-sm text-gray-700">{note.emotionalState}</p>
                  </div>
                )}

                {note.goals && (
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Hedefler / Ödevler</p>
                    <p className="text-sm text-gray-700">{note.goals}</p>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

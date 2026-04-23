'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  readAt: string | null;
  createdAt: string;
}

const typeIcon: Record<string, string> = {
  APPOINTMENT_CREATED: '📅',
  APPOINTMENT_CONFIRMED: '✅',
  APPOINTMENT_CANCELLED: '❌',
  APPOINTMENT_REMINDER: '🔔',
  TEST_ASSIGNED: '🧪',
  TEST_COMPLETED: '📊',
};

export default function PsychologistNotificationsPage() {
  const qc = useQueryClient();

  const { data: notifications, isLoading } = useQuery<Notification[]>({
    queryKey: ['notifications'],
    queryFn: () => api.get('/notifications').then((r) => r.data),
  });

  const markAllRead = useMutation({
    mutationFn: () => api.patch('/notifications/read-all'),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const markRead = useMutation({
    mutationFn: (id: string) => api.patch(`/notifications/${id}/read`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const unreadCount = notifications?.filter((n) => !n.readAt).length ?? 0;

  if (isLoading) return <div className="p-6 text-gray-500">Yükleniyor...</div>;

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Bildirimler</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-primary-600 mt-1">{unreadCount} okunmamış bildirim</p>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={() => markAllRead.mutate()}
            disabled={markAllRead.isPending}
            className="text-sm text-primary-600 hover:underline"
          >
            Tümünü okundu yap
          </button>
        )}
      </div>

      <div className="space-y-3">
        {!notifications?.length ? (
          <div className="card text-center py-10">
            <p className="text-4xl mb-3">🔕</p>
            <p className="text-gray-400 text-sm">Henüz bildiriminiz yok.</p>
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => { if (!n.readAt) markRead.mutate(n.id); }}
              className={`card !p-4 cursor-pointer transition-colors ${
                !n.readAt ? 'border-primary-200 bg-primary-50/30' : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-xl mt-0.5">{typeIcon[n.type] ?? '🔔'}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className={`text-sm font-medium ${!n.readAt ? 'text-primary-800' : 'text-gray-800'}`}>
                      {n.title}
                    </p>
                    {!n.readAt && (
                      <span className="w-2 h-2 rounded-full bg-primary-500 flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-0.5">{n.body}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {format(new Date(n.createdAt), 'dd MMM yyyy HH:mm', { locale: tr })}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

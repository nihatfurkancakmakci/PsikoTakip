'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import Link from 'next/link';

interface Stats {
  totalUsers: number;
  totalClients: number;
  totalPsychologists: number;
  pendingPsychologists: number;
  totalAppointments: number;
  completedAppointments: number;
  completionRate: number;
  totalTestsCompleted: number;
}

interface PendingPsychologist {
  id: string;
  user: { firstName: string; lastName: string; email: string; createdAt: string };
  specialization: string;
}

export default function AdminDashboard() {
  const qc = useQueryClient();

  const { data: stats } = useQuery<Stats>({
    queryKey: ['admin-stats'],
    queryFn: () => api.get('/admin/stats').then((r) => r.data),
  });

  const { data: pendingPsychs } = useQuery<PendingPsychologist[]>({
    queryKey: ['pending-psychologists'],
    queryFn: () => api.get('/admin/psychologists/pending').then((r) => r.data),
  });

  const approveMutation = useMutation({
    mutationFn: ({ id, approve, reason }: { id: string; approve: boolean; reason?: string }) =>
      api.patch(`/users/psychologists/${id}/approve`, { approve, reason }),
    onSuccess: (_, { approve }) => {
      toast.success(approve ? 'Psikolog onaylandı' : 'Psikolog reddedildi');
      qc.invalidateQueries({ queryKey: ['pending-psychologists'] });
      qc.invalidateQueries({ queryKey: ['admin-stats'] });
    },
    onError: () => toast.error('İşlem başarısız'),
  });

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Admin Paneli</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Toplam Kullanıcı', value: stats?.totalUsers ?? 0, color: 'text-primary-600' },
          { label: 'Danışan', value: stats?.totalClients ?? 0, color: 'text-calm-600' },
          { label: 'Onaylı Psikolog', value: stats?.totalPsychologists ?? 0, color: 'text-green-600' },
          { label: 'Onay Bekleyen', value: stats?.pendingPsychologists ?? 0, color: 'text-yellow-600' },
        ].map((s) => (
          <div key={s.label} className="card">
            <p className="text-sm text-gray-500">{s.label}</p>
            <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card">
          <p className="text-sm text-gray-500">Toplam Randevu</p>
          <p className="text-2xl font-bold">{stats?.totalAppointments ?? 0}</p>
          <p className="text-xs text-gray-400 mt-1">
            Tamamlanma: %{stats?.completionRate ?? 0}
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Tamamlanan Testler</p>
          <p className="text-2xl font-bold text-purple-600">{stats?.totalTestsCompleted ?? 0}</p>
        </div>
        <div className="card flex flex-col gap-2">
          <Link href="/admin/audit" className="btn-primary text-center text-sm">
            Audit Log
          </Link>
          <Link href="/admin/users" className="text-center text-sm border border-gray-300 rounded-lg py-2 hover:bg-gray-50">
            Kullanıcı Yönetimi
          </Link>
        </div>
      </div>

      {!!pendingPsychs?.length && (
        <div className="card">
          <h2 className="font-semibold text-gray-800 mb-4">
            Onay Bekleyen Psikologlar ({pendingPsychs.length})
          </h2>
          <div className="space-y-3">
            {pendingPsychs.map((p) => (
              <div key={p.id} className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div>
                  <p className="font-medium">{p.user.firstName} {p.user.lastName}</p>
                  <p className="text-sm text-gray-500">{p.user.email}</p>
                  <p className="text-xs text-gray-400">{p.specialization}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => approveMutation.mutate({ id: p.id, approve: true })}
                    className="text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 disabled:opacity-50"
                    disabled={approveMutation.isPending}
                  >
                    Onayla
                  </button>
                  <button
                    onClick={() => approveMutation.mutate({ id: p.id, approve: false, reason: 'Bilgiler eksik' })}
                    className="text-xs bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-700 disabled:opacity-50"
                    disabled={approveMutation.isPending}
                  >
                    Reddet
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

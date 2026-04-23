'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface AuditLog {
  id: string;
  userId?: string;
  action: string;
  entity: string;
  entityId?: string;
  ipAddress?: string;
  statusCode?: number;
  createdAt: string;
  user?: { firstName: string; lastName: string; email: string };
}

interface AuditResponse {
  data: AuditLog[];
  total: number;
  page: number;
  totalPages: number;
}

const actionColor: Record<string, string> = {
  CREATE: 'bg-green-100 text-green-700',
  UPDATE: 'bg-blue-100 text-blue-700',
  DELETE: 'bg-red-100 text-red-700',
  LOGIN: 'bg-purple-100 text-purple-700',
  LOGOUT: 'bg-gray-100 text-gray-600',
  REGISTER: 'bg-yellow-100 text-yellow-700',
};

export default function AdminAuditPage() {
  const [page, setPage] = useState(1);
  const [actionFilter, setActionFilter] = useState('');
  const limit = 20;

  const { data, isLoading } = useQuery<AuditResponse>({
    queryKey: ['audit-logs', page, actionFilter],
    queryFn: () => {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (actionFilter) params.set('action', actionFilter);
      return api.get(`/audit?${params}`).then(r => r.data);
    },
  });

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Audit Log</h1>
        <p className="text-gray-500 text-sm mt-1">Sistem genelindeki tüm kritik işlemler</p>
      </div>

      <div className="flex gap-3">
        <select className="input-field w-48" value={actionFilter} onChange={e => { setActionFilter(e.target.value); setPage(1); }}>
          <option value="">Tüm İşlemler</option>
          <option value="LOGIN">Giriş</option>
          <option value="LOGOUT">Çıkış</option>
          <option value="REGISTER">Kayıt</option>
          <option value="CREATE">Oluştur</option>
          <option value="UPDATE">Güncelle</option>
          <option value="DELETE">Sil</option>
        </select>
        {data && <span className="text-sm text-gray-400 flex items-center">Toplam: {data.total} kayıt</span>}
      </div>

      <div className="card overflow-hidden !p-0">
        {isLoading ? (
          <div className="p-6 text-center text-gray-400">Yükleniyor...</div>
        ) : !data?.data.length ? (
          <div className="p-6 text-center text-gray-400">Kayıt bulunamadı.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-left">
                  <th className="px-4 py-3 font-medium text-gray-600">Zaman</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Kullanıcı</th>
                  <th className="px-4 py-3 font-medium text-gray-600">İşlem</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Varlık</th>
                  <th className="px-4 py-3 font-medium text-gray-600">IP</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Durum</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data.data.map(log => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString('tr-TR')}
                    </td>
                    <td className="px-4 py-3">
                      {log.user ? (
                        <>
                          <p className="font-medium text-gray-800">{log.user.firstName} {log.user.lastName}</p>
                          <p className="text-xs text-gray-400">{log.user.email}</p>
                        </>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${actionColor[log.action] ?? 'bg-gray-100 text-gray-600'}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600">
                      <span>{log.entity}</span>
                      {log.entityId && <span className="text-gray-400 ml-1">#{log.entityId.slice(0, 8)}</span>}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400 font-mono">{log.ipAddress ?? '—'}</td>
                    <td className="px-4 py-3">
                      {log.statusCode && (
                        <span className={`text-xs font-medium ${log.statusCode >= 400 ? 'text-red-600' : 'text-green-600'}`}>
                          {log.statusCode}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50"
          >← Önceki</button>
          <span className="text-sm text-gray-500">{page} / {data.totalPages}</span>
          <button
            onClick={() => setPage(p => Math.min(data.totalPages, p + 1))}
            disabled={page === data.totalPages}
            className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50"
          >Sonraki →</button>
        </div>
      )}
    </div>
  );
}

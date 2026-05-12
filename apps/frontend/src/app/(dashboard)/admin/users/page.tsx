'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { User, UserRole } from '@/types';
import { toast } from 'sonner';
import { formatTurkishMobilePhone, normalizeTurkishMobilePhone } from '@/lib/auth-validation';

interface UserWithMeta extends User {
  createdAt: string;
  isActive: boolean;
  psychologist?: { id: string; approvalStatus: string };
}

const roleLabel: Record<UserRole, string> = {
  GUEST: 'Misafir',
  CLIENT: 'Danışan',
  PSYCHOLOGIST: 'Psikolog',
  ADMIN: 'Admin',
};

const roleColor: Record<UserRole, string> = {
  GUEST: 'bg-gray-100 text-gray-600',
  CLIENT: 'bg-green-100 text-green-700',
  PSYCHOLOGIST: 'bg-blue-100 text-blue-700',
  ADMIN: 'bg-purple-100 text-purple-700',
};

export default function AdminUsersPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | ''>('');
  const [psychForm, setPsychForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    specialization: '',
  });

  const { data: users, isLoading } = useQuery<UserWithMeta[]>({
    queryKey: ['admin-users', search, roleFilter],
    queryFn: () => {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (roleFilter) params.set('role', roleFilter);
      return api.get(`/users?${params}`).then(r => r.data);
    },
  });

  const approveMutation = useMutation({
    mutationFn: ({ psychId, status }: { psychId: string; status: 'APPROVED' | 'REJECTED' }) =>
      api.patch(`/users/psychologists/${psychId}/approval`, { status }),
    onMutate: async ({ psychId, status }) => {
      await qc.cancelQueries({ queryKey: ['admin-users', search, roleFilter] });
      const prev = qc.getQueryData<UserWithMeta[]>(['admin-users', search, roleFilter]);
      qc.setQueryData<UserWithMeta[]>(['admin-users', search, roleFilter], old =>
        old?.map(u => u.psychologist?.id === psychId
          ? { ...u, psychologist: { ...u.psychologist!, approvalStatus: status } }
          : u) ?? []
      );
      return { prev };
    },
    onSuccess: (_, { status }) => {
      toast.success(status === 'APPROVED' ? 'Psikolog onaylandı' : 'Psikolog reddedildi');
      qc.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: (e: any, _, ctx) => {
      if (ctx?.prev) qc.setQueryData(['admin-users', search, roleFilter], ctx.prev);
      toast.error(e.response?.data?.message ?? 'Hata');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (userId: string) => api.delete(`/users/${userId}`),
    onMutate: async (userId) => {
      await qc.cancelQueries({ queryKey: ['admin-users', search, roleFilter] });
      const prev = qc.getQueryData<UserWithMeta[]>(['admin-users', search, roleFilter]);
      qc.setQueryData<UserWithMeta[]>(['admin-users', search, roleFilter], old =>
        old?.filter(u => u.id !== userId) ?? []
      );
      return { prev };
    },
    onSuccess: () => toast.success('Kullanıcı silindi'),
    onError: (e: any, _, ctx) => {
      if (ctx?.prev) qc.setQueryData(['admin-users', search, roleFilter], ctx.prev);
      toast.error(e.response?.data?.message ?? 'Hata');
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ['admin-users'] }),
  });

  const createPsychologistMutation = useMutation({
    mutationFn: () => api.post('/users/psychologists', {
      ...psychForm,
      phone: `+90${normalizeTurkishMobilePhone(psychForm.phone)}`,
    }),
    onSuccess: () => {
      toast.success('Psikolog oluşturuldu');
      setPsychForm({ firstName: '', lastName: '', email: '', phone: '', password: '', specialization: '' });
      qc.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: (e: any) => toast.error(e.response?.data?.message ?? 'Psikolog oluşturulamadı'),
  });

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Kullanıcılar</h1>
        <p className="text-gray-500 text-sm mt-1">Tüm sistem kullanıcılarını yönetin</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          className="input-field flex-1"
          placeholder="Ad, soyad veya e-posta ara..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select className="input-field sm:w-40" value={roleFilter} onChange={e => setRoleFilter(e.target.value as UserRole | '')}>
          <option value="">Tüm Roller</option>
          <option value="CLIENT">Danışan</option>
          <option value="PSYCHOLOGIST">Psikolog</option>
          <option value="ADMIN">Admin</option>
        </select>
      </div>

      <div className="card space-y-4">
        <div>
          <h2 className="font-semibold text-gray-800">Psikolog Ekle</h2>
          <p className="text-xs text-gray-500 mt-1">Psikolog hesapları yalnızca admin tarafından oluşturulur.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input className="input-field" placeholder="Ad" value={psychForm.firstName} onChange={(e) => setPsychForm((f) => ({ ...f, firstName: e.target.value }))} />
          <input className="input-field" placeholder="Soyad" value={psychForm.lastName} onChange={(e) => setPsychForm((f) => ({ ...f, lastName: e.target.value }))} />
          <input className="input-field" type="email" placeholder="E-posta" value={psychForm.email} onChange={(e) => setPsychForm((f) => ({ ...f, email: e.target.value }))} />
          <div className="flex gap-2">
            <select className="input-field w-24" defaultValue="+90" aria-label="Ülke kodu">
              <option value="+90">+90</option>
            </select>
            <input
              className="input-field"
              inputMode="numeric"
              placeholder="545 987 12 45"
              value={psychForm.phone}
              onChange={(e) => setPsychForm((f) => ({ ...f, phone: formatTurkishMobilePhone(e.target.value) }))}
            />
          </div>
          <input className="input-field" type="password" placeholder="Geçici şifre" value={psychForm.password} onChange={(e) => setPsychForm((f) => ({ ...f, password: e.target.value }))} />
          <input className="input-field" placeholder="Uzmanlık" value={psychForm.specialization} onChange={(e) => setPsychForm((f) => ({ ...f, specialization: e.target.value }))} />
        </div>
        <button
          type="button"
          className="btn-primary"
          disabled={createPsychologistMutation.isPending}
          onClick={() => createPsychologistMutation.mutate()}
        >
          {createPsychologistMutation.isPending ? 'Oluşturuluyor...' : 'Psikolog Oluştur'}
        </button>
      </div>

      <div className="card overflow-hidden !p-0">
        {isLoading ? (
          <div className="p-6 text-center text-gray-400">Yükleniyor...</div>
        ) : !users || users.length === 0 ? (
          <div className="p-6 text-center text-gray-400">Kullanıcı bulunamadı.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-left">
                  <th className="px-4 py-3 font-medium text-gray-600">Kullanıcı</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Rol</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Kayıt</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Durum</th>
                  <th className="px-4 py-3 font-medium text-gray-600">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800">{u.firstName} {u.lastName}</p>
                      <p className="text-xs text-gray-400">{u.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${roleColor[u.role]}`}>{roleLabel[u.role]}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {new Date(u.createdAt).toLocaleDateString('tr-TR')}
                    </td>
                    <td className="px-4 py-3">
                      {u.role === 'PSYCHOLOGIST' && u.psychologist ? (
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          u.psychologist.approvalStatus === 'APPROVED' ? 'bg-green-100 text-green-700' :
                          u.psychologist.approvalStatus === 'REJECTED' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {u.psychologist.approvalStatus === 'APPROVED' ? 'Onaylı' :
                           u.psychologist.approvalStatus === 'REJECTED' ? 'Reddedildi' : 'Bekliyor'}
                        </span>
                      ) : (
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${u.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {u.isActive ? 'Aktif' : 'Pasif'}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 flex-wrap">
                        {u.role === 'PSYCHOLOGIST' && u.psychologist?.approvalStatus === 'PENDING_APPROVAL' && (
                          <>
                            <button
                              onClick={() => approveMutation.mutate({ psychId: u.psychologist!.id, status: 'APPROVED' })}
                              className="text-xs bg-green-600 text-white px-2.5 py-1 rounded hover:bg-green-700"
                            >Onayla</button>
                            <button
                              onClick={() => approveMutation.mutate({ psychId: u.psychologist!.id, status: 'REJECTED' })}
                              className="text-xs bg-red-100 text-red-700 px-2.5 py-1 rounded hover:bg-red-200"
                            >Reddet</button>
                          </>
                        )}
                        {u.role !== 'ADMIN' && (
                          <button
                            onClick={() => {
                              if (confirm(`${u.firstName} ${u.lastName} adlı kullanıcıyı kalıcı olarak silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`)) {
                                deleteMutation.mutate(u.id);
                              }
                            }}
                            className="text-xs bg-red-600 text-white px-2.5 py-1 rounded hover:bg-red-700"
                          >Sil</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

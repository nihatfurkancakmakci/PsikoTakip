'use client';

import { useEffect, useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface ClientProfile {
  dateOfBirth?: string;
  gender?: string;
  emergencyContact?: string;
  healthNotes?: string;
  user: { firstName: string; lastName: string; email: string };
}

export default function ClientProfilePage() {
  const { user } = useAuth();
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');

  const { data: profile, isLoading } = useQuery<ClientProfile>({
    queryKey: ['client-profile'],
    queryFn: () => api.get('/users/clients/profile').then(r => r.data),
  });

  useEffect(() => {
    if (!profile) return;
    setDateOfBirth(profile.dateOfBirth ? profile.dateOfBirth.split('T')[0] : '');
    setGender(profile.gender ?? '');
    setEmergencyContact(profile.emergencyContact ?? '');
  }, [profile]);

  const mutation = useMutation({
    mutationFn: () => api.put('/users/clients/profile', {
      dateOfBirth: dateOfBirth || undefined,
      gender: gender || undefined,
      emergencyContact: emergencyContact || undefined,
    }),
    onSuccess: () => toast.success('Profil güncellendi'),
    onError: (e: any) => toast.error(e.response?.data?.message ?? 'Hata oluştu'),
  });

  const exportData = async () => {
    try {
      const res = await api.get('/users/me/export');
      const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `psikotakip-verilerim-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Verileriniz indirildi');
    } catch {
      toast.error('Dışa aktarma başarısız');
    }
  };

  if (isLoading) return <div className="p-6 text-gray-500">Yükleniyor...</div>;

  return (
    <div className="p-6 max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Profilim</h1>
        <p className="text-gray-500 text-sm mt-1">Kişisel bilgilerinizi güncelleyin</p>
      </div>

      <div className="card space-y-4">
        <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
          <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-lg">
            {user?.firstName[0]}{user?.lastName[0]}
          </div>
          <div>
            <p className="font-semibold text-gray-800">{user?.firstName} {user?.lastName}</p>
            <p className="text-sm text-gray-500">{user?.email}</p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Doğum Tarihi</label>
          <input type="date" className="input-field" value={dateOfBirth} onChange={e => setDateOfBirth(e.target.value)} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Cinsiyet</label>
          <select className="input-field" value={gender} onChange={e => setGender(e.target.value)}>
            <option value="">Belirtmek istemiyorum</option>
            <option value="MALE">Erkek</option>
            <option value="FEMALE">Kadın</option>
            <option value="OTHER">Diğer</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Acil İletişim</label>
          <input type="text" className="input-field" value={emergencyContact} onChange={e => setEmergencyContact(e.target.value)} placeholder="Ad Soyad – Telefon" />
        </div>

        <button onClick={() => mutation.mutate()} disabled={mutation.isPending} className="btn-primary w-full py-3">
          {mutation.isPending ? 'Kaydediliyor...' : 'Kaydet'}
        </button>
      </div>

      <div className="card space-y-3">
        <h2 className="text-sm font-semibold text-gray-700">KVKK – Kişisel Verilerim</h2>
        <p className="text-xs text-gray-400">6698 sayılı KVKK kapsamında tüm kişisel verilerinizi indirebilirsiniz.</p>
        <button onClick={exportData} className="w-full py-2.5 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors">
          Verilerimi İndir (JSON)
        </button>
      </div>
    </div>
  );
}

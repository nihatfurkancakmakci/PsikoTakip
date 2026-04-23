'use client';

import { useEffect, useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface PsychProfile {
  specialization: string;
  biography?: string;
  photoUrl?: string;
  sessionDurationMin: number;
  isAcceptingClients: boolean;
  approvalStatus: string;
  workingHours?: Record<string, { start: string; end: string }>;
}

const DAYS = [
  { key: 'monday', label: 'Pazartesi' },
  { key: 'tuesday', label: 'Salı' },
  { key: 'wednesday', label: 'Çarşamba' },
  { key: 'thursday', label: 'Perşembe' },
  { key: 'friday', label: 'Cuma' },
  { key: 'saturday', label: 'Cumartesi' },
  { key: 'sunday', label: 'Pazar' },
];

export default function PsychProfilePage() {
  const [specialization, setSpecialization] = useState('');
  const [biography, setBiography] = useState('');
  const [sessionDuration, setSessionDuration] = useState(50);
  const [isAccepting, setIsAccepting] = useState(true);
  const [workingHours, setWorkingHours] = useState<Record<string, { start: string; end: string } | null>>({});

  const { data: profile, isLoading } = useQuery<PsychProfile>({
    queryKey: ['psych-profile'],
    queryFn: () => api.get('/users/psychologists/profile').then(r => r.data),
  });

  useEffect(() => {
    if (!profile) return;
    setSpecialization(profile.specialization ?? '');
    setBiography(profile.biography ?? '');
    setSessionDuration(profile.sessionDurationMin ?? 50);
    setIsAccepting(profile.isAcceptingClients ?? true);
    const wh: Record<string, { start: string; end: string } | null> = {};
    DAYS.forEach(d => {
      wh[d.key] = (profile.workingHours as any)?.[d.key] ?? null;
    });
    setWorkingHours(wh);
  }, [profile]);

  const mutation = useMutation({
    mutationFn: () => api.put('/users/psychologists/profile', {
      specialization,
      biography,
      sessionDurationMin: sessionDuration,
      isAcceptingClients: isAccepting,
      workingHours: Object.fromEntries(
        Object.entries(workingHours).filter(([, v]) => v !== null)
      ),
    }),
    onSuccess: () => toast.success('Profil güncellendi'),
    onError: (e: any) => toast.error(e.response?.data?.message ?? 'Hata oluştu'),
  });

  const toggleDay = (key: string) => {
    setWorkingHours(prev => ({
      ...prev,
      [key]: prev[key] ? null : { start: '09:00', end: '17:00' },
    }));
  };

  if (isLoading) return <div className="p-6 text-gray-500">Yükleniyor...</div>;

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Profilim</h1>
          <p className="text-gray-500 text-sm mt-1">Danışanlara görünen bilgilerinizi güncelleyin</p>
        </div>
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
          profile?.approvalStatus === 'APPROVED' ? 'bg-green-100 text-green-700' :
          profile?.approvalStatus === 'REJECTED' ? 'bg-red-100 text-red-700' :
          'bg-yellow-100 text-yellow-700'
        }`}>
          {profile?.approvalStatus === 'APPROVED' ? 'Onaylı' :
           profile?.approvalStatus === 'REJECTED' ? 'Reddedildi' : 'Onay Bekliyor'}
        </span>
      </div>

      <div className="card space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Uzmanlık Alanı</label>
          <input type="text" className="input-field" value={specialization} onChange={e => setSpecialization(e.target.value)} placeholder="örn. Bilişsel Davranışçı Terapi" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Biyografi</label>
          <textarea className="input-field" rows={4} value={biography} onChange={e => setBiography(e.target.value)} placeholder="Kendinizi kısaca tanıtın..." />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Seans Süresi (dakika)</label>
            <select className="input-field" value={sessionDuration} onChange={e => setSessionDuration(Number(e.target.value))}>
              {[30, 45, 50, 60, 90].map(m => <option key={m} value={m}>{m} dakika</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Danışan Kabul</label>
            <button
              type="button"
              onClick={() => setIsAccepting(!isAccepting)}
              className={`w-full py-2 rounded-lg border text-sm font-medium transition-colors ${
                isAccepting ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-600 border-gray-300'
              }`}
            >
              {isAccepting ? 'Kabul Ediyorum' : 'Kabul Etmiyorum'}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Çalışma Saatleri</label>
          <div className="space-y-2">
            {DAYS.map(d => (
              <div key={d.key} className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => toggleDay(d.key)}
                  className={`w-24 text-xs py-1.5 rounded-lg border font-medium transition-colors ${
                    workingHours[d.key] ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-400 border-gray-200'
                  }`}
                >
                  {d.label}
                </button>
                {workingHours[d.key] && (
                  <div className="flex items-center gap-2 text-sm">
                    <input
                      type="time"
                      value={workingHours[d.key]!.start}
                      onChange={e => setWorkingHours(prev => ({ ...prev, [d.key]: { ...prev[d.key]!, start: e.target.value } }))}
                      className="input-field !py-1 !w-28"
                    />
                    <span className="text-gray-400">–</span>
                    <input
                      type="time"
                      value={workingHours[d.key]!.end}
                      onChange={e => setWorkingHours(prev => ({ ...prev, [d.key]: { ...prev[d.key]!, end: e.target.value } }))}
                      className="input-field !py-1 !w-28"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <button onClick={() => mutation.mutate()} disabled={mutation.isPending} className="btn-primary w-full py-3">
          {mutation.isPending ? 'Kaydediliyor...' : 'Profili Kaydet'}
        </button>
      </div>
    </div>
  );
}

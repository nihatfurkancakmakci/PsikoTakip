'use client';

import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, API_ORIGIN } from '@/lib/api';
import { toast } from 'sonner';
import { Camera, Upload } from 'lucide-react';

interface PsychProfile {
  specialization: string;
  biography?: string;
  photoUrl?: string;
  educationInfo?: string;
  experienceYears?: number;
  certificates?: string;
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
  const qc = useQueryClient();
  const [specialization, setSpecialization] = useState('');
  const [biography, setBiography] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [educationInfo, setEducationInfo] = useState('');
  const [experienceYears, setExperienceYears] = useState<number | ''>('');
  const [certificates, setCertificates] = useState('');
  const [sessionDuration, setSessionDuration] = useState(50);
  const [isAccepting, setIsAccepting] = useState(true);
  const [workingHours, setWorkingHours] = useState<Record<string, { start: string; end: string } | null>>({});
  const photoSrc = photoUrl?.startsWith('/uploads') ? `${API_ORIGIN}${photoUrl}` : photoUrl;

  const { data: profile, isLoading } = useQuery<PsychProfile>({
    queryKey: ['psych-profile'],
    queryFn: () => api.get('/users/psychologists/profile').then(r => r.data),
  });

  useEffect(() => {
    if (!profile) return;
    setSpecialization(profile.specialization ?? '');
    setBiography(profile.biography ?? '');
    setPhotoUrl(profile.photoUrl ?? '');
    setEducationInfo(profile.educationInfo ?? '');
    setExperienceYears(profile.experienceYears ?? '');
    setCertificates(profile.certificates ?? '');
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
      ...(photoUrl && { photoUrl }),
      educationInfo,
      ...(experienceYears !== '' && { experienceYears: Number(experienceYears) }),
      certificates,
      sessionDurationMin: sessionDuration,
      isAcceptingClients: isAccepting,
      workingHours: Object.fromEntries(
        Object.entries(workingHours).filter(([, v]) => v !== null)
      ),
    }),
    onSuccess: () => toast.success('Profil güncellendi'),
    onError: (e: any) => toast.error(e.response?.data?.message ?? 'Hata oluştu'),
  });

  const photoMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('photo', file);
      const { data } = await api.post('/users/psychologists/profile/photo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data as { photoUrl: string };
    },
    onSuccess: (data) => {
      setPhotoUrl(data.photoUrl);
      qc.invalidateQueries({ queryKey: ['psych-profile'] });
      toast.success('Profil fotoğrafı yüklendi');
    },
    onError: (e: any) => toast.error(e.response?.data?.message ?? 'Fotoğraf yüklenemedi'),
  });

  const uploadPhoto = (file?: File) => {
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
      toast.error('Sadece JPG, PNG, WEBP veya GIF yükleyebilirsiniz');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Fotoğraf 5 MB sınırını aşmamalı');
      return;
    }
    photoMutation.mutate(file);
  };

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
        {/* Fotoğraf */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Profil Fotoğrafı</label>
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-slate-100 border border-gray-200 overflow-hidden flex items-center justify-center flex-shrink-0">
              {photoSrc ? (
                <img
                  src={photoSrc}
                  alt="Profil"
                  className="w-full h-full object-cover"
                  onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              ) : (
                <Camera className="w-7 h-7 text-slate-400" />
              )}
            </div>
            <div className="flex-1">
              <label className="btn-secondary cursor-pointer">
                <Upload className="w-4 h-4" />
                {photoMutation.isPending ? 'Yükleniyor...' : 'Fotoğraf Yükle'}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  disabled={photoMutation.isPending}
                  onChange={(e) => uploadPhoto(e.target.files?.[0])}
                />
              </label>
              <p className="text-xs text-gray-400 mt-2">JPG, PNG, WEBP veya GIF. En fazla 5 MB.</p>
            </div>
          </div>
        </div>

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
            <label className="block text-sm font-medium text-gray-700 mb-1">Deneyim Süresi (yıl)</label>
            <input
              type="number"
              min={0}
              max={50}
              className="input-field"
              value={experienceYears}
              onChange={e => setExperienceYears(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="örn. 5"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Eğitim Bilgileri</label>
            <input type="text" className="input-field" value={educationInfo} onChange={e => setEducationInfo(e.target.value)} placeholder="örn. Psikoloji Lisans - İÜ" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Sertifikalar</label>
          <textarea className="input-field" rows={2} value={certificates} onChange={e => setCertificates(e.target.value)} placeholder="Her satıra bir sertifika, örn.&#10;CBT Sertifikası&#10;EMDR Uygulayıcı Belgesi" />
          <p className="text-xs text-gray-400 mt-1">Her satıra bir sertifika adı yazın</p>
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

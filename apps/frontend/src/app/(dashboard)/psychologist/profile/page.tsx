'use client';

import { useEffect, useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, API_ORIGIN } from '@/lib/api';
import { toast } from 'sonner';
import { Camera, Upload, Check, FileText, Image as ImageIcon, Trash2, X } from 'lucide-react';
import ReactCrop, { Crop, PixelCrop, makeAspectCrop, centerCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

interface PsychProfile {
  specializations: string[];
  biography?: string;
  photoUrl?: string;
  educationInfo?: string;
  experienceYears?: number;
  certificates?: string;
  sessionDurationMin: number;
  isAcceptingClients: boolean;
  approvalStatus: string;
  workingHours?: Record<string, {
    IN_PERSON?: { start: string; end: string };
    ONLINE?: { start: string; end: string };
  }>;
}

interface CustomCert {
  name: string;
  fileUrl?: string;
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

const SPECIALIZATIONS = [
  'Klinik Psikoloji',
  'Çocuk ve Ergen Psikolojisi',
  'Aile ve Çift Danışmanlığı',
  'Endüstri ve Örgüt Psikolojisi',
  'Nörobilim ve Bilişsel Psikoloji',
  'Travma ve Kriz Müdahalesi',
  'Bağımlılık Danışmanlığı',
  'Sağlık Psikolojisi',
];

const CERTIFICATE_CATEGORIES = [
  {
    category: 'Klinik Psikoloji Uzmanlığı',
    items: [
      'Bilişsel Davranışçı Terapi (BDT) Sertifikası',
      'EMDR (Travma Terapisi) Sertifikası',
      'Şema Terapi Sertifikası',
      'MMPI (Kişilik Testi) Sertifikası',
    ],
  },
  {
    category: 'Çocuk ve Ergen Psikolojisi Uzmanlığı',
    items: [
      'WISC-IV (Zeka Testi) Uygulayıcı Sertifikası',
      'Oyun Terapisi Sertifikası',
      'Çocuk Objektif ve Projektif Testler Sertifikası',
    ],
  },
  {
    category: 'Aile ve Çift Danışmanlığı Uzmanlığı',
    items: [
      '450 Saatlik Aile Danışmanlığı Sertifikası',
      'Gottman Çift Terapisi Sertifikası',
    ],
  },
];

const generateTimeOptions = (startHour: number, endHour: number) => {
  const options = [];
  for (let h = startHour; h <= endHour; h++) {
    const hh = h.toString().padStart(2, '0');
    options.push(`${hh}:00`);
    if (h !== endHour) options.push(`${hh}:30`);
  }
  return options;
};

const IN_PERSON_TIMES = generateTimeOptions(9, 19);
const ONLINE_TIMES = generateTimeOptions(9, 22);

function centerAspectCrop(mediaWidth: number, mediaHeight: number, aspect: number) {
  return centerCrop(makeAspectCrop({ unit: '%', width: 90 }, aspect, mediaWidth, mediaHeight), mediaWidth, mediaHeight);
}

export default function PsychProfilePage() {
  const qc = useQueryClient();
  const [specializations, setSpecializations] = useState<string[]>([]);
  const [biography, setBiography] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [educationInfo, setEducationInfo] = useState('');
  const [experienceYears, setExperienceYears] = useState<number | ''>('');
  const [selectedCerts, setSelectedCerts] = useState<string[]>([]);
  const [customCerts, setCustomCerts] = useState<CustomCert[]>([]);
  const [newCertName, setNewCertName] = useState('');
  const [showAddCert, setShowAddCert] = useState(false);
  const [isAccepting, setIsAccepting] = useState(true);
  const [workingHours, setWorkingHours] = useState<Record<string, {
    IN_PERSON?: { start: string; end: string } | null;
    ONLINE?: { start: string; end: string } | null;
  }>>({});
  const photoSrc = photoUrl?.startsWith('/uploads') ? `${API_ORIGIN}${photoUrl}` : photoUrl;

  // Crop State
  const [cropSrc, setCropSrc] = useState<string>('');
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const imgRef = useRef<HTMLImageElement>(null);
  const [showPhotoDropdown, setShowPhotoDropdown] = useState(false);

  const { data: profile, isLoading } = useQuery<PsychProfile>({
    queryKey: ['psych-profile'],
    queryFn: () => api.get('/users/psychologists/profile').then(r => r.data),
  });

  useEffect(() => {
    if (!profile) return;
    setSpecializations(profile.specializations ?? []);
    setBiography(profile.biography ?? '');
    setPhotoUrl(profile.photoUrl ?? '');
    setEducationInfo(profile.educationInfo ?? '');
    setExperienceYears(profile.experienceYears ?? '');
    
    const allCerts = (profile.certificates ?? '').split('\n').map(s => s.trim()).filter(Boolean);
    const standard: string[] = [];
    const custom: CustomCert[] = [];
    const allStandardNames = CERTIFICATE_CATEGORIES.flatMap(c => c.items);
    
    allCerts.forEach(cert => {
      if (cert.startsWith('[CUSTOM]')) {
        const parts = cert.replace('[CUSTOM]', '').split('|');
        custom.push({ name: parts[0]?.trim() ?? '', fileUrl: parts[1]?.trim() });
      } else if (allStandardNames.includes(cert)) {
        standard.push(cert);
      } else {
        custom.push({ name: cert });
      }
    });
    
    setSelectedCerts(standard);
    setCustomCerts(custom);
    setIsAccepting(profile.isAcceptingClients ?? true);
    
    const wh: Record<string, any> = {};
    DAYS.forEach(d => {
      wh[d.key] = {
        IN_PERSON: profile.workingHours?.[d.key]?.IN_PERSON ?? null,
        ONLINE: profile.workingHours?.[d.key]?.ONLINE ?? null,
      };
    });
    setWorkingHours(wh);
  }, [profile]);

  const buildCertificatesString = () => {
    const parts: string[] = [...selectedCerts];
    customCerts.forEach(c => {
      if (c.fileUrl) {
        parts.push(`[CUSTOM]${c.name}|${c.fileUrl}`);
      } else {
        parts.push(`[CUSTOM]${c.name}`);
      }
    });
    return parts.join('\n');
  };

  const mutation = useMutation({
    mutationFn: () => {
      const whClean: any = {};
      Object.entries(workingHours).forEach(([day, types]) => {
        const validTypes: any = {};
        if (types.IN_PERSON) validTypes.IN_PERSON = types.IN_PERSON;
        if (types.ONLINE) validTypes.ONLINE = types.ONLINE;
        if (Object.keys(validTypes).length > 0) {
          whClean[day] = validTypes;
        }
      });

      return api.put('/users/psychologists/profile', {
        specializations,
        biography,
        educationInfo,
        ...(experienceYears !== '' && { experienceYears: Number(experienceYears) }),
        certificates: buildCertificatesString(),
        workingHours: whClean,
        isAcceptingClients: isAccepting,
      });
    },
    onSuccess: () => { toast.success('Profil güncellendi'); qc.invalidateQueries({ queryKey: ['psych-profile'] }); },
    onError: (e: any) => toast.error(e.response?.data?.message ?? 'Hata oluştu'),
  });

  const photoMutation = useMutation({
    mutationFn: async (blob: Blob) => {
      const formData = new FormData();
      formData.append('photo', blob, 'profile.jpg');
      const { data } = await api.post('/users/psychologists/profile/photo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data as { photoUrl: string };
    },
    onSuccess: (data) => {
      setPhotoUrl(data.photoUrl);
      qc.invalidateQueries({ queryKey: ['psych-profile'] });
      toast.success('Profil fotoğrafı yüklendi');
      setCropModalOpen(false);
    },
    onError: (e: any) => toast.error(e.response?.data?.message ?? 'Fotoğraf yüklenemedi'),
  });

  const photoRemoveMutation = useMutation({
    mutationFn: () => api.delete('/users/psychologists/profile/photo'),
    onSuccess: () => {
      setPhotoUrl('');
      qc.invalidateQueries({ queryKey: ['psych-profile'] });
      toast.success('Profil fotoğrafı kaldırıldı');
    },
    onError: () => toast.error('Fotoğraf silinemedi'),
  });

  const certUploadMutation = useMutation({
    mutationFn: async ({ file, name }: { file: File; name: string }) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('name', name);
      const { data } = await api.post('/users/psychologists/profile/certificate', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data as { fileUrl: string; name: string };
    },
    onSuccess: (data) => {
      setCustomCerts(prev => [...prev, { name: data.name, fileUrl: data.fileUrl }]);
      setNewCertName('');
      setShowAddCert(false);
      toast.success('Sertifika yüklendi');
    },
  });

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setCropSrc(URL.createObjectURL(file));
      setCropModalOpen(true);
      setShowPhotoDropdown(false);
      e.target.value = '';
    }
  };

  const applyCrop = async () => {
    if (!completedCrop || !imgRef.current) return;
    const canvas = document.createElement('canvas');
    const image = imgRef.current;
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    
    canvas.width = completedCrop.width;
    canvas.height = completedCrop.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0, 0, completedCrop.width, completedCrop.height
    );

    canvas.toBlob(blob => {
      if (blob) photoMutation.mutate(blob);
    }, 'image/jpeg', 0.95);
  };

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    setCrop(centerAspectCrop(width, height, 1));
  };

  const toggleSpecialization = (spec: string) => {
    setSpecializations(prev =>
      prev.includes(spec) ? prev.filter(s => s !== spec) : [...prev, spec]
    );
  };

  const toggleCert = (cert: string) => {
    setSelectedCerts(prev =>
      prev.includes(cert) ? prev.filter(c => c !== cert) : [...prev, cert]
    );
  };

  const removeCustomCert = (index: number) => {
    setCustomCerts(prev => prev.filter((_, i) => i !== index));
  };

  const updateWorkingHours = (day: string, type: 'IN_PERSON' | 'ONLINE', field: 'start' | 'end', value: string) => {
    setWorkingHours(prev => {
      const current = { ...prev[day] };
      if (!current[type]) {
        current[type] = { start: '09:00', end: '17:00' };
      }
      current[type]![field] = value;
      return { ...prev, [day]: current };
    });
  };

  const toggleWorkingType = (day: string, type: 'IN_PERSON' | 'ONLINE') => {
    setWorkingHours(prev => {
      const current = { ...prev[day] };
      if (current[type]) {
        current[type] = null;
      } else {
        current[type] = { start: '09:00', end: '17:00' };
      }
      return { ...prev, [day]: current };
    });
  };

  if (isLoading) return <div className="p-6 text-gray-500">Yükleniyor...</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6 pb-20">
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

      <div className="card space-y-6">
        {/* Fotoğraf */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Profil Fotoğrafı</label>
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-slate-100 border border-gray-200 overflow-hidden flex items-center justify-center flex-shrink-0">
              {photoSrc ? (
                <img src={photoSrc} alt="Profil" className="w-full h-full object-cover" />
              ) : (
                <Camera className="w-7 h-7 text-slate-400" />
              )}
            </div>
            <div className="relative">
              <button 
                onClick={() => setShowPhotoDropdown(!showPhotoDropdown)}
                className="btn-secondary"
              >
                Fotoğrafı Düzenle
              </button>
              
              {showPhotoDropdown && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 shadow-lg rounded-xl overflow-hidden z-10">
                  <label className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 cursor-pointer transition-colors">
                    <Upload className="w-4 h-4" />
                    {photoUrl ? 'Fotoğrafı Değiştir' : 'Fotoğraf Ekle'}
                    <input type="file" accept="image/*" className="hidden" onChange={handlePhotoSelect} />
                  </label>
                  {photoUrl && (
                    <button 
                      onClick={() => { photoRemoveMutation.mutate(); setShowPhotoDropdown(false); }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
                    >
                      <Trash2 className="w-4 h-4" />
                      Fotoğrafı Kaldır
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Uzmanlık Alanı */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Uzmanlık Alanları</label>
          <div className="flex flex-wrap gap-2">
            {SPECIALIZATIONS.map(spec => (
              <button
                key={spec}
                type="button"
                onClick={() => toggleSpecialization(spec)}
                className={`text-left px-3 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                  specializations.includes(spec)
                    ? 'bg-primary-600 text-white border-primary-600 shadow-md shadow-primary-500/20'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                }`}
              >
                {specializations.includes(spec) && <Check className="w-3.5 h-3.5 inline mr-1.5" />}
                {spec}
              </button>
            ))}
          </div>
        </div>

        {/* Biyografi ve Deneyim */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Biyografi</label>
            <textarea className="input-field" rows={4} value={biography} onChange={e => setBiography(e.target.value)} placeholder="Kendinizi kısaca tanıtın..." />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Deneyim Süresi (yıl)</label>
              <input
                type="number" min={0} max={50} className="input-field"
                value={experienceYears} onChange={e => setExperienceYears(e.target.value === '' ? '' : Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Eğitim Bilgileri</label>
              <input type="text" className="input-field" value={educationInfo} onChange={e => setEducationInfo(e.target.value)} />
            </div>
          </div>
        </div>

        {/* Çalışma Saatleri */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <label className="block text-sm font-medium text-gray-700">Çalışma Saatleri</label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={isAccepting} onChange={(e) => setIsAccepting(e.target.checked)} className="rounded border-gray-300 text-primary-600 focus:ring-primary-600" />
              <span className="text-sm font-medium text-gray-700">Danışan Kabul Ediyorum</span>
            </label>
          </div>

          <div className="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-200">
            {DAYS.map(day => (
              <div key={day.key} className="bg-white p-3 rounded-lg border border-gray-200 flex flex-col gap-3">
                <div className="font-medium text-gray-700 w-32">{day.label}</div>
                <div className="flex flex-wrap gap-4 items-center">
                  
                  {/* IN_PERSON toggle */}
                  <div className="flex items-center gap-2 bg-indigo-50 p-2 rounded-lg border border-indigo-100 flex-1 min-w-[200px]">
                    <label className="flex items-center gap-2 cursor-pointer w-24">
                      <input 
                        type="checkbox" 
                        checked={!!workingHours[day.key]?.IN_PERSON} 
                        onChange={() => toggleWorkingType(day.key, 'IN_PERSON')}
                        className="rounded border-indigo-300 text-indigo-600" 
                      />
                      <span className="text-xs font-semibold text-indigo-800">Yüz Yüze</span>
                    </label>
                    {workingHours[day.key]?.IN_PERSON && (
                      <div className="flex items-center gap-1">
                        <select 
                          className="text-xs bg-white border border-gray-200 rounded px-1.5 py-1"
                          value={workingHours[day.key].IN_PERSON!.start}
                          onChange={e => updateWorkingHours(day.key, 'IN_PERSON', 'start', e.target.value)}
                        >
                          {IN_PERSON_TIMES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                        <span className="text-gray-400 text-xs">-</span>
                        <select 
                          className="text-xs bg-white border border-gray-200 rounded px-1.5 py-1"
                          value={workingHours[day.key].IN_PERSON!.end}
                          onChange={e => updateWorkingHours(day.key, 'IN_PERSON', 'end', e.target.value)}
                        >
                          {IN_PERSON_TIMES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </div>
                    )}
                  </div>

                  {/* ONLINE toggle */}
                  <div className="flex items-center gap-2 bg-teal-50 p-2 rounded-lg border border-teal-100 flex-1 min-w-[200px]">
                    <label className="flex items-center gap-2 cursor-pointer w-24">
                      <input 
                        type="checkbox" 
                        checked={!!workingHours[day.key]?.ONLINE} 
                        onChange={() => toggleWorkingType(day.key, 'ONLINE')}
                        className="rounded border-teal-300 text-teal-600" 
                      />
                      <span className="text-xs font-semibold text-teal-800">Online</span>
                    </label>
                    {workingHours[day.key]?.ONLINE && (
                      <div className="flex items-center gap-1">
                        <select 
                          className="text-xs bg-white border border-gray-200 rounded px-1.5 py-1"
                          value={workingHours[day.key].ONLINE!.start}
                          onChange={e => updateWorkingHours(day.key, 'ONLINE', 'start', e.target.value)}
                        >
                          {ONLINE_TIMES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                        <span className="text-gray-400 text-xs">-</span>
                        <select 
                          className="text-xs bg-white border border-gray-200 rounded px-1.5 py-1"
                          value={workingHours[day.key].ONLINE!.end}
                          onChange={e => updateWorkingHours(day.key, 'ONLINE', 'end', e.target.value)}
                        >
                          {ONLINE_TIMES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </div>
                    )}
                  </div>

                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100 flex justify-end">
          <button 
            onClick={() => mutation.mutate()} 
            disabled={mutation.isPending} 
            className="btn-primary w-full sm:w-auto"
          >
            {mutation.isPending ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
          </button>
        </div>
      </div>

      {/* Crop Modal */}
      {cropModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-semibold text-gray-800">Fotoğrafı Kırp</h3>
              <button onClick={() => setCropModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 flex items-center justify-center bg-black/5 min-h-[300px]">
              {cropSrc && (
                <ReactCrop
                  crop={crop}
                  onChange={(_, percentCrop) => setCrop(percentCrop)}
                  onComplete={(c) => setCompletedCrop(c)}
                  aspect={1}
                  circularCrop
                  className="max-h-[60vh]"
                >
                  <img ref={imgRef} src={cropSrc} alt="Crop" onLoad={handleImageLoad} className="max-w-full max-h-[60vh] object-contain" />
                </ReactCrop>
              )}
            </div>
            <div className="p-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50">
              <button onClick={() => setCropModalOpen(false)} className="btn-secondary">İptal</button>
              <button 
                onClick={applyCrop} 
                disabled={!completedCrop || photoMutation.isPending} 
                className="btn-primary"
              >
                {photoMutation.isPending ? 'Yükleniyor...' : 'Kırp ve Yükle'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

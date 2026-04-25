'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';

interface PsychDetail {
  id: string;
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
  user: { firstName: string; lastName: string; email: string };
}

const DAY_LABELS: Record<string, string> = {
  monday: 'Pzt', tuesday: 'Sal', wednesday: 'Çar',
  thursday: 'Per', friday: 'Cum', saturday: 'Cmt', sunday: 'Paz',
};

export default function PsychologistProfilePage() {
  const { psychologistId } = useParams<{ psychologistId: string }>();
  const router = useRouter();

  const { data: psych, isLoading, isError } = useQuery<PsychDetail>({
    queryKey: ['psych-detail', psychologistId],
    queryFn: () => api.get(`/users/psychologists/${psychologistId}`).then(r => r.data),
  });

  if (isLoading) return <div className="p-6 text-gray-500">Yükleniyor...</div>;
  if (isError || !psych) return <div className="p-6 text-red-500">Profil yüklenemedi.</div>;

  const certList = psych.certificates
    ? psych.certificates.split('\n').map(s => s.trim()).filter(Boolean)
    : [];

  const workDays = psych.workingHours
    ? Object.entries(psych.workingHours).filter(([, v]) => v)
    : [];

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-5">
      <button onClick={() => router.back()} className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">
        ← Geri
      </button>

      {/* Üst kart */}
      <div className="card flex items-start gap-5">
        {psych.photoUrl ? (
          <img
            src={psych.photoUrl}
            alt={`${psych.user.firstName} ${psych.user.lastName}`}
            className="w-20 h-20 rounded-full object-cover border-2 border-primary-100 flex-shrink-0"
            onError={e => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-2xl flex-shrink-0">
            {psych.user.firstName[0]}{psych.user.lastName[0]}
          </div>
        )}

        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-gray-900">
            {psych.user.firstName} {psych.user.lastName}
          </h1>
          <p className="text-primary-600 font-medium text-sm mt-0.5">{psych.specialization}</p>

          <div className="flex flex-wrap gap-2 mt-3">
            {psych.experienceYears != null && (
              <span className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full font-medium">
                {psych.experienceYears} yıl deneyim
              </span>
            )}
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${psych.isAcceptingClients ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
              {psych.isAcceptingClients ? 'Yeni danışan kabul ediyor' : 'Şu an müsait değil'}
            </span>
            <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">
              Seans: {psych.sessionDurationMin} dk
            </span>
          </div>
        </div>
      </div>

      {/* Biyografi */}
      {psych.biography && (
        <div className="card space-y-2">
          <h2 className="text-sm font-semibold text-gray-700">Hakkında</h2>
          <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{psych.biography}</p>
        </div>
      )}

      {/* Eğitim + Sertifikalar */}
      {(psych.educationInfo || certList.length > 0) && (
        <div className="card space-y-4">
          {psych.educationInfo && (
            <div>
              <h2 className="text-sm font-semibold text-gray-700 mb-1">Eğitim</h2>
              <p className="text-sm text-gray-600">{psych.educationInfo}</p>
            </div>
          )}
          {certList.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-gray-700 mb-2">Sertifikalar</h2>
              <div className="flex flex-wrap gap-2">
                {certList.map((cert, i) => (
                  <span key={i} className="text-xs bg-calm-50 text-calm-700 border border-calm-200 px-3 py-1 rounded-full">
                    {cert}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Çalışma saatleri */}
      {workDays.length > 0 && (
        <div className="card space-y-2">
          <h2 className="text-sm font-semibold text-gray-700">Çalışma Saatleri</h2>
          <div className="grid grid-cols-2 gap-2">
            {workDays.map(([day, hours]) => (
              <div key={day} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                <span className="text-xs font-medium text-gray-600">{DAY_LABELS[day] ?? day}</span>
                <span className="text-xs text-gray-500">{(hours as any).start} – {(hours as any).end}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Randevu butonu */}
      {psych.isAcceptingClients && (
        <Link
          href={`/client/appointments/new?psychologistId=${psych.id}`}
          className="btn-primary w-full py-3 text-center block text-sm font-semibold rounded-xl"
        >
          Randevu Al
        </Link>
      )}
    </div>
  );
}

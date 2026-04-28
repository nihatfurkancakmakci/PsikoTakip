'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Appointment } from '@/types';
import { format, formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Calendar, Users, Clock, ChevronRight, FlaskConical, Video, MapPin, FileText, CheckCircle } from 'lucide-react';

interface SessionNote {
  id: string;
  appointmentId: string;
  content: string;
  emotionalState?: string;
  goals?: string;
  isSharedWithClient: boolean;
  createdAt: string;
}

interface TestResult {
  id: string;
  totalScore: number;
  scoreCategory: string;
  completedAt: string;
  test: { name: string; code: string };
}

const categoryColor: Record<string, string> = {
  NORMAL: 'text-green-700 bg-green-50',
  HAFIF: 'text-yellow-700 bg-yellow-50',
  ORTA: 'text-orange-700 bg-orange-50',
  AGIR: 'text-red-700 bg-red-50',
};

const statusLabel: Record<string, string> = {
  PENDING: 'Onay Bekliyor', CONFIRMED: 'Onaylandı', CANCELLED: 'İptal', COMPLETED: 'Tamamlandı', NO_SHOW: 'Gelmedi',
};
const statusColor: Record<string, string> = {
  PENDING: 'bg-amber-50 text-amber-700 border border-amber-200',
  CONFIRMED: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  CANCELLED: 'bg-red-50 text-red-700 border border-red-200',
  COMPLETED: 'bg-primary-50 text-primary-700 border border-primary-200',
  NO_SHOW: 'bg-slate-100 text-slate-600 border border-slate-200',
};

function useCountdown(targetDate: string) {
  const [diff, setDiff] = useState(new Date(targetDate).getTime() - Date.now());
  useEffect(() => {
    const id = setInterval(() => setDiff(new Date(targetDate).getTime() - Date.now()), 1000);
    return () => clearInterval(id);
  }, [targetDate]);
  return diff;
}

function formatCountdown(ms: number): { label: string; color: string } {
  if (ms < 0) {
    const elapsed = Math.abs(ms);
    const m = Math.floor(elapsed / 60000);
    const s = Math.floor((elapsed % 60000) / 1000);
    return { label: `Başladı — ${m}d ${s}s geçti`, color: 'bg-green-400 text-white animate-pulse' };
  }
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const label = h > 0 ? `${h}s ${m}d ${s}s` : `${m}d ${s}s`;
  return { label: `Başlamasına ${label}`, color: 'bg-primary-500 text-white' };
}

function NextSessionPanel({ appointment }: { appointment: Appointment }) {
  const qc = useQueryClient();
  const clientUserId = appointment.client?.user?.id;
  const startDiff = useCountdown(appointment.startTime);
  const endDiff = useCountdown(appointment.endTime);
  const sessionStarted = startDiff <= 0;
  const sessionEnded = endDiff <= 0;

  const complete = useMutation({
    mutationFn: () => api.patch(`/appointments/${appointment.id}/status`, { status: 'COMPLETED' }),
    onSuccess: () => {
      toast.success('Seans tamamlandı olarak işaretlendi');
      qc.invalidateQueries({ queryKey: ['psych-appointments'] });
    },
    onError: (e: any) => toast.error(e.response?.data?.message ?? 'Hata oluştu'),
  });

  const { data: notes } = useQuery<SessionNote[]>({
    queryKey: ['client-notes-dash', clientUserId],
    queryFn: () => api.get(`/sessions/clients/${clientUserId}/notes`).then(r => r.data),
    enabled: !!clientUserId,
  });

  const { data: testResults } = useQuery<TestResult[]>({
    queryKey: ['client-tests-dash', clientUserId],
    queryFn: () => api.get(`/tests/progress/${clientUserId}`).then(r => r.data),
    enabled: !!clientUserId,
  });

  const client = appointment.client;
  const initials = client ? `${client.user.firstName[0]}${client.user.lastName[0]}` : '?';
  const { label: timerLabel, color: timerColor } = formatCountdown(startDiff);

  const endLabel = (() => {
    if (!sessionStarted) return null;
    if (sessionEnded) return 'Seans süresi doldu';
    const m = Math.floor(endDiff / 60000);
    const s = Math.floor((endDiff % 60000) / 1000);
    return `Bitimine ${m}d ${s}s`;
  })();

  return (
    <div className="bg-white border border-primary-100 rounded-2xl shadow-sm overflow-hidden">
      {/* Panel header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 p-5 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-primary-200 text-xs font-semibold uppercase tracking-wider">Sıradaki Seans</p>
            <p className="text-white font-bold text-lg mt-0.5">
              {format(new Date(appointment.startTime), 'dd MMMM yyyy, EEEE', { locale: tr })}
            </p>
            <p className="text-primary-100 text-sm">
              {format(new Date(appointment.startTime), 'HH:mm')} – {format(new Date(appointment.endTime), 'HH:mm')}
              {' · '}{appointment.sessionType === 'ONLINE' ? '🎥 Online' : '🏥 Yüz yüze'}
            </p>
          </div>
          <div className="text-right space-y-1.5">
            <div className={`text-xs font-bold px-3 py-1.5 rounded-full ${timerColor}`}>
              {timerLabel}
            </div>
            {sessionStarted && endLabel && (
              <div className={`text-xs font-bold px-3 py-1.5 rounded-full ${sessionEnded ? 'bg-red-400 text-white' : 'bg-white/20 text-white'}`}>
                {endLabel}
              </div>
            )}
          </div>
        </div>

        {/* Client info */}
        <div className="flex items-center gap-3 bg-primary-500/40 rounded-xl p-3">
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-white">{client?.user.firstName} {client?.user.lastName}</p>
            <p className="text-primary-100 text-sm truncate">{client?.user.email}</p>
            {client?.user.phone && <p className="text-primary-200 text-xs">{client.user.phone}</p>}
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <Link
              href={`/psychologist/sessions/${appointment.id}`}
              className="bg-white text-primary-700 text-sm font-bold px-4 py-2 rounded-lg hover:bg-primary-50 transition-colors"
            >
              📝 Seans Notu
            </Link>
            {appointment.videoMeetingUrl && (
              <a
                href={appointment.videoMeetingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-primary-500 text-white text-sm font-bold px-4 py-2 rounded-lg hover:bg-primary-400 transition-colors border border-primary-400"
              >
                🎥 Bağlan
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Seansı tamamla */}
      {appointment.status === 'CONFIRMED' && (
        <div className="px-5 py-3 bg-primary-800/20 border-t border-primary-500/30 flex items-center justify-between">
          <p className="text-primary-100 text-sm">
            {sessionEnded ? 'Seans süresi doldu — tamamlandı olarak işaretleyin' : sessionStarted ? 'Seans devam ediyor' : 'Seans henüz başlamadı'}
          </p>
          <button
            onClick={() => complete.mutate()}
            disabled={complete.isPending}
            className={`text-sm font-bold px-4 py-2 rounded-lg transition-colors ${
              sessionEnded
                ? 'bg-white text-primary-700 hover:bg-primary-50'
                : 'bg-white/20 text-white hover:bg-white/30 border border-white/30'
            }`}
          >
            {complete.isPending ? 'İşleniyor...' : '✓ Seansı Tamamla'}
          </button>
        </div>
      )}

      {/* Body: notes + tests */}
      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-100">

        {/* Geçmiş Seans Notları */}
        <div className="p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-gray-700">Geçmiş Seans Notları</h3>
            {clientUserId && (
              <Link href={`/psychologist/clients/${clientUserId}/progress`} className="text-xs text-primary-600 hover:underline">
                Tümü →
              </Link>
            )}
          </div>
          {!notes?.length ? (
            <p className="text-sm text-gray-400 text-center py-4">Henüz seans notu yok</p>
          ) : (
            <div className="space-y-2.5">
              {notes.slice(0, 3).map(n => (
                <div key={n.id} className="bg-gray-50 rounded-xl p-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-xs text-gray-400">{format(new Date(n.createdAt), 'dd MMM yyyy', { locale: tr })}</p>
                    {n.emotionalState && (
                      <span className="text-xs text-gray-500 italic">{n.emotionalState}</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-700 line-clamp-2">{n.content}</p>
                  {n.goals && (
                    <p className="text-xs text-primary-600 mt-1.5">🎯 {n.goals}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Test Sonuçları */}
        <div className="p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-gray-700">Test Sonuçları</h3>
            <Link href="/psychologist/tests" className="text-xs text-primary-600 hover:underline">
              Test Ata →
            </Link>
          </div>
          {!testResults?.length ? (
            <p className="text-sm text-gray-400 text-center py-4">Tamamlanan test yok</p>
          ) : (
            <div className="space-y-2">
              {testResults.map(r => (
                <div key={r.id} className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2.5">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{r.test?.name ?? '—'}</p>
                    <p className="text-xs text-gray-400">
                      {format(new Date(r.completedAt), 'dd MMM yyyy', { locale: tr })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-base font-bold px-2 py-0.5 rounded-lg ${categoryColor[r.scoreCategory] ?? 'text-gray-700 bg-gray-100'}`}>
                      {r.totalScore}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{r.scoreCategory}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PsychologistDashboard() {
  const { data: appointments, isLoading } = useQuery<Appointment[]>({
    queryKey: ['psych-appointments'],
    queryFn: () => api.get('/appointments').then((r) => r.data),
  });

  const now = new Date();
  const today = now.toDateString();

  const todayAppts = appointments?.filter(a => new Date(a.startTime).toDateString() === today) ?? [];
  const pending = appointments?.filter(a => a.status === 'PENDING') ?? [];

  const nextSession = appointments
    ?.filter(a => ['CONFIRMED', 'PENDING'].includes(a.status) && new Date(a.startTime) > new Date(now.getTime() - 60 * 60 * 1000))
    ?.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())[0];

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-slate-200 border-t-primary-500 rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 animate-slide-up">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Psikolog Paneli</h1>
        <p className="text-slate-500 text-sm mt-0.5">Randevularınızı ve danışanlarınızı yönetin</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 stagger">
        <div className="card">
          <div className="flex items-start justify-between mb-3">
            <p className="text-sm font-medium text-slate-500">Bugünkü Seans</p>
            <div className="w-9 h-9 rounded-xl bg-primary-50 flex items-center justify-center">
              <Clock className="w-4 h-4 text-primary-500" />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-900">{todayAppts.length}</p>
        </div>
        <div className="card">
          <div className="flex items-start justify-between mb-3">
            <p className="text-sm font-medium text-slate-500">Onay Bekleyen</p>
            <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
              <Calendar className="w-4 h-4 text-amber-500" />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-900">{pending.length}</p>
        </div>
        <div className="card">
          <div className="flex items-start justify-between mb-3">
            <p className="text-sm font-medium text-slate-500">Toplam Randevu</p>
            <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center">
              <Users className="w-4 h-4 text-slate-500" />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-900">{appointments?.length ?? 0}</p>
        </div>
        <div className="card flex flex-col justify-between">
          <p className="text-sm font-medium text-slate-500 mb-3">Hızlı Erişim</p>
          <Link href="/psychologist/appointments" className="btn-primary text-sm py-2.5 w-full">
            <Calendar className="w-4 h-4" />
            Randevular
          </Link>
        </div>
      </div>

      {/* Sıradaki Seans */}
      {nextSession ? (
        <NextSessionPanel appointment={nextSession} />
      ) : (
        <div className="card text-center py-12">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-7 h-7 text-emerald-500" />
          </div>
          <p className="text-slate-700 font-semibold">Yaklaşan onaylanmış randevu yok</p>
          <p className="text-slate-400 text-sm mt-1">Yeni randevu talepleri geldiğinde burada görünecek</p>
        </div>
      )}

      {/* Bugünkü randevular (sıradaki dışındakiler) */}
      {todayAppts.filter(a => a.id !== nextSession?.id).length > 0 && (
        <div className="card">
          <h2 className="font-semibold text-slate-900 mb-4">Bugünkü Diğer Randevular</h2>
          <div className="space-y-2.5 stagger">
            {todayAppts.filter(a => a.id !== nextSession?.id).map(a => (
              <div key={a.id} className="flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors duration-150">
                <div>
                  <p className="font-semibold text-slate-800 text-sm">
                    {a.client?.user.firstName} {a.client?.user.lastName}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                    {format(new Date(a.startTime), 'HH:mm', { locale: tr })} – {format(new Date(a.endTime), 'HH:mm', { locale: tr })}
                    <span className="text-slate-300">·</span>
                    {a.sessionType === 'ONLINE'
                      ? <><Video className="w-3 h-3" /> Online</>
                      : <><MapPin className="w-3 h-3" /> Yüz yüze</>
                    }
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${statusColor[a.status]}`}>
                    {statusLabel[a.status]}
                  </span>
                  <Link
                    href={`/psychologist/sessions/${a.id}`}
                    className="text-xs bg-primary-600 text-white px-3 py-1.5 rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-1"
                  >
                    <FileText className="w-3 h-3" /> Not
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bekleyen onaylar */}
      {pending.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-900">Onay Bekleyen Randevular</h2>
            <span className="text-xs font-semibold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">{pending.length}</span>
          </div>
          <div className="space-y-2.5 stagger">
            {pending.map(a => (
              <div key={a.id} className="flex items-center justify-between p-3.5 bg-amber-50 rounded-xl border border-amber-100">
                <div>
                  <p className="font-semibold text-slate-800 text-sm">
                    {a.client?.user.firstName} {a.client?.user.lastName}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                    {format(new Date(a.startTime), 'dd MMM yyyy HH:mm', { locale: tr })}
                    <span className="text-slate-300">·</span>
                    {a.sessionType === 'ONLINE'
                      ? <><Video className="w-3 h-3" /> Online</>
                      : <><MapPin className="w-3 h-3" /> Yüz yüze</>
                    }
                  </p>
                </div>
                <Link
                  href="/psychologist/appointments"
                  className="text-xs bg-emerald-600 text-white px-3.5 py-1.5 rounded-lg hover:bg-emerald-700 transition-colors font-semibold flex items-center gap-1"
                >
                  <ChevronRight className="w-3 h-3" /> Onayla
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/psychologist/tests" className="card-hover">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-violet-50 flex items-center justify-center">
              <FlaskConical className="w-4.5 h-4.5 text-violet-500" />
            </div>
            <h3 className="font-semibold text-slate-800">Psikolojik Testler</h3>
          </div>
          <p className="text-sm text-slate-500">Danışanlara test ata ve sonuçları gör</p>
        </Link>
        <Link href="/psychologist/clients" className="card-hover">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-primary-50 flex items-center justify-center">
              <Users className="w-4.5 h-4.5 text-primary-500" />
            </div>
            <h3 className="font-semibold text-slate-800">Danışanlarım</h3>
          </div>
          <p className="text-sm text-slate-500">Danışan geçmişi ve ilerleme grafikleri</p>
        </Link>
      </div>
    </div>
  );
}

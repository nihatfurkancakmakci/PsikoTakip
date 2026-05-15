'use client';

import { useMemo, useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { api, API_ORIGIN } from '@/lib/api';
import { Psychologist } from '@/types';
import { toast } from 'sonner';
import AutoTextarea from '@/components/AutoTextarea';
import { ChevronLeft, ChevronRight, Check, Star, Award, Clock } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isBefore, startOfDay, getDay } from 'date-fns';
import { tr } from 'date-fns/locale';

const SESSION_DURATION_MIN = 50;

function generateSlots() {
  const slots: string[] = [];
  for (let h = 8; h < 20; h++) {
    slots.push(`${h.toString().padStart(2, '0')}:00`);
    slots.push(`${h.toString().padStart(2, '0')}:30`);
  }
  slots.push('20:00');
  return slots;
}

const ALL_SLOTS = generateSlots();
const DAY_KEYS: Record<number, string> = { 0: 'sunday', 1: 'monday', 2: 'tuesday', 3: 'wednesday', 4: 'thursday', 5: 'friday', 6: 'saturday' };

export default function NewAppointmentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialPsychId = searchParams.get('psychologistId') ?? '';
  
  const [selectedPsych, setSelectedPsych] = useState(initialPsychId);
  const [dateObj, setDateObj] = useState<Date | null>(null);
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(new Date()));
  const [startTime, setStartTime] = useState('');
  const [sessionType, setSessionType] = useState<'IN_PERSON' | 'ONLINE'>('IN_PERSON');
  const [notes, setNotes] = useState('');

  const dateStr = dateObj ? format(dateObj, 'yyyy-MM-dd') : '';

  const { data: psychologists } = useQuery<Psychologist[]>({
    queryKey: ['approved-psychologists'],
    queryFn: () => api.get('/users/psychologists?status=APPROVED').then(r => r.data),
  });

  const { data: slots } = useQuery({
    queryKey: ['slots', selectedPsych, dateStr],
    queryFn: () => api.get(`/appointments/slots?psychologistId=${selectedPsych}&date=${dateStr}`).then(r => r.data),
    enabled: !!selectedPsych && !!dateStr,
    refetchInterval: 15000,
  });

  const selectedPsychData = psychologists?.find(p => p.id === selectedPsych);

  // Check which days of the week the psychologist works for the selected session type
  const activeDaysOfWeek = useMemo(() => {
    if (!selectedPsychData) return [];
    const wh = (selectedPsychData as any).workingHours as any;
    if (!wh) return [];
    const active = [];
    for (let i = 0; i < 7; i++) {
      if (wh[DAY_KEYS[i]]?.[sessionType]) active.push(i);
    }
    return active;
  }, [selectedPsychData, sessionType]);

  const slotStates = useMemo(() => {
    if (!dateStr || !selectedPsychData) return {};
    const dayOfWeek = new Date(dateStr).getDay();
    const dayKey = DAY_KEYS[dayOfWeek];
    
    const wh = (selectedPsychData as any).workingHours;
    const daySchedule = wh?.[dayKey]?.[sessionType];
    
    const bookedSlots: { startTime: string; endTime: string }[] = slots?.bookedSlots ?? [];
    const states: Record<string, 'available' | 'booked' | 'outside'> = {};
    
    ALL_SLOTS.forEach(slot => {
      if (!daySchedule) {
        states[slot] = 'outside';
        return;
      }
      if (slot < daySchedule.start || slot >= daySchedule.end) {
        states[slot] = 'outside';
        return;
      }
      const slotDate = new Date(`${dateStr}T${slot}:00`);
      const slotEndDate = new Date(slotDate.getTime() + SESSION_DURATION_MIN * 60000);
      
      const isBooked = bookedSlots.some(b => {
        const bStart = new Date(b.startTime);
        const bEnd = new Date(b.endTime);
        return slotDate < bEnd && slotEndDate > bStart;
      });

      states[slot] = isBooked ? 'booked' : 'available';
    });
    return states;
  }, [dateStr, selectedPsychData, slots, sessionType]);

  const mutation = useMutation({
    mutationFn: (data: object) => api.post('/appointments', data),
    onSuccess: () => {
      toast.success('Randevu talebiniz alındı!');
      router.push('/client');
    },
    onError: (e: any) => toast.error(e.response?.data?.message ?? 'Hata oluştu'),
  });

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!selectedPsych || !dateStr || !startTime) return toast.error('Lütfen uzman, tarih ve saat seçin');
    const start = new Date(`${dateStr}T${startTime}:00`);
    const end = new Date(start.getTime() + SESSION_DURATION_MIN * 60000);
    mutation.mutate({ psychologistId: selectedPsych, startTime: start.toISOString(), endTime: end.toISOString(), sessionType, notes });
  };

  // Calendar logic
  const monthDays = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8 pb-20 animate-slide-up">
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Uzmanınızı Seçin</h1>
        <p className="text-gray-500 mt-2 text-base">Size en uygun psikoloğu ve zaman dilimini belirleyerek seansınızı planlayın.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Sol Kolon: Psikolog Listesi */}
        <div className="lg:col-span-5 space-y-4">
          <h2 className="font-semibold text-gray-800 text-lg flex items-center gap-2">
            <Award className="w-5 h-5 text-primary-500" />
            Uzman Psikologlar
          </h2>
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {psychologists?.map(p => {
              const isSelected = selectedPsych === p.id;
              const avatar = p.photoUrl ? (p.photoUrl.startsWith('http') ? p.photoUrl : `${API_ORIGIN}${p.photoUrl}`) : null;
              
              return (
                <div 
                  key={p.id}
                  onClick={() => { setSelectedPsych(p.id); setDateObj(null); setStartTime(''); }}
                  className={`relative p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                    isSelected 
                      ? 'border-primary-500 bg-primary-50/30 shadow-md shadow-primary-500/10' 
                      : 'border-transparent bg-white hover:border-gray-200 hover:shadow-sm'
                  }`}
                >
                  <div className="flex gap-4 items-start">
                    <div className="w-14 h-14 rounded-full bg-slate-100 flex-shrink-0 overflow-hidden border border-gray-200 shadow-sm">
                      {avatar ? <img src={avatar} alt="avatar" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xl font-bold text-slate-400">{p.user.firstName[0]}</div>}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h3 className="font-bold text-gray-900">{p.user.firstName} {p.user.lastName}</h3>
                        {isSelected && <Check className="w-5 h-5 text-primary-600" />}
                      </div>
                      <p className="text-xs text-primary-600 font-medium mt-0.5 line-clamp-1">
                        {(p.specializations && p.specializations.length > 0) ? p.specializations.join(', ') : 'Klinik Psikolog'}
                      </p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-amber-400" /> {p.experienceYears ? `${p.experienceYears} Yıl Deneyim` : 'Uzman'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sağ Kolon: Randevu Detayları */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 relative overflow-hidden">
            {!selectedPsych ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-20">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                  <Clock className="w-8 h-8 text-gray-300" />
                </div>
                <p className="text-gray-500 font-medium">Takvimi görmek için sol taraftan bir uzman seçin</p>
              </div>
            ) : (
              <div className="space-y-8 animate-fade-in">
                
                {/* Seans Türü Seçimi */}
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-3">Seans Türü</label>
                  <div className="flex gap-3 bg-gray-50/50 p-1 rounded-xl">
                    {(['IN_PERSON', 'ONLINE'] as const).map(t => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => { setSessionType(t); setDateObj(null); setStartTime(''); }}
                        className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-sm
                          ${sessionType === t ? 'bg-white text-primary-700 shadow border border-gray-200' : 'text-gray-500 hover:text-gray-700 border border-transparent'}`}
                      >
                        {t === 'ONLINE' ? '🎥 Online Görüşme' : '🏥 Yüz Yüze Görüşme'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Özel Takvim Bileşeni */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <label className="text-sm font-semibold text-gray-800">Tarih Seçin</label>
                    <div className="flex items-center gap-2">
                      <button onClick={prevMonth} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"><ChevronLeft className="w-5 h-5 text-gray-600" /></button>
                      <span className="text-sm font-bold w-32 text-center text-gray-700">{format(currentMonth, 'MMMM yyyy', { locale: tr })}</span>
                      <button onClick={nextMonth} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"><ChevronRight className="w-5 h-5 text-gray-600" /></button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-7 gap-1.5 mb-2">
                    {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map(d => (
                      <div key={d} className="text-center text-[10px] font-bold text-gray-400 uppercase">{d}</div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-1.5">
                    {/* Empty cells for starting day */}
                    {Array.from({ length: (getDay(startOfMonth(currentMonth)) + 6) % 7 }).map((_, i) => (
                      <div key={`empty-${i}`} className="h-10" />
                    ))}
                    
                    {monthDays.map(day => {
                      const isPast = isBefore(day, startOfDay(new Date()));
                      const dayOfWeek = getDay(day);
                      const isWorkingDay = activeDaysOfWeek.includes(dayOfWeek);
                      const disabled = isPast || !isWorkingDay;
                      const selected = dateObj && isSameDay(day, dateObj);
                      
                      return (
                        <button
                          key={day.toISOString()}
                          onClick={() => {
                            if (!disabled) {
                              setDateObj(day);
                              setStartTime('');
                            }
                          }}
                          disabled={disabled}
                          className={`
                            h-10 rounded-xl text-sm font-medium transition-all flex items-center justify-center relative
                            ${disabled ? 'text-gray-300 cursor-not-allowed bg-gray-50/50' : 'hover:bg-primary-50 hover:text-primary-600 cursor-pointer'}
                            ${selected ? 'bg-primary-600 text-white shadow-md shadow-primary-500/30 hover:bg-primary-700 hover:text-white' : 'text-gray-700'}
                          `}
                        >
                          {format(day, 'd')}
                          {disabled && !isPast && <span className="absolute inset-0 m-auto w-4/5 h-[1px] bg-gray-300 transform -rotate-45" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Saat Seçimi */}
                {dateObj && (
                  <div className="animate-fade-in">
                    <label className="block text-sm font-semibold text-gray-800 mb-3">Müsait Saatler</label>
                    {Object.values(slotStates).every(s => s === 'outside') ? (
                      <div className="p-4 bg-gray-50 rounded-xl text-center text-gray-500 text-sm">Seçilen tarihte uygun saat bulunamadı.</div>
                    ) : (
                      <div className="grid grid-cols-4 gap-2.5">
                        {ALL_SLOTS.map(slot => {
                          const state = slotStates[slot];
                          if (state === 'outside') return null;
                          const isBooked = state === 'booked';
                          const isSelected = startTime === slot;

                          return (
                            <button
                              key={slot}
                              type="button"
                              disabled={isBooked}
                              onClick={() => setStartTime(slot)}
                              className={`
                                py-2.5 rounded-xl text-sm font-medium transition-all relative overflow-hidden
                                ${isBooked ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : isSelected ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30 scale-105 z-10' : 'bg-white border border-gray-200 text-gray-700 hover:border-primary-400 hover:text-primary-600'}
                              `}
                            >
                              <span className={isBooked ? 'line-through opacity-60' : ''}>{slot}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* Not ve Gönder */}
                {startTime && (
                  <div className="pt-6 border-t border-gray-100 animate-slide-up space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-2">Ön Bilgi Notu (İsteğe bağlı)</label>
                      <AutoTextarea className="input-field bg-gray-50" minRows={2} placeholder="Uzmanınıza seans öncesi iletmek istediklerinizi yazabilirsiniz..." value={notes} onChange={e => setNotes(e.target.value)} />
                    </div>
                    <button 
                      onClick={handleSubmit} 
                      className="btn-primary w-full py-3.5 text-base shadow-xl shadow-primary-500/20" 
                      disabled={mutation.isPending}
                    >
                      {mutation.isPending ? 'Onaylanıyor...' : 'Randevuyu Onayla ve Bitir'}
                    </button>
                  </div>
                )}

              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

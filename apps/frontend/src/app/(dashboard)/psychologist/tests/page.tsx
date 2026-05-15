'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { PsychologicalTest } from '@/types';
import { toast } from 'sonner';
import { FileText, Search, UserCheck, Send, CheckCircle2, FlaskConical } from 'lucide-react';

interface PsychClient {
  id: string;
  userId: string;
  user: { firstName: string; lastName: string; email: string };
}

export default function PsychTestsPage() {
  const [selectedTest, setSelectedTest] = useState('');
  const [selectedClient, setSelectedClient] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: tests } = useQuery<PsychologicalTest[]>({
    queryKey: ['all-tests'],
    queryFn: () => api.get('/tests').then(r => r.data),
  });

  const { data: clients } = useQuery<PsychClient[]>({
    queryKey: ['psych-clients'],
    queryFn: () => api.get('/users/my-clients').then(r => r.data),
  });

  const assignMutation = useMutation({
    mutationFn: (data: { testId: string; clientUserId: string }) =>
      api.post('/tests/assign', data),
    onSuccess: () => {
      toast.success('Test başarıyla danışana atandı');
      setSelectedTest('');
      setSelectedClient('');
    },
    onError: (e: any) => toast.error(e.response?.data?.message ?? 'Hata oluştu'),
  });

  const handleAssign = () => {
    if (!selectedTest || !selectedClient) {
      toast.error('Lütfen danışan ve test seçimini tamamlayın');
      return;
    }
    assignMutation.mutate({ testId: selectedTest, clientUserId: selectedClient });
  };

  const filteredTests = tests?.filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()) || t.code.toLowerCase().includes(searchQuery.toLowerCase())) ?? [];

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8 animate-slide-up">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
          <FlaskConical className="w-8 h-8 text-violet-600" />
          Psikolojik Test Yönetimi
        </h1>
        <p className="text-slate-500 text-base mt-2">Danışanlarınızın gelişimini takip etmek için profesyonel değerlendirme envanterleri atayın.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Sol Taraf: Test Ata Formu */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 sticky top-6">
            <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Send className="w-5 h-5 text-violet-500" />
              Yeni Test Ata
            </h2>

            <div className="space-y-6">
              {/* Danışan Seçimi */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Danışan Seçin</label>
                <div className="relative">
                  <UserCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <select 
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:bg-white focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all appearance-none cursor-pointer"
                    value={selectedClient} 
                    onChange={e => setSelectedClient(e.target.value)}
                  >
                    <option value="">Danışan seçiniz...</option>
                    {clients?.map(c => (
                      <option key={c.id} value={c.userId}>{c.user.firstName} {c.user.lastName}</option>
                    ))}
                  </select>
                </div>
                {(!clients || clients.length === 0) && (
                  <p className="text-xs text-amber-600 mt-2 bg-amber-50 p-2 rounded-lg border border-amber-100">
                    Henüz kayıtlı danışanınız bulunmuyor. Test atayabilmek için öncelikle onaylanmış bir randevunuz olmalıdır.
                  </p>
                )}
              </div>

              {/* Test Seçimi */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Uygulanacak Test</label>
                <div className="relative">
                  <FileText className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <select 
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:bg-white focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all appearance-none cursor-pointer"
                    value={selectedTest} 
                    onChange={e => setSelectedTest(e.target.value)}
                  >
                    <option value="">Test seçiniz...</option>
                    {tests?.map(t => (
                      <option key={t.id} value={t.id}>{t.name} ({t.code})</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Seçim Özeti & Buton */}
              {selectedTest && selectedClient && (
                <div className="p-4 bg-violet-50 rounded-xl border border-violet-100 animate-fade-in">
                  <p className="text-sm font-medium text-violet-800">
                    <CheckCircle2 className="w-4 h-4 inline mr-1 text-violet-600" />
                    <strong>{clients?.find(c => c.userId === selectedClient)?.user.firstName}</strong> isimli danışana <strong>{tests?.find(t => t.id === selectedTest)?.code}</strong> envanteri atanacak.
                  </p>
                </div>
              )}

              <button
                onClick={handleAssign}
                disabled={assignMutation.isPending || !selectedTest || !selectedClient}
                className="w-full py-3.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-violet-500/30 disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed"
              >
                {assignMutation.isPending ? 'Atanıyor...' : 'Danışana Gönder'}
              </button>
            </div>
          </div>
        </div>

        {/* Sağ Taraf: Mevcut Testler Listesi */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 min-h-full">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <h2 className="text-lg font-bold text-slate-800">Mevcut Envanterler</h2>
              
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Test ara..." 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 focus:outline-none transition-all"
                />
              </div>
            </div>

            {!filteredTests || filteredTests.length === 0 ? (
              <div className="text-center py-20">
                <FlaskConical className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                <p className="text-slate-500 font-medium">Aramanıza uygun test bulunamadı.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredTests.map(t => {
                  const isSelected = selectedTest === t.id;
                  return (
                    <div 
                      key={t.id} 
                      onClick={() => setSelectedTest(t.id)}
                      className={`
                        p-5 rounded-2xl border-2 transition-all cursor-pointer relative overflow-hidden group
                        ${isSelected ? 'border-violet-500 bg-violet-50/50 shadow-md' : 'border-slate-100 bg-white hover:border-violet-200 hover:shadow-sm'}
                      `}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-md uppercase tracking-wider">
                          {t.code}
                        </span>
                        {isSelected && <CheckCircle2 className="w-5 h-5 text-violet-600" />}
                      </div>
                      <h3 className="font-bold text-slate-800 text-base mb-1.5 group-hover:text-violet-700 transition-colors">{t.name}</h3>
                      <p className="text-sm text-slate-500 leading-relaxed line-clamp-3">{t.description}</p>
                      
                      <div className="mt-4 pt-4 border-t border-slate-100/60 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center">
                          <FileText className="w-4 h-4 text-violet-600" />
                        </div>
                        <span className="text-xs font-semibold text-violet-700">Otomatik Raporlama</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        
      </div>
    </div>
  );
}

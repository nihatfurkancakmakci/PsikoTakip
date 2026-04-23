'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { PsychologicalTest } from '@/types';
import { toast } from 'sonner';

interface PsychClient {
  id: string;
  userId: string;
  user: { firstName: string; lastName: string; email: string };
}

export default function PsychTestsPage() {
  const [selectedTest, setSelectedTest] = useState('');
  const [selectedClient, setSelectedClient] = useState('');

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
      toast.success('Test başarıyla atandı');
      setSelectedTest('');
      setSelectedClient('');
    },
    onError: (e: any) => toast.error(e.response?.data?.message ?? 'Hata oluştu'),
  });

  const handleAssign = () => {
    if (!selectedTest || !selectedClient) {
      toast.error('Test ve danışan seçin');
      return;
    }
    assignMutation.mutate({ testId: selectedTest, clientUserId: selectedClient });
  };

  return (
    <div className="p-6 space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Psikolojik Testler</h1>
        <p className="text-gray-500 text-sm mt-1">Danışanlara test atayın ve mevcut testleri görün</p>
      </div>

      <div className="card space-y-4">
        <h2 className="text-base font-semibold text-gray-700">Test Ata</h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Danışan</label>
          <select className="input-field" value={selectedClient} onChange={e => setSelectedClient(e.target.value)}>
            <option value="">Danışan seçin...</option>
            {clients?.map(c => (
              <option key={c.id} value={c.userId}>{c.user.firstName} {c.user.lastName}</option>
            ))}
          </select>
          {(!clients || clients.length === 0) && (
            <p className="text-xs text-gray-400 mt-1">Henüz danışanınız yok. Önce randevu oluşturulmalı.</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Test</label>
          <select className="input-field" value={selectedTest} onChange={e => setSelectedTest(e.target.value)}>
            <option value="">Test seçin...</option>
            {tests?.map(t => (
              <option key={t.id} value={t.id}>{t.name} ({t.code})</option>
            ))}
          </select>
        </div>

        <button
          onClick={handleAssign}
          disabled={assignMutation.isPending || !selectedTest || !selectedClient}
          className="btn-primary w-full py-2.5"
        >
          {assignMutation.isPending ? 'Atanıyor...' : 'Testi Ata'}
        </button>
      </div>

      <div className="card space-y-3">
        <h2 className="text-base font-semibold text-gray-700">Mevcut Testler</h2>
        {!tests || tests.length === 0 ? (
          <p className="text-sm text-gray-400">Test bulunamadı.</p>
        ) : (
          tests.map(t => (
            <div key={t.id} className="p-3 border border-gray-100 rounded-lg">
              <p className="font-medium text-gray-800 text-sm">{t.name}</p>
              <p className="text-xs text-gray-400 mt-0.5">{t.code} — {t.description}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

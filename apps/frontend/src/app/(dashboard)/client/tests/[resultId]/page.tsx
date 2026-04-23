'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useRouter, useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface Question {
  id: string;
  text: string;
  orderIndex: number;
  options: { value: number; label: string }[];
}

interface TestDetail {
  id: string;
  test: { name: string; code: string; description?: string };
  questions: Question[];
  completedAt?: string;
}

export default function TakeTestPage() {
  const { resultId } = useParams<{ resultId: string }>();
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, number>>({});

  const { data, isLoading } = useQuery<TestDetail>({
    queryKey: ['test-detail', resultId],
    queryFn: () => api.get(`/tests/results/${resultId}`).then(r => r.data),
  });

  const mutation = useMutation({
    mutationFn: (payload: { answers: { questionId: string; value: number }[] }) =>
      api.post(`/tests/results/${resultId}/submit`, payload),
    onSuccess: () => {
      toast.success('Test tamamlandı!');
      router.push('/client/tests');
    },
    onError: (e: any) => toast.error(e.response?.data?.message ?? 'Hata oluştu'),
  });

  if (isLoading) return <div className="p-6 text-gray-500">Yükleniyor...</div>;
  if (!data) return <div className="p-6 text-red-500">Test bulunamadı.</div>;

  if (data.completedAt) {
    return (
      <div className="p-6 max-w-lg mx-auto">
        <div className="card text-center space-y-2">
          <p className="text-2xl">✅</p>
          <p className="font-semibold text-gray-700">Bu test zaten tamamlandı.</p>
          <button onClick={() => router.push('/client/tests')} className="btn-primary mt-2">Testlerime Dön</button>
        </div>
      </div>
    );
  }

  const questions = [...(data.questions ?? [])].sort((a, b) => a.orderIndex - b.orderIndex);
  const answered = Object.keys(answers).length;
  const total = questions.length;
  const progress = total > 0 ? Math.round((answered / total) * 100) : 0;

  const handleSubmit = () => {
    if (answered < total) {
      toast.error(`Lütfen tüm soruları cevaplayın (${answered}/${total})`);
      return;
    }
    const payload = Object.entries(answers).map(([questionId, value]) => ({ questionId, value }));
    mutation.mutate({ answers: payload });
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">{data.test.name}</h1>
        {data.test.description && <p className="text-gray-500 text-sm mt-1">{data.test.description}</p>}
      </div>

      <div className="card !p-4">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>İlerleme</span>
          <span>{answered}/{total}</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2">
          <div className="bg-primary-600 h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="space-y-4">
        {questions.map((q, idx) => (
          <div key={q.id} className={`card !p-4 ${answers[q.id] !== undefined ? 'border-primary-200' : ''}`}>
            <p className="text-sm font-medium text-gray-800 mb-3">
              <span className="text-primary-600 font-bold mr-2">{idx + 1}.</span>{q.text}
            </p>
            <div className="space-y-2">
              {q.options.map(opt => (
                <label
                  key={opt.value}
                  className={`flex items-center gap-3 p-2.5 rounded-lg cursor-pointer border transition-colors
                    ${answers[q.id] === opt.value
                      ? 'bg-primary-50 border-primary-400 text-primary-700'
                      : 'border-gray-200 hover:bg-gray-50'}`}
                >
                  <input
                    type="radio"
                    name={q.id}
                    value={opt.value}
                    checked={answers[q.id] === opt.value}
                    onChange={() => setAnswers(prev => ({ ...prev, [q.id]: opt.value }))}
                    className="accent-primary-600"
                  />
                  <span className="text-sm">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={handleSubmit}
        disabled={mutation.isPending}
        className="btn-primary w-full py-3 text-base"
      >
        {mutation.isPending ? 'Gönderiliyor...' : 'Testi Tamamla'}
      </button>
    </div>
  );
}

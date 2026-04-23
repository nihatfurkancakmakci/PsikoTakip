'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import ProgressChart from '@/components/charts/ProgressChart';
import { TestResult } from '@/types';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

interface ProgressResult {
  id: string;
  testName: string;
  testCode: string;
  totalScore: number;
  scoreCategory: string;
  completedAt: string | null;
  isSharedWithClient: boolean;
}

const categoryBadge: Record<string, string> = {
  NORMAL: 'badge-normal',
  HAFIF: 'badge-hafif',
  ORTA: 'badge-orta',
  AGIR: 'badge-agir',
};

export default function ClientProgressPage() {
  const { user } = useAuth();

  const { data: results, isLoading } = useQuery<ProgressResult[]>({
    queryKey: ['my-progress'],
    queryFn: () => api.get(`/tests/progress/${user?.id}`).then((r) => r.data),
    enabled: !!user,
  });

  const sharedResults = results?.filter((r) => r.isSharedWithClient) ?? [];

  const chartData: TestResult[] = sharedResults.map((r) => ({
    id: r.id,
    testId: '',
    totalScore: r.totalScore,
    scoreCategory: r.scoreCategory,
    completedAt: r.completedAt ?? undefined,
    isSharedWithClient: r.isSharedWithClient,
    test: { id: '', name: r.testName, code: r.testCode },
  }));

  if (isLoading) return <div className="p-8 text-center text-gray-500">Yükleniyor...</div>;

  return (
    <div className="p-6 space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">İlerleme Grafiğim</h1>
        <p className="text-sm text-gray-500 mt-1">
          Psikologunuzun sizinle paylaştığı test sonuçlarınızın zaman içindeki değişimi
        </p>
      </div>

      <div className="card">
        <h2 className="font-semibold text-gray-700 mb-4">Test Skoru Zaman Serisi</h2>
        {chartData.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-4xl mb-3">📊</p>
            <p className="text-gray-400 text-sm">
              Henüz paylaşılmış test sonucu yok.
            </p>
            <p className="text-gray-300 text-xs mt-1">
              Psikologunuz test sonuçlarını sizinle paylaştığında burada görünecek.
            </p>
          </div>
        ) : (
          <ProgressChart results={chartData} />
        )}
      </div>

      {sharedResults.length > 0 && (
        <div className="card space-y-3">
          <h2 className="font-semibold text-gray-700">Test Geçmişi</h2>
          {sharedResults.map((r) => (
            <div key={r.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-800 text-sm">{r.testName}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {r.completedAt ? format(new Date(r.completedAt), 'dd MMMM yyyy', { locale: tr }) : '—'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-primary-600">{r.totalScore}</p>
                <span className={`${categoryBadge[r.scoreCategory] ?? 'badge-normal'} block text-center mt-1`}>
                  {r.scoreCategory}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

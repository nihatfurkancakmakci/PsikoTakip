'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import ProgressChart from '@/components/charts/ProgressChart';
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

export default function ClientProgressPage({ params }: { params: { clientId: string } }) {
  const { data: results, isLoading } = useQuery<ProgressResult[]>({
    queryKey: ['progress', params.clientId],
    queryFn: () => api.get(`/tests/progress/${params.clientId}`).then((r) => r.data),
  });

  if (isLoading) return <div className="p-8 text-center">Yükleniyor...</div>;

  // ProgressChart TestResult[] bekliyor, dönüştür
  const chartData = (results ?? []).map(r => ({
    id: r.id,
    testId: '',
    totalScore: r.totalScore,
    scoreCategory: r.scoreCategory,
    completedAt: r.completedAt ?? undefined,
    isSharedWithClient: r.isSharedWithClient,
    test: { id: '', name: r.testName, code: r.testCode },
  }));

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Danışan İlerleme Grafiği</h1>

      <div className="card">
        <h2 className="font-semibold text-gray-700 mb-4">Test Skoru Zaman Serisi</h2>
        <ProgressChart results={chartData} />
      </div>

      <div className="card">
        <h2 className="font-semibold text-gray-700 mb-4">Test Geçmişi</h2>
        {!results?.length ? (
          <p className="text-gray-500 text-sm">Tamamlanmış test yok.</p>
        ) : (
          <div className="space-y-2">
            {results.map((r) => (
              <div key={r.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-800">{r.testName}</p>
                  <p className="text-sm text-gray-500">
                    {r.completedAt ? format(new Date(r.completedAt), 'dd MMMM yyyy', { locale: tr }) : ''}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-primary-600">{r.totalScore}</p>
                  <span className={`${categoryBadge[r.scoreCategory] ?? 'badge-normal'} block text-center mt-1`}>
                    {r.scoreCategory}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

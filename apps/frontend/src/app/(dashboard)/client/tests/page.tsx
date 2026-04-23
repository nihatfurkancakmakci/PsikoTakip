'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { api } from '@/lib/api';
import { TestResult } from '@/types';

const categoryBadge: Record<string, string> = {
  NORMAL: 'badge-normal',
  HAFİF: 'badge-hafif',
  ORTA: 'badge-orta',
  AĞIR: 'badge-agir',
};

export default function ClientTestsPage() {
  const { data: results, isLoading } = useQuery<TestResult[]>({
    queryKey: ['my-test-results'],
    queryFn: () => api.get('/tests/results/me').then(r => r.data),
  });

  const { data: assigned } = useQuery<{ resultId: string; test: { name: string; code: string; description?: string } }[]>({
    queryKey: ['assigned-tests'],
    queryFn: () => api.get('/tests/assigned').then(r => r.data),
  });

  if (isLoading) return <div className="p-6 text-gray-500">Yükleniyor...</div>;

  return (
    <div className="p-6 space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Testlerim</h1>
        <p className="text-gray-500 text-sm mt-1">Size atanan psikolojik testler ve geçmiş sonuçlarınız</p>
      </div>

      {assigned && assigned.length > 0 && (
        <div className="card space-y-3">
          <h2 className="text-base font-semibold text-gray-700">Bekleyen Testler</h2>
          {assigned.map(item => (
            <div key={item.resultId} className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div>
                <p className="font-medium text-gray-800 text-sm">{item.test.name}</p>
                {item.test.description && <p className="text-xs text-gray-500 mt-0.5">{item.test.description}</p>}
              </div>
              <Link href={`/client/tests/${item.resultId}`} className="btn-primary text-sm py-1.5 px-4 whitespace-nowrap">
                Testi Başlat
              </Link>
            </div>
          ))}
        </div>
      )}

      <div className="card space-y-3">
        <h2 className="text-base font-semibold text-gray-700">Tamamlanan Testler</h2>
        {!results || results.length === 0 ? (
          <p className="text-sm text-gray-400 py-4 text-center">Henüz tamamlanan test yok.</p>
        ) : (
          results.map(r => (
            <div key={r.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
              <div>
                <p className="font-medium text-gray-800 text-sm">{r.test.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {r.completedAt ? new Date(r.completedAt).toLocaleDateString('tr-TR') : '—'}
                </p>
              </div>
              {r.isSharedWithClient ? (
                <div className="text-right">
                  <span className={`${categoryBadge[r.scoreCategory] ?? 'badge-normal'} block mb-1`}>{r.scoreCategory}</span>
                  <span className="text-xs text-gray-400">Puan: {r.totalScore}</span>
                </div>
              ) : (
                <span className="text-xs text-gray-400 italic">Sonuç paylaşılmadı</span>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

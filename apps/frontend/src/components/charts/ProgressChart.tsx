'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { TestResult } from '@/types';

interface Props {
  results: TestResult[];
}

const COLORS = ['#0ea5e9', '#22c55e', '#a855f7', '#f59e0b'];

export default function ProgressChart({ results }: Props) {
  if (!results.length) {
    return <p className="text-gray-500 text-sm text-center py-8">Henüz test sonucu yok.</p>;
  }

  const testCodes = [...new Set(results.map((r) => r.test.code))];

  const grouped = results.reduce<Record<string, Record<string, number | string>>>((acc, r) => {
    if (!r.completedAt) return acc;
    const date = format(new Date(r.completedAt), 'dd MMM', { locale: tr });
    if (!acc[date]) acc[date] = { date };
    acc[date][r.test.code] = r.totalScore;
    return acc;
  }, {});

  const data = Object.values(grouped);

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Legend />
          {testCodes.map((code, i) => (
            <Line
              key={code}
              type="monotone"
              dataKey={code}
              stroke={COLORS[i % COLORS.length]}
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

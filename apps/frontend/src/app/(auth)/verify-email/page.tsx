'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Geçersiz doğrulama bağlantısı.');
      return;
    }

    api.get(`/auth/verify-email?token=${token}`)
      .then((res) => {
        setStatus('success');
        setMessage(res.data.message ?? 'E-postanız başarıyla doğrulandı.');
      })
      .catch((err) => {
        setStatus('error');
        setMessage(err.response?.data?.message ?? 'Doğrulama başarısız. Bağlantı geçersiz veya süresi dolmuş.');
      });
  }, [token]);

  return (
    <div className="text-center space-y-4">
      {status === 'loading' && (
        <>
          <div className="text-4xl animate-pulse">⏳</div>
          <p className="text-gray-600">E-postanız doğrulanıyor...</p>
        </>
      )}

      {status === 'success' && (
        <>
          <div className="text-4xl">✅</div>
          <p className="text-green-700 font-semibold">{message}</p>
          <p className="text-sm text-gray-500">Artık hesabınıza giriş yapabilirsiniz.</p>
          <Link href="/login" className="btn-primary inline-block px-6">
            Giriş Yap
          </Link>
        </>
      )}

      {status === 'error' && (
        <>
          <div className="text-4xl">❌</div>
          <p className="text-red-600 font-semibold">{message}</p>
          <p className="text-sm text-gray-500">Yeni doğrulama e-postası almak için giriş yapmayı deneyin.</p>
          <Link href="/login" className="btn-primary inline-block px-6">
            Giriş Sayfasına Dön
          </Link>
        </>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-calm-50 flex items-center justify-center px-4">
      <div className="card max-w-md w-full space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-primary-800">PsikoTakip</h1>
          <p className="text-gray-500 mt-1">E-posta Doğrulama</p>
        </div>

        <Suspense fallback={<p className="text-center text-gray-400">Yükleniyor...</p>}>
          <VerifyEmailContent />
        </Suspense>
      </div>
    </div>
  );
}

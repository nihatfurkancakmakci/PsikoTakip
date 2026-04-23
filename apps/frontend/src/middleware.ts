import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_PATHS = ['/', '/login', '/register'];
const ROLE_PATHS: Record<string, string> = {
  CLIENT: '/client',
  PSYCHOLOGIST: '/psychologist',
  ADMIN: '/admin',
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPublic = PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith('/api'));

  if (isPublic) return NextResponse.next();

  // Token kontrolü (client-side localStorage ile yapılıyor; middleware sadece yapı)
  // Production'da HttpOnly cookie kullanılmalı
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next|favicon.ico|api).*)'],
};

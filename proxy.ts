import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function verifyToken(token: string | undefined): boolean {
  if (!token || !token.includes('.')) return false;

  const [payloadBase64] = token.split('.');
  try {
    const payloadJson = Buffer.from(payloadBase64, 'base64url').toString('utf-8');
    const { exp } = JSON.parse(payloadJson);
    if (!exp || Date.now() > exp) return false;
    return true;
  } catch {
    return false;
  }
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('admin_session')?.value;
  const isValidSession = verifyToken(token);

  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    if (!isValidSession) {
      const loginUrl = new URL('/admin/login', request.url);
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete('admin_session');
      return response;
    }
  }

  if (pathname === '/admin/login' && isValidSession) {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
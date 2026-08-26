import { NextResponse } from 'next/server';
import crypto from 'crypto';

const rateLimitMap = new Map<string, { count: number; lastAttempt: number }>();
const MAX_ATTEMPTS = 5;
const BLOCK_TIME_MS = 15 * 60 * 1000;

function safeCompare(a: string, b: string): boolean {
  try {
    const bufA = Buffer.from(a);
    const bufB = Buffer.from(b);
    if (bufA.length !== bufB.length) return false;
    return crypto.timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}

export async function POST(req: Request) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';
    const now = Date.now();
    const rateData = rateLimitMap.get(ip) || { count: 0, lastAttempt: now };

    if (rateData.count >= MAX_ATTEMPTS) {
      if (now - rateData.lastAttempt < BLOCK_TIME_MS) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      rateData.count = 0;
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body.email !== 'string' || typeof body.password !== 'string') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { email, password } = body;
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    const secret = process.env.SESSION_SECRET || process.env.NEXTAUTH_SECRET;

    if (!adminEmail || !adminPassword || !secret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isEmailValid = safeCompare(email.trim().toLowerCase(), adminEmail.toLowerCase());
    const isPassValid = safeCompare(password.trim(), adminPassword.trim());

    if (!isEmailValid || !isPassValid) {
      rateData.count += 1;
      rateData.lastAttempt = now;
      rateLimitMap.set(ip, rateData);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    rateLimitMap.delete(ip);

    const secretKey: string = secret;
    const expiresAt = now + 7 * 24 * 60 * 60 * 1000;
    const sessionPayload = JSON.stringify({ email: adminEmail, exp: expiresAt });
    const payloadBase64 = Buffer.from(sessionPayload).toString('base64url');

    const signature = crypto
      .createHmac('sha256', secretKey)
      .update(payloadBase64)
      .digest('base64url');

    const secureToken = `${payloadBase64}.${signature}`;
    const res = NextResponse.json({ success: true });

    res.cookies.set('admin_session', secureToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    return res;
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
import { NextResponse } from 'next/server';
import crypto from 'crypto';

const rateLimitMap = new Map<string, { count: number; lastAttempt: number }>();
const MAX_ATTEMPTS = 10;
const BLOCK_TIME_MS = 5 * 60 * 1000; // 5 دقائق حظر عند التكرار

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
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown-ip';
    const now = Date.now();
    const rateData = rateLimitMap.get(ip) || { count: 0, lastAttempt: now };

    if (rateData.count >= MAX_ATTEMPTS) {
      if (now - rateData.lastAttempt < BLOCK_TIME_MS) {
        return NextResponse.json(
          { error: 'Too many attempts. Please try again after 5 minutes.' },
          { status: 429 }
        );
      }
      rateData.count = 0;
    }

    const { email, password } = await req.json();

    if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
      return NextResponse.json({ error: 'Invalid credentials provided' }, { status: 400 });
    }

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    // Fallback في حال لم يتوفر المتغير في .env
    const secret = process.env.SESSION_SECRET || process.env.NEXTAUTH_SECRET;

    if (!adminEmail || !adminPassword) {
      return NextResponse.json(
        { error: 'Server authentication is not configured in .env' },
        { status: 500 }
      );
    }

    const isEmailValid = safeCompare(email.trim().toLowerCase(), adminEmail.toLowerCase());
    const isPassValid = safeCompare(password.trim(), adminPassword.trim());

    if (!isEmailValid || !isPassValid) {
      rateData.count += 1;
      rateData.lastAttempt = now;
      rateLimitMap.set(ip, rateData);

      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    rateLimitMap.delete(ip);

    const expiresAt = now + 7 * 24 * 60 * 60 * 1000;
    const sessionData = JSON.stringify({ email: adminEmail, exp: expiresAt });
    const payloadBase64 = Buffer.from(sessionData).toString('base64url');

    const signature = crypto
      .createHmac('sha256', secret)
      .update(payloadBase64)
      .digest('base64url');

    const secureToken = `${payloadBase64}.${signature}`;

    const res = NextResponse.json({ success: true });

    // ضبط الكوكي للجلسة
    res.cookies.set('admin_session', secureToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    return res;
  } catch {
    return NextResponse.json({ error: 'Internal authentication error' }, { status: 500 });
  }
}
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
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown-ip';
    const now = Date.now();
    const rateData = rateLimitMap.get(ip) || { count: 0, lastAttempt: now };

    if (rateData.count >= MAX_ATTEMPTS) {
      if (now - rateData.lastAttempt < BLOCK_TIME_MS) {
        return NextResponse.json(
          { error: 'Too many attempts. Please try again later.' },
          { status: 429 }
        );
      }
      rateData.count = 0;
    }

    const { email, password } = await req.json();

    if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 400 });
    }

    // قراءة المفاتيح بأمان بدون إظهار أي تفاصيل للفرونت إند
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    const secret = process.env.SESSION_SECRET || process.env.NEXTAUTH_SECRET;

    // في حال عدم وجود متغيرات البيئة، نطبع تحذيراً في كونسول السيرفر فقط ونعيد خطأ عاماً للواجهة
    if (!adminEmail || !adminPassword || !secret) {
      console.error('[AUTH CONFIG ERROR]: Missing ADMIN_EMAIL, ADMIN_PASSWORD, or SESSION_SECRET in .env');
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const isEmailValid = safeCompare(email.trim().toLowerCase(), adminEmail.toLowerCase());
    const isPassValid = safeCompare(password, adminPassword);

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

    res.cookies.set('admin_session', secureToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
      priority: 'high',
    });

    return res;
  } catch {
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
  }
}
import { NextResponse } from "next/server";
import crypto from "crypto";

const MAX_ATTEMPTS = 5;
const BLOCK_TIME_MS = 15 * 60 * 1000;

// NOTE: This in-memory limiter is okay for local/single-server use.
// For production/serverless, use Redis or your database instead.
const rateLimitMap = new Map<
  string,
  { count: number; blockedUntil: number }
>();

function safeCompare(a: string, b: string): boolean {
  const aBuffer = Buffer.from(a);
  const bBuffer = Buffer.from(b);

  if (aBuffer.length !== bBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(aBuffer, bBuffer);
}

function getClientIp(req: Request): string {
  // Prefer a trusted proxy header only when your deployment platform
  // actually sets it correctly.
  const forwardedFor = req.headers.get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }

  return req.headers.get("x-real-ip") || "unknown";
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry) {
    return false;
  }

  if (entry.blockedUntil > now) {
    return true;
  }

  // Block expired — reset it.
  if (entry.blockedUntil !== 0 && entry.blockedUntil <= now) {
    rateLimitMap.delete(ip);
  }

  return false;
}

function registerFailedAttempt(ip: string): void {
  const now = Date.now();
  const entry = rateLimitMap.get(ip) || {
    count: 0,
    blockedUntil: 0,
  };

  entry.count += 1;

  if (entry.count >= MAX_ATTEMPTS) {
    entry.blockedUntil = now + BLOCK_TIME_MS;
  }

  rateLimitMap.set(ip, entry);
}

function clearRateLimit(ip: string): void {
  rateLimitMap.delete(ip);
}

export async function POST(req: Request) {
  const ip = getClientIp(req);

  try {
    // -----------------------------
    // Rate limiting
    // -----------------------------
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // -----------------------------
    // Parse request body
    // -----------------------------
    const body = await req.json().catch(() => null);

    if (
      !body ||
      typeof body.email !== "string" ||
      typeof body.password !== "string"
    ) {
      registerFailedAttempt(ip);

      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const email = body.email.toLowerCase().trim();

    // IMPORTANT:
    // Never trim the password.
    // Spaces can legitimately be part of a password.
    const password = body.password;

    // -----------------------------
    // Environment variables
    // -----------------------------
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    const sessionSecret =
      process.env.SESSION_SECRET ||
      process.env.NEXTAUTH_SECRET;

    if (!adminEmail || !adminPassword || !sessionSecret) {
      console.error("Missing authentication environment variables");

      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // -----------------------------
    // Credentials
    // -----------------------------
    const isEmailValid = safeCompare(
      email,
      adminEmail.toLowerCase().trim()
    );

    const isPasswordValid = safeCompare(
      password,
      adminPassword
    );

    if (!isEmailValid || !isPasswordValid) {
      registerFailedAttempt(ip);

      // Don't tell attacker whether email or password was wrong.
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // -----------------------------
    // Successful login
    // -----------------------------
    clearRateLimit(ip);

    const now = Date.now();
    const expiresAt = now + 7 * 24 * 60 * 60 * 1000;

    const payload = JSON.stringify({
      email: adminEmail,
      exp: expiresAt,
      iat: now,
    });

    const payloadBase64 = Buffer
      .from(payload)
      .toString("base64url");

    const signature = crypto
      .createHmac("sha256", sessionSecret)
      .update(payloadBase64)
      .digest("base64url");

    const sessionToken = `${payloadBase64}.${signature}`;

    const response = NextResponse.json({
      success: true,
    });

    response.cookies.set("admin_session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (error) {
    console.error("Admin login error:", error);

    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }
}
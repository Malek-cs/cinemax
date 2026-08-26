import { NextResponse } from "next/server";
import crypto from "crypto";

const MAX_ATTEMPTS = 5;
const BLOCK_TIME_MS = 15 * 60 * 1000;

// Hard caps to avoid wasting CPU on absurd payloads before we even
// get to comparing credentials.
const MAX_EMAIL_LENGTH = 254; // RFC 5321 limit
const MAX_PASSWORD_LENGTH = 512;

// NOTE: This in-memory limiter is okay for local/single-server use.
// For production/serverless with multiple instances, use Redis or
// your database instead — this Map is per-instance and resets on
// every deploy/restart.
const rateLimitMap = new Map<
  string,
  { count: number; blockedUntil: number }
>();

/**
 * Constant-time string comparison that also avoids leaking length
 * via early-return timing. We hash both inputs to a fixed length
 * first, so the timingSafeEqual call always compares equal-length
 * buffers regardless of the original input lengths.
 */
function safeCompare(a: string, b: string): boolean {
  const aHash = crypto.createHash("sha256").update(a).digest();
  const bHash = crypto.createHash("sha256").update(b).digest();
  return crypto.timingSafeEqual(aHash, bHash);
}

/**
 * Verifies a password against either:
 *  - ADMIN_PASSWORD_HASH (format: "salt:hash", scrypt-based), preferred, or
 *  - ADMIN_PASSWORD (plaintext), legacy fallback.
 *
 * Using scrypt (built into Node's crypto, no extra dependency) means
 * the real password never has to sit in plaintext in your env vars.
 */
function verifyPassword(
  submitted: string,
  adminPassword: string | undefined,
  adminPasswordHash: string | undefined
): boolean {
  if (adminPasswordHash) {
    const [salt, storedHashHex] = adminPasswordHash.split(":");
    if (!salt || !storedHashHex) return false;

    const storedHash = Buffer.from(storedHashHex, "hex");
    const derivedHash = crypto.scryptSync(submitted, salt, storedHash.length);

    if (derivedHash.length !== storedHash.length) return false;
    return crypto.timingSafeEqual(derivedHash, storedHash);
  }

  if (adminPassword) {
    return safeCompare(submitted, adminPassword);
  }

  return false;
}

/**
 * Resolves the client IP. By default this does NOT trust
 * X-Forwarded-For, because that header is trivially spoofable by
 * anyone unless your platform/proxy strips and re-sets it before
 * your app sees it (Vercel, most CDNs behind a properly configured
 * reverse proxy, etc. do this correctly).
 *
 * Set TRUST_PROXY_HEADERS=true only if you've verified your
 * deployment platform sanitizes these headers upstream.
 */
function getClientIp(req: Request): string {
  const trustProxyHeaders = process.env.TRUST_PROXY_HEADERS === "true";

  if (trustProxyHeaders) {
    const forwardedFor = req.headers.get("x-forwarded-for");
    if (forwardedFor) {
      return forwardedFor.split(",")[0].trim();
    }
    const realIp = req.headers.get("x-real-ip");
    if (realIp) return realIp;
  }

  // Fall back to a platform-provided, non-spoofable value if you have
  // one (e.g. req.headers.get("x-vercel-forwarded-for") on Vercel, or
  // a value your own reverse proxy sets under a name clients can't
  // set themselves). Falling back to "unknown" means all untrusted
  // clients share one rate-limit bucket — safer than trusting a
  // spoofable header, but coarser.
  return "unknown";
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

    // Reject absurdly long input before doing any hashing/comparison
    // work on it.
    if (
      body.email.length > MAX_EMAIL_LENGTH ||
      body.password.length > MAX_PASSWORD_LENGTH
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
    const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;
    const sessionSecret =
      process.env.SESSION_SECRET ||
      process.env.NEXTAUTH_SECRET;

    if (
      !adminEmail ||
      (!adminPassword && !adminPasswordHash) ||
      !sessionSecret
    ) {
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

    const isPasswordValid = verifyPassword(
      password,
      adminPassword,
      adminPasswordHash
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
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

// Design note: this uses IBM Plex Mono for labels/wordmark/status text and
// Inter for the actual input text. In a real Next.js app, load them via
// next/font/google in your root layout and expose them as CSS variables:
//
//   import { IBM_Plex_Mono, Inter } from 'next/font/google';
//   const plexMono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400','500'], variable: '--font-mono' });
//   const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
//   <html className={`${plexMono.variable} ${inter.variable}`}>
//
// Then reference them via Tailwind's fontFamily config, or just swap the
// `font-mono` / `font-sans` classes below for your configured names.

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (loading) return;

    setErrorMsg('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'same-origin',
        body: JSON.stringify({
          email,
          password,
        }),
      });

      let data: { success?: boolean; error?: string } = {};

      try {
        data = await res.json();
      } catch {
        data = {};
      }

      if (!res.ok || !data.success) {
        setErrorMsg('Access denied — check your credentials.');
        return;
      }

      router.replace('/admin');
      router.refresh();
    } catch {
      setErrorMsg('Connection failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0A0C10] flex items-center justify-center p-4 font-sans">
      <div className="relative w-full max-w-md">
        {/* Corner registration marks — the panel reads as an instrument, not a marketing card */}
        <CornerMark className="-top-2 -left-2" />
        <CornerMark className="-top-2 -right-2 rotate-90" />
        <CornerMark className="-bottom-2 -left-2 -rotate-90" />
        <CornerMark className="-bottom-2 -right-2 rotate-180" />

        <div className="bg-[#12151B] border border-[#262B33] rounded-md p-8 shadow-[0_0_0_1px_rgba(0,0,0,0.2),0_20px_60px_-15px_rgba(0,0,0,0.6)]">
          {/* Status line */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-[#E8A33D] opacity-75 motion-safe:animate-ping" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#E8A33D]" />
            </span>
            <span className="font-mono text-[10px] tracking-[0.2em] text-[#6E7683] uppercase">
              System secure
            </span>
          </div>

          <div className="text-center mb-8">
            <h1 className="font-mono text-xl font-medium text-[#ECEEF2] tracking-tight">
              ADMIN<span className="text-[#E8A33D]">_</span>ACCESS
            </h1>
          </div>

          {errorMsg && (
            <div
              role="alert"
              className="mb-6 px-3.5 py-3 bg-[#E2555C]/10 border border-[#E2555C]/30 text-[#F3999D] text-xs font-mono rounded text-center"
            >
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label
                htmlFor="admin-email"
                className="block font-mono text-[10px] font-medium text-[#6E7683] uppercase tracking-[0.15em] mb-2"
              >
                Admin email
              </label>

              <input
                id="admin-email"
                name="email"
                type="email"
                autoComplete="username"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="w-full bg-transparent border-0 border-b border-[#262B33] px-0 py-2.5 text-sm text-[#ECEEF2] placeholder-[#454C56] focus:outline-none focus:border-[#E8A33D] transition-colors disabled:opacity-50"
                placeholder="you@company.com"
              />
            </div>

            <div>
              <label
                htmlFor="admin-password"
                className="block font-mono text-[10px] font-medium text-[#6E7683] uppercase tracking-[0.15em] mb-2"
              >
                Password
              </label>

              <input
                id="admin-password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="w-full bg-transparent border-0 border-b border-[#262B33] px-0 py-2.5 text-sm text-[#ECEEF2] placeholder-[#454C56] focus:outline-none focus:border-[#E8A33D] transition-colors disabled:opacity-50"
                placeholder="••••••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group w-full py-3 mt-2 bg-[#E8A33D] hover:bg-[#F0AE4C] text-[#0A0C10] rounded text-sm font-mono font-medium tracking-wide transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                'AUTHENTICATING…'
              ) : (
                <>
                  AUTHENTICATE
                  <span className="transition-transform group-hover:translate-x-0.5">
                    →
                  </span>
                </>
              )}
            </button>
          </form>

          {/* Grounded in the real backend: signed sessions + rate limiting */}
          <div className="mt-7 pt-5 border-t border-[#262B33] flex items-center justify-center gap-3 font-mono text-[9px] tracking-[0.1em] text-[#454C56] uppercase">
            <span>HMAC signed</span>
            <span className="text-[#262B33]">·</span>
            <span>Rate limited</span>
            <span className="text-[#262B33]">·</span>
            <span>7d session</span>
          </div>
        </div>
      </div>
    </main>
  );
}

function CornerMark({ className = '' }: { className?: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      className={`absolute text-[#3A4048] pointer-events-none ${className}`}
      aria-hidden="true"
    >
      <path
        d="M1 8V1H8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="square"
      />
    </svg>
  );
}

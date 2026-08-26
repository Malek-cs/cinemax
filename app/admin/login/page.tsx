'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

// Fonts: pair a display serif for the ticket wordmark/headline with a plain
// sans for the actual input text, plus a monospace for the printed "ticket"
// details. Load these in your root layout via next/font/google:
//
//   import { Playfair_Display, Inter, IBM_Plex_Mono } from 'next/font/google';
//   const serif = Playfair_Display({ subsets: ['latin'], variable: '--font-serif' });
//   const sans = Inter({ subsets: ['latin'], variable: '--font-sans' });
//   const mono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['500'], variable: '--font-mono' });
//   <html className={`${serif.variable} ${sans.variable} ${mono.variable}`}>
//
// Then map them in tailwind.config: fontFamily.serif / sans / mono.

// A fixed bar-width pattern for the decorative "barcode" strip — purely
// ornamental, not a real scannable code.
const BARCODE_WIDTHS = [
  2, 1, 3, 1, 1, 2, 4, 1, 2, 1, 1, 3, 2, 1, 4, 1, 2, 2, 1, 3, 1, 1, 2, 1, 4, 1,
  2, 1, 3, 1,
];

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
    <main
      className="min-h-screen flex items-center justify-center px-4 py-10 sm:p-6 font-sans relative overflow-hidden"
      style={{
        background:
          'radial-gradient(120% 90% at 50% -10%, #4A1220 0%, #2A0A12 45%, #1A0509 100%)',
      }}
    >
      {/* Velvet curtain fold texture */}
      <div
        className="absolute inset-0 opacity-40 pointer-events-none"
        style={{
          backgroundImage:
            'repeating-linear-gradient(100deg, rgba(255,255,255,0.035) 0px, rgba(255,255,255,0.035) 2px, transparent 2px, transparent 34px)',
        }}
      />
      {/* Soft spotlight above the ticket */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{
          background:
            'radial-gradient(circle, rgba(201,162,75,0.18) 0%, rgba(201,162,75,0) 65%)',
        }}
      />

      {/* The ticket */}
      <div className="relative w-full max-w-sm sm:max-w-md">
        <div className="relative bg-[#FAF6EE] rounded-2xl shadow-[0_30px_70px_-20px_rgba(0,0,0,0.6)]">
          {/* Stub header */}
          <div className="flex items-center justify-between px-6 sm:px-8 py-5">
            <div className="flex items-center gap-2">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
                className="text-[#C9A24B]"
              >
                <path
                  d="M4 4h16v16H4V4z"
                  stroke="currentColor"
                  strokeWidth="1.6"
                />
                <path
                  d="M4 9h2M4 14h2M18 9h2M18 14h2"
                  stroke="currentColor"
                  strokeWidth="1.6"
                />
              </svg>
              <span className="font-serif font-bold text-lg text-[#241A12] tracking-tight">
                Cinemay
              </span>
            </div>
            <span className="font-mono text-[10px] font-medium tracking-[0.15em] text-[#8A7A65] border border-[#C9A24B]/40 rounded-full px-2.5 py-1">
              ADMIT ONE
            </span>
          </div>

          {/* Perforation / tear line, with punched notches at the card edges */}
          <div className="relative border-t-2 border-dashed border-[#D8CBB0] mx-6 sm:mx-8">
            <span
              className="absolute top-1/2 -left-[calc(1.5rem+12px)] sm:-left-[calc(2rem+12px)] -translate-y-1/2 w-6 h-6 rounded-full"
              style={{ background: '#2A0A12' }}
              aria-hidden="true"
            />
            <span
              className="absolute top-1/2 -right-[calc(1.5rem+12px)] sm:-right-[calc(2rem+12px)] -translate-y-1/2 w-6 h-6 rounded-full"
              style={{ background: '#2A0A12' }}
              aria-hidden="true"
            />
          </div>

          {/* Body */}
          <div className="px-6 sm:px-8 py-6 sm:py-8">
            <p className="font-mono text-[10px] font-semibold tracking-[0.2em] text-[#B08F52] uppercase mb-3">
              Admin access
            </p>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#241A12] tracking-tight">
              Sign in to Cinemay
            </h1>
            <p className="text-sm text-[#8A7A65] mt-2 mb-6 sm:mb-8">
            </p>

            {errorMsg && (
              <div
                role="alert"
                className="mb-6 px-4 py-3 bg-[#F7E4E1] border border-[#E8B9B0] text-[#8B2E22] text-sm rounded-lg"
              >
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label
                  htmlFor="admin-email"
                  className="block font-mono text-[10px] font-medium text-[#8A7A65] uppercase tracking-[0.15em] mb-1.5"
                >
                  Email
                </label>
                <input
                  id="admin-email"
                  name="email"
                  type="email"
                  inputMode="email"
                  autoComplete="username"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  className="w-full bg-transparent border-0 border-b-2 border-[#E4DAC6] px-0 py-2 text-base sm:text-sm text-[#241A12] placeholder-[#C4B69B] focus:outline-none focus:border-[#C9A24B] transition-colors disabled:opacity-50"
                />
              </div>

              <div>
                <label
                  htmlFor="admin-password"
                  className="block font-mono text-[10px] font-medium text-[#8A7A65] uppercase tracking-[0.15em] mb-1.5"
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
                  className="w-full bg-transparent border-0 border-b-2 border-[#E4DAC6] px-0 py-2 text-base sm:text-sm text-[#241A12] placeholder-[#C4B69B] focus:outline-none focus:border-[#C9A24B] transition-colors disabled:opacity-50"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="group w-full py-3.5 mt-2 bg-gradient-to-b from-[#D8B562] to-[#C9A24B] hover:from-[#E0C176] hover:to-[#D3AD57] text-[#241A12] rounded-lg text-sm font-semibold tracking-wide uppercase transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[0_10px_20px_-8px_rgba(201,162,75,0.6)]"
              >
                {loading ? (
                  'Verifying…'
                ) : (
                  <>
                    Enter
                    <span className="transition-transform group-hover:translate-x-0.5">
                      →
                    </span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Decorative barcode + real backend detail */}
          <div className="px-6 sm:px-8 pb-6 sm:pb-8">
            <div
              className="flex items-end gap-[2px] h-6 mb-3 opacity-70"
              aria-hidden="true"
            >
              {BARCODE_WIDTHS.map((w, i) => (
                <span
                  key={i}
                  className="bg-[#241A12] h-full"
                  style={{ width: `${w}px` }}
                />
              ))}
            </div>
            <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 font-mono text-[10px] tracking-[0.1em] text-[#B0A488] uppercase text-center">
              <span>HMAC signed</span>
              <span>·</span>
              <span>Rate limited</span>
              <span>·</span>
              <span>7-day session</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

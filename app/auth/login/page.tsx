'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Logo from '@/components/Logo';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  async function handleCredentials(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const result = await signIn('credentials', { email, password, redirect: false });
    if (result?.error) {
      setError('Invalid email or password. Please try again.');
    } else {
      router.push('/');
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#0a0a0f]">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#e63946]/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#e63946]/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <Logo size="lg" />
          <p className="text-gray-500 mt-3 text-sm">Sign in to continue watching</p>
        </div>

        <div className="bg-[#111118] rounded-2xl p-8 border border-white/5 shadow-2xl space-y-5">
          {/* Google sign in */}
          <button
            onClick={() => signIn('google', { callbackUrl: '/' })}
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-100 text-gray-900 font-semibold px-4 py-3 rounded-xl transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
          >
            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-white/8" />
            <span className="text-gray-600 text-xs font-medium">or sign in with email</span>
            <div className="flex-1 h-px bg-white/8" />
          </div>

          {/* Email / password form */}
          <form onSubmit={handleCredentials} className="space-y-3">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center rounded-lg py-2.5 px-3">
                {error}
              </div>
            )}

            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                required
                autoComplete="email"
                className="w-full bg-[#0a0a0f] border border-white/10 text-white placeholder-gray-600 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#e63946] transition-colors"
              />
            </div>

            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                autoComplete="current-password"
                className="w-full bg-[#0a0a0f] border border-white/10 text-white placeholder-gray-600 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#e63946] transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#e63946] hover:bg-[#c1121f] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <p className="text-center text-gray-600 text-xs leading-relaxed">
            By continuing, you agree to our{' '}
            <span className="text-gray-500 hover:text-white cursor-pointer transition-colors">
              Terms of Service
            </span>{' '}
            and{' '}
            <span className="text-gray-500 hover:text-white cursor-pointer transition-colors">
              Privacy Policy
            </span>
          </p>
        </div>

        <p className="text-center text-gray-600 text-xs mt-6">
          <Link href="/" className="text-gray-500 hover:text-white transition-colors">
            ← Back to CineMax
          </Link>
        </p>
      </div>
    </div>
  );
}

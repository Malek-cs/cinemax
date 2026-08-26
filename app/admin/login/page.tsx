'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data: { error?: string; success?: boolean } = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Invalid credentials');
      }

      // تحويل مباشر للداشبورد مع تحديث الـ cache
      router.push('/admin');
      router.refresh();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Invalid email or password');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 p-8 rounded-3xl shadow-2xl backdrop-blur-xl">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 mb-3">
          <h1 className="text-2xl font-extrabold tracking-wider text-white">CINEMAY</h1>
          
        </div>
        
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-950/80 border border-red-800 text-red-300 text-xs rounded-xl text-center font-medium">
            {error}
          </div>
        )}

        <div>
          <label className="text-[11px] uppercase font-bold text-slate-400 tracking-wider block mb-1.5">
            Admin
          </label>
          <input
            type="email"
            required
            autoComplete="email"
          
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition"
          />
        </div>

        <div>
          <label className="text-[11px] uppercase font-bold text-slate-400 tracking-wider block mb-1.5">
             Password
          </label>
          <input
            type="password"
            required
            autoComplete="current-password"

            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs tracking-wider uppercase transition shadow-lg shadow-emerald-600/30 disabled:opacity-50 cursor-pointer mt-2"
        >
          {loading ? 'Authenticating...' : 'Sign In to Panel'}
        </button>
      </form>
    </div>
  );
}
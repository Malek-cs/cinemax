import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: '404 — Page Not Found' };

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      {/* Film reel icon */}
      <div className="mb-6 relative">
        <div className="text-[8rem] font-black text-[#e63946]/10 leading-none select-none absolute inset-0 flex items-center justify-center">
          404
        </div>
        <svg
          className="relative w-24 h-24 text-[#e63946]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
            d="M15 10l4.553-2.069A1 1 0 0121 8.868V15.13a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
          />
        </svg>
      </div>

      <h1 className="text-white text-3xl font-bold mb-3">Page Not Found</h1>
      <p className="text-gray-500 text-sm leading-relaxed mb-8 max-w-sm">
        The content you&apos;re looking for doesn&apos;t exist or may have been removed.
      </p>

      <div className="flex gap-3 flex-wrap justify-center">
        <Link
          href="/"
          className="bg-[#e63946] hover:bg-[#c1121f] text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition-colors"
        >
          Go Home
        </Link>
        <Link
          href="/search"
          className="bg-white/10 hover:bg-white/20 text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition-colors border border-white/10"
        >
          Browse Content
        </Link>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession, signOut } from 'next-auth/react';
import SearchBar from './SearchBar';
import Logo from './Logo';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { data: session } = useSession();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`w-full transition-all duration-500 ${
      scrolled
        ? 'bg-[#0a0a0f]/95 backdrop-blur-md border-b border-white/5 shadow-lg shadow-black/20'
        : 'bg-gradient-to-b from-black/70 to-transparent border-b border-transparent'
    }`}>
      <div className="flex items-center justify-between px-4 md:px-10 h-14 md:h-16">
        {/* Left: Logo + desktop nav links */}
        <div className="flex items-center gap-6">
          <Logo size="sm" />
          <div className="hidden md:flex items-center gap-5">
            <Link href="/" className="text-gray-300 hover:text-white text-sm font-medium transition-colors">
              Home
            </Link>
            <Link href="/search?type=movie" className="text-gray-300 hover:text-white text-sm font-medium transition-colors">
              Movies
            </Link>
            <Link href="/search?type=tv" className="text-gray-300 hover:text-white text-sm font-medium transition-colors">
              Series
            </Link>
          </div>
        </div>

        {/* Right: search + auth + hamburger */}
        <div className="flex items-center gap-2">
          {/* Full search bar — desktop only */}
          <div className="hidden md:block">
            <SearchBar />
          </div>

          {/* Search icon — mobile only */}
          <Link
            href="/search"
            className="md:hidden p-2 text-gray-300 hover:text-white transition-colors"
            aria-label="Search"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </Link>

          {/* Auth — desktop */}
          {session?.user ? (
            <div className="hidden md:flex items-center gap-2">
              {session.user.image ? (
                <Image
                  src={session.user.image}
                  alt={session.user.name ?? 'User'}
                  width={32}
                  height={32}
                  className="rounded-full ring-2 ring-[#e63946]/50"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-[#e63946] flex items-center justify-center text-white text-sm font-bold">
                  {(session.user.name?.[0] ?? session.user.email?.[0] ?? '?').toUpperCase()}
                </div>
              )}
              <button
                onClick={() => signOut()}
                className="text-gray-400 hover:text-white text-xs transition-colors"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <Link
              href="/auth/login"
              className="hidden md:flex items-center bg-[#e63946] hover:bg-[#c1121f] text-white text-sm font-semibold px-4 py-1.5 rounded-lg transition-colors"
            >
              Sign In
            </Link>
          )}

          {/* Hamburger — mobile */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 text-gray-300 hover:text-white transition-colors"
            aria-label="Toggle menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div className="md:hidden bg-[#0a0a0f]/98 backdrop-blur-md border-t border-white/10">
          <div className="px-4 py-3 space-y-1">
            <Link href="/" onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 text-gray-200 hover:text-white hover:bg-white/5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors">
              Home
            </Link>
            <Link href="/search?type=movie" onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 text-gray-200 hover:text-white hover:bg-white/5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors">
              Movies
            </Link>
            <Link href="/search?type=tv" onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 text-gray-200 hover:text-white hover:bg-white/5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors">
              Series
            </Link>

            <div className="pt-2 border-t border-white/10">
              {session?.user ? (
                <div className="flex items-center justify-between px-3 py-2">
                  <div className="flex items-center gap-2">
                    {session.user.image ? (
                      <Image src={session.user.image} alt="User" width={28} height={28}
                        className="rounded-full" />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-[#e63946] flex items-center justify-center text-white text-xs font-bold">
                        {(session.user.name?.[0] ?? '?').toUpperCase()}
                      </div>
                    )}
                    <span className="text-gray-300 text-sm truncate max-w-[160px]">
                      {session.user.name ?? session.user.email}
                    </span>
                  </div>
                  <button onClick={() => signOut()}
                    className="text-gray-500 hover:text-white text-xs transition-colors">
                    Sign Out
                  </button>
                </div>
              ) : (
                <Link href="/auth/login" onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-center w-full bg-[#e63946] hover:bg-[#c1121f] text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors mt-1">
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

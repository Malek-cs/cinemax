'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function NavItems() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const type = searchParams.get('type');

  const items = [
    {
      href: '/',
      label: 'Home',
      active: pathname === '/',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      href: '/search?type=movie',
      label: 'Movies',
      active: pathname === '/search' && type === 'movie',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
        </svg>
      ),
    },
    {
      href: '/search?type=tv',
      label: 'Series',
      active: pathname === '/search' && type === 'tv',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      href: '/search',
      label: 'Search',
      active: pathname === '/search' && !type,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
    },
  ];

  return (
    <>
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`flex flex-col items-center gap-0.5 py-1 px-3 transition-all duration-200 ${
            item.active ? 'text-[#e63946]' : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          <span className={item.active ? 'scale-110' : ''}>{item.icon}</span>
          <span className="text-[9px] font-semibold tracking-wide">{item.label}</span>
        </Link>
      ))}
    </>
  );
}

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 md:hidden bg-[#0a0a0f]/96 backdrop-blur-md border-t border-white/8">
      <div className="flex items-center justify-around h-14">
        <Suspense fallback={null}>
          <NavItems />
        </Suspense>
      </div>
    </nav>
  );
}

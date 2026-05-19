'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const router = useRouter();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (val.trim().length > 1) {
      debounceRef.current = setTimeout(() => {
        router.prefetch(`/search?q=${encodeURIComponent(val.trim())}`);
      }, 300);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setQuery('');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div
        className={`flex items-center bg-[#1a1a24] rounded-full px-3 py-1.5 gap-2 transition-all duration-200 ${
          focused ? 'ring-1 ring-[#e63946]/50' : ''
        }`}
      >
        <svg
          className="w-4 h-4 text-gray-400 flex-shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Search..."
          className="bg-transparent text-white text-sm outline-none placeholder-gray-500 w-32 md:w-48"
        />
      </div>
    </form>
  );
}

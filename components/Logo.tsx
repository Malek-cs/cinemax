import Link from 'next/link';

interface LogoProps {
  size?: 'sm' | 'default' | 'lg';
  asSpan?: boolean;
}

export default function Logo({ size = 'default', asSpan = false }: LogoProps) {
  const dims = { sm: 30, default: 36, lg: 48 };
  const textClass = { sm: 'text-xl', default: 'text-2xl', lg: 'text-4xl' };
  const d = dims[size];

  const icon = (
    <svg
      width={d}
      height={d}
      viewBox="0 0 44 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Background */}
      <rect width="44" height="44" rx="10" fill="#e63946" />

      {/* Film-strip punch holes — corners */}
      <rect x="5"  y="5"  width="5" height="5" rx="1.5" fill="white" opacity="0.7" />
      <rect x="34" y="5"  width="5" height="5" rx="1.5" fill="white" opacity="0.7" />
      <rect x="5"  y="34" width="5" height="5" rx="1.5" fill="white" opacity="0.7" />
      <rect x="34" y="34" width="5" height="5" rx="1.5" fill="white" opacity="0.7" />

      {/* Film-strip side rails */}
      <rect x="5"  y="14" width="5" height="16" rx="1" fill="white" opacity="0.25" />
      <rect x="34" y="14" width="5" height="16" rx="1" fill="white" opacity="0.25" />

      {/* Play triangle */}
      <path d="M16 13 L32 22 L16 31 Z" fill="white" />
    </svg>
  );

  const text = (
    <span className={`${textClass[size]} font-extrabold tracking-tight leading-none`}>
      <span className="text-white">Cine</span>
      <span className="text-[#e63946]">May</span>
    </span>
  );

  if (asSpan) {
    return (
      <span className="flex items-center gap-2.5">
        {icon}
        {text}
      </span>
    );
  }

  return (
    <Link href="/" className="flex items-center gap-2.5 hover:opacity-90 transition-opacity">
      {icon}
      {text}
    </Link>
  );
}

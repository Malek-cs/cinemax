interface AdBannerProps {
  slot: 'top-banner' | 'mid-banner' | 'preroll';
  className?: string;
}

export default function AdBanner({ slot, className = '' }: AdBannerProps) {
  return (
    <div
      id={`ad-${slot}`}
      data-ad-slot={slot}
      className={`ad-slot w-full h-[90px] flex items-center justify-center text-xs text-gray-600 ${className}`}
    >
      Advertisement
    </div>
  );
}

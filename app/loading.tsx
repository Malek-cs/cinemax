import SkeletonRow from '@/components/SkeletonRow';

export default function Loading() {
  return (
    <>
      {/* Hero skeleton */}
      <div className="w-full h-[75vh] md:h-[88vh] min-h-[440px] bg-[#111118] relative overflow-hidden">
        <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-[#1a1a24] to-[#111118]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] to-transparent" />
        <div className="absolute bottom-12 md:bottom-20 left-4 sm:left-8 md:left-12 lg:left-16 space-y-3 w-72 md:w-96">
          <div className="h-4 w-24 bg-[#1a1a24] rounded-full animate-pulse" />
          <div className="h-8 w-full bg-[#1a1a24] rounded animate-pulse" />
          <div className="h-8 w-2/3 bg-[#1a1a24] rounded animate-pulse" />
          <div className="h-4 w-full bg-[#1a1a24] rounded animate-pulse" />
          <div className="h-4 w-4/5 bg-[#1a1a24] rounded animate-pulse" />
          <div className="flex gap-3 mt-2">
            <div className="h-11 w-28 bg-[#1a1a24] rounded-lg animate-pulse" />
            <div className="h-11 w-32 bg-[#1a1a24] rounded-lg animate-pulse" />
          </div>
        </div>
      </div>

      {/* Row skeletons */}
      <div className="space-y-10 py-10">
        {[0, 1, 2, 3].map((i) => (
          <SkeletonRow key={i} />
        ))}
      </div>
    </>
  );
}

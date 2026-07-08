function SkeletonCard() {
  return (
    <div className="flex-shrink-0 w-[120px] sm:w-[145px] md:w-[170px]">
      <div className="aspect-[2/3] rounded-lg bg-[#1a1a24] animate-pulse" />
      <div className="mt-1.5 space-y-1.5 px-0.5">
        <div className="h-2.5 bg-[#1a1a24] rounded animate-pulse w-4/5" />
        <div className="h-2 bg-[#1a1a24] rounded animate-pulse w-1/4" />
      </div>
    </div>
  );
}

export default function SkeletonRow() {
  return (
    <section className="space-y-3">
      <div className="flex items-center gap-3 px-4 md:px-8">
        <div className="w-1 h-6 bg-[#1a1a24] rounded-full animate-pulse" />
        <div className="h-6 w-44 bg-[#1a1a24] rounded animate-pulse" />
      </div>
      <div className="flex gap-3 px-4 md:px-8 overflow-hidden">
        {Array.from({ length: 8 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </section>
  );
}

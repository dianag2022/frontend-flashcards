import { Card } from "@/components/ui/Card";

function SkeletonBar({ className = "" }: { className?: string }) {
  return <div className={`skeleton-shimmer rounded-lg ${className}`} />;
}

export function LoadingDots({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-2 ${className}`} aria-hidden>
      <span className="loading-dot h-2 w-2 rounded-full bg-brand-teal" />
      <span className="loading-dot loading-dot-delay-1 h-2 w-2 rounded-full bg-brand-teal" />
      <span className="loading-dot loading-dot-delay-2 h-2 w-2 rounded-full bg-brand-teal" />
    </div>
  );
}

function DeckCardSkeleton() {
  return (
    <Card className="flex items-center gap-4 p-5">
      <SkeletonBar className="h-12 w-12 shrink-0 rounded-xl" />
      <div className="min-w-0 flex-1 space-y-3">
        <div className="flex items-center gap-2">
          <SkeletonBar className="h-4 w-40" />
          <SkeletonBar className="h-5 w-20 rounded-full" />
        </div>
        <SkeletonBar className="h-3 w-full max-w-md" />
        <SkeletonBar className="h-3 w-2/3 max-w-xs" />
        <div className="flex items-center gap-3 pt-1">
          <SkeletonBar className="h-1.5 max-w-32 flex-1 rounded-full" />
          <SkeletonBar className="h-3 w-16" />
        </div>
      </div>
      <SkeletonBar className="h-5 w-5 shrink-0 rounded" />
    </Card>
  );
}

export function DeckListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div
      className="space-y-4"
      role="status"
      aria-label="Cargando mazos"
    >
      {Array.from({ length: count }, (_, i) => (
        <DeckCardSkeleton key={i} />
      ))}
      <LoadingDots className="pt-2" />
    </div>
  );
}

export function PageLoadingState({ label = "Cargando" }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16" role="status">
      <LoadingDots />
      <p className="sr-only">{label}</p>
    </div>
  );
}

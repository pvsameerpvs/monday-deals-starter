// components/deals/parts/main-table/ActivitiesDots.tsx
"use client";

export function ActivitiesDots() {
  return (
    <div className="flex gap-1">
      {Array.from({ length: 10 }).map((_, i) => (
        <span key={i} className="h-2 w-5 rounded-full bg-muted" aria-hidden />
      ))}
    </div>
  );
}

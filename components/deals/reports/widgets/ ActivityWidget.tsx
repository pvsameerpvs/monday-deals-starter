"use client";

export default function ActivityWidget() {
  return (
    <div className="space-y-2">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex gap-2">
          {[...Array(10)].map((__, j) => (
            <span
              key={j}
              className="h-2 flex-1 rounded bg-muted"
              style={{ opacity: (j + 3) % 4 === 0 ? 0.4 : 1 }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

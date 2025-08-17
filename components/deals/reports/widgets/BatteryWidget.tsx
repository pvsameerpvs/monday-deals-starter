"use client";

export default function BatteryWidget() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="relative h-10 w-64 rounded-md border">
        <div className="absolute inset-y-1 left-1 right-8 rounded bg-emerald-600/20" />
        <div className="absolute inset-y-1 left-1 w-1/3 rounded bg-emerald-600" />
        <div className="absolute right-1 top-1/2 h-6 w-2 -translate-y-1/2 rounded bg-foreground/40" />
      </div>
    </div>
  );
}

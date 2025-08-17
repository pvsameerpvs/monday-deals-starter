"use client";

export default function PieWidget() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="relative h-40 w-40 rounded-full bg-gradient-to-r from-indigo-600 to-sky-500">
        <div className="absolute inset-4 rounded-full bg-white" />
      </div>
      <div className="ml-6 space-y-2 text-sm">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-sky-500" />
          Discovery: 50.0%
        </div>
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-indigo-600" />
          New: 50.0%
        </div>
      </div>
    </div>
  );
}

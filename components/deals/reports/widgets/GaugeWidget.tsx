"use client";

export default function GaugeWidget() {
  return (
    <div className="flex h-full flex-col items-center justify-center">
      <div className="relative h-48 w-80 overflow-hidden">
        <div className="absolute inset-x-0 bottom-0 h-40 rounded-b-[90px] bg-gray-200" />
        <div className="absolute left-1/2 top-[70%] h-1 w-72 -translate-x-1/2 origin-left rotate-[6deg] rounded bg-black" />
      </div>
      <div className="mt-2 grid grid-cols-2 gap-8 text-center text-sm">
        <div>
          <div className="text-xs text-muted-foreground">ACTUAL</div>
          <div className="text-2xl font-semibold">0</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">TARGET</div>
          <div className="text-2xl font-semibold">500K</div>
        </div>
      </div>
    </div>
  );
}

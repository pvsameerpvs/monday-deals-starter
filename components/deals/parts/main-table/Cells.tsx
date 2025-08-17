// components/deals/parts/main-table/Cells.tsx
"use client";

import * as React from "react";
import clsx from "clsx";

type HeaderCellProps = {
  width: number;
  sticky?: boolean;
  className?: string;
  children: React.ReactNode;
};

export function HeaderCell({
  width,
  sticky,
  className,
  children,
}: HeaderCellProps) {
  return (
    <div
      className={clsx(
        "h-10 shrink-0 border-r px-2.5 text-sm text-foreground/80",
        "grid place-items-center text-center",
        sticky && "sticky left-0 bg-background",
        className
      )}
      style={{ width }}
    >
      <div className="w-full truncate">{children}</div>
    </div>
  );
}

type CellProps = {
  width: number;
  sticky?: boolean;
  className?: string;
  children?: React.ReactNode;
};

export function Cell({ width, sticky, className, children }: CellProps) {
  return (
    <div
      className={clsx(
        "h-12 shrink-0 border-r px-2.5 text-sm text-foreground/80",
        "grid place-items-center text-center",
        sticky && "sticky left-0 bg-background",
        className
      )}
      style={{ width }}
    >
      <div className="w-full truncate">{children}</div>
    </div>
  );
}

// components/deals/parts/main-table/StageSelect.tsx
"use client";

import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import clsx from "clsx";
import { STAGES, StageKey } from "./types";

export function StageSelect({
  value,
  onChange,
}: {
  value: StageKey;
  onChange: (v: StageKey) => void;
}) {
  const meta = STAGES.find((s) => s.key === value)!;

  return (
    <Select defaultValue={value} onValueChange={(v) => onChange(v as StageKey)}>
      <SelectTrigger className="h-7 w-[120px] justify-center rounded-full border-0 px-0">
        <SelectValue>
          <span
            className={clsx(
              "inline-flex min-w-[90px] items-center justify-center rounded-full px-3 py-1 text-white",
              meta.color
            )}
          >
            {meta.label}
          </span>
        </SelectValue>
      </SelectTrigger>
      <SelectContent align="start" className="w-[160px]">
        {STAGES.map((s) => (
          <SelectItem key={s.key} value={s.key}>
            <span
              className={clsx(
                "mr-2 inline-block h-2.5 w-2.5 rounded-full",
                s.color
              )}
            />
            {s.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

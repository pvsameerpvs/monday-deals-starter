// components/deals/parts/main-table/renderers.tsx
"use client";

import * as React from "react";
import clsx from "clsx";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Column, Row, StageKey } from "./types";

/** Pipeline stages used by the Stage cell */
export const STAGES: ReadonlyArray<{
  key: StageKey;
  label: string;
  color: string; // Tailwind bg-* class for the pill
}> = [
  { key: "new", label: "New", color: "bg-indigo-600" },
  { key: "qualified", label: "Qualified", color: "bg-amber-600" },
  { key: "proposal", label: "Proposal", color: "bg-sky-600" },
  { key: "won", label: "Won", color: "bg-emerald-600" },
  { key: "lost", label: "Lost", color: "bg-rose-600" },
] as const;

/**
 * Renders a data cell based on column id.
 * Keep this presentational and stateless; mutations are delegated via callbacks.
 */
export function renderCell(
  id: Column["id"],
  row: Row,
  onStageChange: (s: StageKey) => void,
  onValueChange: (v: number) => void
): React.ReactNode {
  switch (id) {
    case "activities": {
      // simple timeline bars
      return (
        <div className="flex gap-1">
          {Array.from({ length: 10 }).map((_, i) => (
            <span key={i} className="h-2 w-5 rounded-full bg-muted" />
          ))}
        </div>
      );
    }

    case "stage": {
      const meta = STAGES.find((s) => s.key === row.stage) ?? STAGES[0]; // fallback to keep UI stable

      return (
        <Select
          defaultValue={row.stage}
          onValueChange={(v) => onStageChange(v as StageKey)}
        >
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

    case "owner":
      return <span className="text-muted-foreground">—</span>;

    case "value":
      return (
        <div className="flex items-center justify-center gap-2">
          <span className="text-muted-foreground">$</span>
          <Input
            type="number"
            className="h-8 w-[120px]"
            value={row.value}
            onChange={(e) => onValueChange(Number(e.target.value))}
          />
        </div>
      );

    case "contacts":
      return <span>{row.contacts ?? 0}</span>;

    case "account":
      return <span className="truncate">{row.account ?? ""}</span>;

    case "created":
      return <span>{row.created}</span>;

    case "probability":
      return <span>{row.probability}%</span>;

    case "notes":
      return <span className="truncate">{row.notes ?? ""}</span>;

    // "deal" column is the pinned first cell; it’s rendered in GroupTable.
    default:
      return null;
  }
}

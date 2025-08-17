// components/deals/parts/main-table/SortableRow.tsx
"use client";

import * as React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import clsx from "clsx";
import { Hand } from "lucide-react";
import { Input } from "@/components/ui/input";

import { Cell } from "./Cells";
import { ActivitiesDots } from "./ActivitiesDots";
import { StageSelect } from "./StageSelect";
import type { Column, Row, StageKey } from "./types";

export function SortableRow({
  id,
  pinnedWidth,
  flexCols,
  row,
  onStageChange,
  onValueChange,
  zebra,
}: {
  id: string;
  pinnedWidth: number;
  flexCols: Column[];
  row: Row;
  onStageChange: (s: StageKey) => void;
  onValueChange: (v: number) => void;
  zebra?: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={clsx(
        "flex border-b",
        zebra && "bg-muted/20",
        isDragging && "opacity-80"
      )}
      {...attributes}
    >
      {/* pinned cell (deal + grab handle) */}
      <Cell width={pinnedWidth} sticky className="z-10">
        <div className="flex items-center gap-2">
          <button
            {...listeners}
            aria-label="Drag row"
            className="inline-flex h-6 w-6 items-center justify-center rounded hover:bg-muted/50 cursor-grab active:cursor-grabbing"
          >
            <Hand className="h-4 w-4 opacity-70" />
          </button>
          <span className="truncate">{row.deal}</span>
        </div>
      </Cell>

      {/* scrollable part */}
      <div className="min-w-0 flex-1 overflow-x-auto">
        <div
          className="flex"
          style={{ width: flexCols.reduce((t, c) => t + c.width, 0) }}
        >
          {flexCols.map((c) => (
            <Cell key={c.id} width={c.width}>
              {renderCell(c.id)}
            </Cell>
          ))}
        </div>
      </div>
    </div>
  );

  function renderCell(id: Column["id"]) {
    switch (id) {
      case "activities":
        return <ActivitiesDots />;

      case "stage":
        return <StageSelect value={row.stage} onChange={onStageChange} />;

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

      default:
        return null;
    }
  }
}

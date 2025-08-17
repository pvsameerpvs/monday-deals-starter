"use client";

import * as React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Filter, Grip } from "lucide-react";
import clsx from "clsx";
import { clamp } from "./utils";
import { GRID_COLS, MIN_H, MIN_W } from "./constants";
import type { Widget } from "./types";

export default function SortableResizableCard({
  widget,
  children,
  rowHeight,
  onResize,
  onRemove,
  onRename,
}: {
  widget: Widget;
  children: React.ReactNode;
  rowHeight: number;
  onResize: (id: string, w: number, h: number) => void;
  onRemove: (id: string) => void;
  onRename: (id: string, title: string) => void;
}) {
  const { id, title, w, h } = widget;

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
    gridColumn: `span ${w}`,
    gridRow: `span ${h}`,
  };

  // inline rename
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState(title);
  React.useEffect(() => setDraft(title), [title]);

  // bottom-right pointer resize
  const start = React.useRef({ x: 0, y: 0, w, h });
  const onPointerDown: React.PointerEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const card = (e.currentTarget.parentElement?.parentElement ??
      null) as HTMLElement | null;
    if (!card) return;

    const grid = card.closest("[data-grid]") as HTMLElement | null;
    const gridWidth = grid?.clientWidth ?? 1;
    const colWidth = gridWidth / GRID_COLS;

    start.current = { x: e.clientX, y: e.clientY, w, h };

    const move = (ev: PointerEvent) => {
      const dx = ev.clientX - start.current.x;
      const dy = ev.clientY - start.current.y;
      const nextW = clamp(
        Math.round(start.current.w + dx / colWidth),
        MIN_W,
        GRID_COLS
      );
      const nextH = clamp(
        Math.round(start.current.h + dy / rowHeight),
        MIN_H,
        12
      );
      onResize(id, nextW, nextH);
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up, { once: true });
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={clsx(
        "group relative rounded-xl border bg-white shadow-sm",
        "outline outline-0 outline-cyan-600/60",
        isDragging && "opacity-80"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2 rounded-t-xl border-b px-3 py-2">
        <div className="flex items-center gap-2">
          <button
            {...listeners}
            {...attributes}
            aria-label="Drag widget"
            className="grid h-7 w-7 place-items-center rounded hover:bg-muted/50 cursor-grab active:cursor-grabbing"
            title="Drag"
          >
            <Grip className="h-4 w-4 opacity-80" />
          </button>

          {!editing ? (
            <div
              className="text-[15px] font-semibold leading-none rounded-md border border-dotted border-transparent px-1 hover:border-foreground/40 hover:cursor-text"
              onDoubleClick={() => setEditing(true)}
              title="Double-click to rename"
            >
              {title}
            </div>
          ) : (
            <input
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={() => {
                const next = draft.trim();
                if (next && next !== title) onRename(id, next);
                setEditing(false);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter")
                  (e.currentTarget as HTMLInputElement).blur();
                if (e.key === "Escape") setEditing(false);
              }}
              className="w-[20ch] rounded border px-1 py-0.5 text-[14px] outline-none"
            />
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <Filter className="h-4 w-4 opacity-80" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuLabel>Widget</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setEditing(true)}>
                Rename
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onRemove(id)}>
                Remove
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Top-right hover wedge */}
      <span
        aria-hidden
        className="
          pointer-events-none absolute right-0 top-0 h-0 w-0
          opacity-0 transition-opacity duration-150
          border-t-[12px] border-r-[12px] border-t-cyan-700 border-r-transparent
          rounded-tr-[6px]
          group-hover:opacity-100
        "
      />

      {/* Body */}
      <div className="p-4">{children}</div>

      {/* Resize handle */}
      <div
        onPointerDown={onPointerDown}
        title="Drag to resize"
        role="separator"
        aria-orientation="horizontal"
        className="
          absolute bottom-0 right-0 h-4 w-4 cursor-nwse-resize
          after:absolute after:inset-0 after:m-auto
          after:h-3 after:w-3 after:rounded-sm
          after:border-b-2 after:border-r-2 after:border-gray-400
          after:content-['']
        "
      />
    </div>
  );
}

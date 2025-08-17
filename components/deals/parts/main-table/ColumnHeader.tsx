"use client";

import * as React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { HeaderCell } from "./Cells";
import type { Column } from "./types";

const MIN_COL_WIDTH = 120;

type Props = {
  id: Column["id"];
  width: number;
  label: string;
  onResize: (id: Column["id"], nextWidth: number) => void;
  onRename: (id: Column["id"], nextLabel: string) => void;
};

export function SortableHeader({
  id,
  width,
  label,
  onResize,
  onRename,
}: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState(label);

  React.useEffect(() => setDraft(label), [label]);

  const startEdit = (e?: React.SyntheticEvent) => {
    e?.stopPropagation();
    setDraft(label);
    setEditing(true);
  };
  const commit = () => {
    const next = draft.trim();
    if (next && next !== label) onRename(id, next);
    setEditing(false);
  };

  // resize
  const startRef = React.useRef({ x: 0, w: width });
  React.useEffect(() => {
    startRef.current.w = width;
  }, [width]);

  const onPointerDown: React.PointerEventHandler<HTMLDivElement> = (e) => {
    e.stopPropagation();
    e.preventDefault();
    startRef.current = { x: e.clientX, w: width };
    const onMove = (ev: PointerEvent) => {
      const dx = ev.clientX - startRef.current.x;
      onResize(id, Math.max(MIN_COL_WIDTH, startRef.current.w + dx));
    };
    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp, { once: true });
  };

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <HeaderCell width={width} className="relative select-none">
        {!editing ? (
          <div
            className={`w-full truncate ${isDragging ? "opacity-70" : ""}`}
            onDoubleClick={startEdit}
            onMouseDown={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              if (e.key === "F2") {
                e.preventDefault();
                startEdit(e);
              }
            }}
            tabIndex={0}
            role="textbox"
            title="Double-click to rename (or press F2)"
          >
            <span className="inline-block rounded-md border border-dotted border-transparent px-1 hover:border-foreground/40 hover:cursor-text">
              {label}
            </span>
          </div>
        ) : (
          <input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === "Enter") commit();
              if (e.key === "Escape") setEditing(false);
            }}
            className="w-[20ch] rounded-md border px-1 py-0.5 text-center outline-none"
          />
        )}

        {/* resize handle */}
        <div
          role="separator"
          aria-orientation="vertical"
          aria-label="Resize column"
          title="Drag to resize"
          onPointerDown={onPointerDown}
          className="absolute right-0 top-0 h-full w-1.5 cursor-col-resize hover:bg-foreground/10 active:bg-foreground/20 touch-none"
          style={{ transform: "translateX(50%)" }}
        />
      </HeaderCell>
    </div>
  );
}

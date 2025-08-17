// components/deals/parts/main-table/GroupTable.tsx
"use client";

import * as React from "react";
import { DndContext, DragEndEvent } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ChevronDown, ChevronRight, GripVertical, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HeaderCell, Cell } from "./Cells";
import { widthSum } from "./utils";
import { renderCell } from "./renderers";
import type { Column, Group, Row, StageKey } from "./types";

export function GroupTable({
  group,
  columns,
  sensors,
  onToggle,
  onRowsReorder,
  onAddRow,
  onStageChange,
  onValueChange,
  headerRight,
  renderHeader,
  /** listeners passed from SortableGroup so the small header stripe becomes the handle */
  dragHandleListeners,
  onRename, // rename group
  onRenameDeal, // ⬅ NEW: rename a specific row's deal title
}: {
  group: Group;
  columns: Column[];
  sensors: any;
  onToggle: () => void;
  onRowsReorder: (ids: string[]) => void;
  onAddRow: (name: string) => void;
  onStageChange: (rowId: string, stage: StageKey) => void;
  onValueChange: (rowId: string, value: number) => void;
  headerRight?: React.ReactNode;
  renderHeader: () => React.ReactNode;
  dragHandleListeners?: any;
  onRename: (name: string) => void;
  onRenameDeal: (rowId: string, name: string) => void; // ⬅ NEW
}) {
  const [adding, setAdding] = React.useState(false);
  const [draft, setDraft] = React.useState("");

  // group rename state
  const [renaming, setRenaming] = React.useState(false);
  const [nameDraft, setNameDraft] = React.useState(group.name);

  const startRename = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setNameDraft(group.name);
    setRenaming(true);
  };
  const commitRename = () => {
    const next = nameDraft.trim();
    if (next && next !== group.name) onRename(next);
    setRenaming(false);
  };
  const cancelRename = () => setRenaming(false);

  const pinned = columns[0];
  const flexCols = columns.slice(1);
  const tableWidth =
    pinned.width + flexCols.reduce((t, c) => widthSum(t, c.width), 0);

  const commitAdd = () => {
    const nm = draft.trim();
    if (nm) onAddRow(nm);
    setDraft("");
    setAdding(false);
  };

  React.useEffect(() => {
    if (!renaming) setNameDraft(group.name);
  }, [group.name, renaming]);

  return (
    <div className="mb-8 min-w-0">
      {/* Header row with draggable mini stripe */}
      <div className="flex items-center justify-between px-4">
        <div
          role="button"
          tabIndex={0}
          onClick={() => !renaming && onToggle()}
          onKeyDown={(e) => {
            if (!renaming && (e.key === "Enter" || e.key === " ")) onToggle();
          }}
          className="flex items-center gap-2 py-2"
        >
          {/* DRAG HANDLE for the whole group */}
          <span
            {...(dragHandleListeners || {})}
            className="inline-block h-8 w-1.5 rounded-full cursor-grab active:cursor-grabbing"
            style={{ backgroundColor: group.color }}
            title="Drag to reorder group"
            aria-label="Drag group"
            onClick={(e) => e.stopPropagation()} // keep clicks from toggling
          />

          {group.collapsed ? (
            <ChevronRight className="h-4 w-4 opacity-60" />
          ) : (
            <ChevronDown className="h-4 w-4 opacity-60" />
          )}

          {/* Group name: display or edit */}
          {!renaming ? (
            <span
              className="inline-block select-none rounded-md border border-dotted border-transparent px-1 hover:border-foreground/40 hover:cursor-text"
              title="Double-click to rename (or press F2)"
              onClick={(e) => e.stopPropagation()}
              onDoubleClick={startRename}
              onKeyDown={(e) => {
                if (e.key === "F2") {
                  e.preventDefault();
                  e.stopPropagation();
                  startRename();
                }
              }}
              tabIndex={0}
              role="textbox"
              aria-label="Group name"
            >
              {group.name}
            </span>
          ) : (
            <div
              className="flex items-center gap-2 rounded-lg border-2 px-2 py-1 border-[var(--primary-hover-color,#0b7c89)] bg-transparent"
              onClick={(e) => e.stopPropagation()}
            >
              <span
                className="h-4 w-4 rounded-full"
                style={{ backgroundColor: group.color }}
                aria-hidden
              />
              <input
                autoFocus
                value={nameDraft}
                onChange={(e) => setNameDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") commitRename();
                  if (e.key === "Escape") cancelRename();
                }}
                onBlur={commitRename}
                className="w-[18ch] bg-transparent text-[18px] font-semibold outline-none"
                placeholder="Group name"
              />
            </div>
          )}

          <span
            className="ml-3 text-sm text-muted-foreground"
            onClick={(e) => e.stopPropagation()}
          >
            {group.rows.length} {group.rows.length === 1 ? "Deal" : "Deals"}
          </span>
        </div>
        {headerRight}
      </div>

      {/* Table with ONE shared horizontal scroller */}
      {!group.collapsed && (
        <div className="relative mx-3 overflow-x-auto rounded-lg border-t border-r">
          {/* Full-height visual stripe (non-interactive) */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-0 w-[12px] rounded-l-lg"
            style={{ backgroundColor: group.color }}
          />
          <span
            aria-hidden
            className="pointer-events-none absolute bottom-0 left-0 h-8 w-[12px] rounded-bl-lg opacity-30"
            style={{ backgroundColor: group.color }}
          />

          {/* Content wrapper (pad so stripe doesn't cover cells) */}
          <div style={{ width: tableWidth }} className="relative pl-3">
            {/* header */}
            <div className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur">
              {renderHeader()}
            </div>

            {/* body (sortable rows) */}
            <DndContext
              sensors={sensors}
              onDragEnd={(e: DragEndEvent) => {
                const { active, over } = e;
                if (!over || active.id === over.id) return;
                const ids = group.rows.map((r) => r.id);
                const oldIndex = ids.indexOf(String(active.id));
                const newIndex = ids.indexOf(String(over.id));
                if (oldIndex < 0 || newIndex < 0) return;
                onRowsReorder(arrayMove(ids, oldIndex, newIndex));
              }}
            >
              <SortableContext
                items={group.rows.map((r) => r.id)}
                strategy={verticalListSortingStrategy}
              >
                {group.rows.map((row, idx) => (
                  <RowLine
                    key={row.id}
                    id={row.id}
                    row={row}
                    pinnedWidth={pinned.width}
                    flexCols={flexCols}
                    onStageChange={(s) => onStageChange(row.id, s)}
                    onValueChange={(v) => onValueChange(row.id, v)}
                    onRenameDeal={(name) => onRenameDeal(row.id, name)} // ⬅ pass down
                    zebra={idx % 2 === 1}
                  />
                ))}
              </SortableContext>
            </DndContext>

            {/* "+ Add deal" row */}
            <div className="flex border-t">
              <Cell width={pinned.width} sticky className="z-10">
                {!adding ? (
                  <button
                    type="button"
                    onClick={() => setAdding(true)}
                    className="inline-flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-muted/40"
                  >
                    <Plus className="h-4 w-4" />
                    <span className="text-sm">Add deal</span>
                  </button>
                ) : (
                  <Input
                    autoFocus
                    placeholder="Deal name"
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    className="h-8 w-[220px]"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") commitAdd();
                      if (e.key === "Escape") {
                        setAdding(false);
                        setDraft("");
                      }
                    }}
                    onBlur={commitAdd}
                  />
                )}
              </Cell>
              <div
                style={{ width: tableWidth - pinned.width }}
                className="h-12"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   Row (sortable within group)
────────────────────────────────────────────────────────────────────────── */

function RowLine({
  id,
  row,
  pinnedWidth,
  flexCols,
  zebra,
  onStageChange,
  onValueChange,
  onRenameDeal, // ⬅ NEW
}: {
  id: string;
  row: Row;
  pinnedWidth: number;
  flexCols: Column[];
  zebra?: boolean;
  onStageChange: (s: StageKey) => void;
  onValueChange: (v: number) => void;
  onRenameDeal: (name: string) => void; // ⬅ NEW
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

  // inline edit for row.deal
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState(row.deal);
  React.useEffect(() => setDraft(row.deal), [row.deal]);

  const commit = () => {
    const next = draft.trim();
    if (next && next !== row.deal) onRenameDeal(next);
    setEditing(false);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex border-b ${zebra ? "bg-muted/20" : ""} ${
        isDragging ? "opacity-80" : ""
      }`}
      {...attributes}
    >
      {/* pinned first cell (sticky) */}
      <Cell width={pinnedWidth} sticky className="z-10">
        <div className="group flex items-center gap-2">
          {/* drag handle for row */}
          <button
            {...listeners}
            aria-label="Drag row"
            className="inline-flex h-6 w-6 items-center justify-center rounded hover:bg-muted/50 cursor-grab active:cursor-grabbing"
            title="Drag row"
          >
            <GripVertical className="hidden h-4 w-4 opacity-70 group-hover:block" />
          </button>

          {/* Deal title — renamable */}
          {!editing ? (
            <span
              className="truncate rounded-md border border-dotted border-transparent px-1 hover:border-foreground/40 hover:cursor-text"
              title="Double-click to rename (or press F2)"
              onDoubleClick={(e) => {
                e.stopPropagation();
                setEditing(true);
              }}
              onMouseDown={(e) => e.stopPropagation()} // avoid starting drag
              onKeyDown={(e) => {
                if (e.key === "F2") {
                  e.preventDefault();
                  e.stopPropagation();
                  setEditing(true);
                }
              }}
              tabIndex={0}
              role="textbox"
            >
              {row.deal}
            </span>
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
              className="w-[24ch] rounded-md border px-1 py-0.5 outline-none"
              placeholder="Deal name"
            />
          )}
        </div>
      </Cell>

      {/* scrollable cells (same scroller) */}
      {flexCols.map((c) => (
        <Cell key={c.id} width={c.width}>
          {renderCell(c.id, row, onStageChange, onValueChange)}
        </Cell>
      ))}
    </div>
  );
}

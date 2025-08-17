// components/deals/parts/main-table/MainTable.tsx
"use client";

import * as React from "react";
import {
  DndContext,
  DragEndEvent,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  horizontalListSortingStrategy,
  verticalListSortingStrategy,
  arrayMove,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { HeaderCell } from "./Cells";
import { SortableHeader } from "./ColumnHeader";
import { GroupTable } from "./GroupTable";
import { reorderByIds, uuid, widthSum } from "./utils";
import type { Column, Group, Row } from "./types";

const MIN_COL_WIDTH = 120;

/* Columns */
const DEFAULT_COLUMNS: Column[] = [
  { id: "deal", label: "Deal", width: 280, pinned: true },
  { id: "activities", label: "Activities timeline", width: 360 },
  { id: "stage", label: "Stage", width: 180 },
  { id: "owner", label: "Owner", width: 160 },
  { id: "value", label: "Deal Value", width: 200 },
  { id: "contacts", label: "Contacts", width: 180 },
  { id: "account", label: "Account", width: 200 },
  { id: "created", label: "Created at", width: 180 },
  { id: "probability", label: "Probability", width: 160 },
  { id: "notes", label: "Notes", width: 320 },
];

/* Rows / Groups */
const makeRow = (n: number): Row => ({
  id: `row-${uuid()}`,
  deal: "New deal",
  stage: "new",
  value: 0,
  contacts: 0,
  account: "",
  created: new Date().toISOString().slice(0, 10),
  probability: 10 + (n % 5) * 10,
  notes: "",
});

const seedGroup = (name: string, color: string, count = 2): Group => ({
  id: `grp-${uuid()}`,
  name,
  color,
  rows: Array.from({ length: count }, (_, i) => makeRow(i)),
});

const GROUP_COLORS = [
  "#f59e0b",
  "#e11d48",
  "#06b6d4",
  "#22c55e",
  "#8b5cf6",
  "#f97316",
  "#0ea5e9",
  "#a855f7",
] as const;

/* Sortable wrapper for a whole group row (Y-axis) */
function SortableGroup({
  id,
  children,
}: {
  id: string;
  children: (args: { listeners: any }) => React.ReactNode;
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
      className={isDragging ? "opacity-80" : undefined}
      {...attributes}
    >
      {children({ listeners })}
    </div>
  );
}

/* MainTable */
export function MainTable() {
  // groups/columns/sensors same as your latest
  const [groups, setGroups] = React.useState<Group[]>([
    seedGroup("New Group", GROUP_COLORS[0]),
  ]);
  const [colorIdx, setColorIdx] = React.useState<number>(1);

  const [columns, setColumns] = React.useState<Column[]>(DEFAULT_COLUMNS);
  const pinned = columns[0];
  const flexCols = columns.slice(1);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, {
      pressDelay: 150,
      activationConstraint: { distance: 5 },
    })
  );

  // resize
  const onColumnResize = React.useCallback(
    (id: Column["id"], nextWidth: number) => {
      setColumns((cols) =>
        cols.map((c) =>
          c.id === id
            ? { ...c, width: Math.max(MIN_COL_WIDTH, Math.round(nextWidth)) }
            : c
        )
      );
    },
    []
  );

  // rename column label
  const onColumnRename = React.useCallback((id: Column["id"], next: string) => {
    setColumns((cols) =>
      cols.map((c) => (c.id === id ? { ...c, label: next } : c))
    );
  }, []);

  // move columns (unchanged)
  const onColumnsDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const ids = flexCols.map((c) => c.id);
    const oldIndex = ids.indexOf(String(active.id) as Column["id"]);
    const newIndex = ids.indexOf(String(over.id) as Column["id"]);
    if (oldIndex < 0 || newIndex < 0) return;
    const moved = arrayMove(flexCols, oldIndex, newIndex);
    setColumns([pinned, ...moved]);
  };

  // reorder groups (unchanged)
  const onGroupsDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const ids = groups.map((g) => g.id);
    const oldIndex = ids.indexOf(String(active.id));
    const newIndex = ids.indexOf(String(over.id));
    if (oldIndex < 0 || newIndex < 0) return;
    const movedIds = arrayMove(ids, oldIndex, newIndex);
    const byId = new Map(groups.map((g) => [g.id, g]));
    setGroups(movedIds.map((id) => byId.get(id)!));
  };

  // add group (unchanged)
  const addGroup = () => {
    const color = GROUP_COLORS[colorIdx % GROUP_COLORS.length];
    setColorIdx((i) => i + 1);
    setGroups((gs) => [...gs, seedGroup("New Group", color)]);
  };

  // pinned header: resize + rename state
  const [editPinned, setEditPinned] = React.useState(false);
  const [pinnedDraft, setPinnedDraft] = React.useState(pinned.label);
  React.useEffect(() => setPinnedDraft(pinned.label), [pinned.label]);

  const onPinnedPointerDown: React.PointerEventHandler<HTMLDivElement> = (
    e
  ) => {
    e.stopPropagation();
    e.preventDefault();
    const startX = e.clientX;
    const startW = pinned.width;
    const move = (ev: PointerEvent) => {
      const dx = ev.clientX - startX;
      onColumnResize(pinned.id, startW + dx);
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up, { once: true });
  };

  return (
    <div className="select-none min-w-0">
      <DndContext sensors={sensors} onDragEnd={onGroupsDragEnd}>
        <SortableContext
          items={groups.map((g) => g.id)}
          strategy={verticalListSortingStrategy}
        >
          {groups.map((g) => (
            <SortableGroup key={g.id} id={g.id}>
              {({ listeners }) => (
                <GroupTable
                  group={g}
                  columns={columns}
                  sensors={sensors}
                  dragHandleListeners={listeners}
                  onToggle={() =>
                    setGroups((gs) =>
                      gs.map((x) =>
                        x.id === g.id ? { ...x, collapsed: !x.collapsed } : x
                      )
                    )
                  }
                  onRowsReorder={(newOrder) =>
                    setGroups((gs) =>
                      gs.map((x) =>
                        x.id === g.id
                          ? { ...x, rows: reorderByIds(x.rows, newOrder) }
                          : x
                      )
                    )
                  }
                  onAddRow={(name) =>
                    setGroups((gs) =>
                      gs.map((x) =>
                        x.id === g.id
                          ? {
                              ...x,
                              rows: [...x.rows, { ...makeRow(0), deal: name }],
                            }
                          : x
                      )
                    )
                  }
                  onStageChange={(rowId, stage) =>
                    setGroups((gs) =>
                      gs.map((x) =>
                        x.id === g.id
                          ? {
                              ...x,
                              rows: x.rows.map((r) =>
                                r.id === rowId ? { ...r, stage } : r
                              ),
                            }
                          : x
                      )
                    )
                  }
                  onValueChange={(rowId, value) =>
                    setGroups((gs) =>
                      gs.map((x) =>
                        x.id === g.id
                          ? {
                              ...x,
                              rows: x.rows.map((r) =>
                                r.id === rowId ? { ...r, value } : r
                              ),
                            }
                          : x
                      )
                    )
                  }
                  // NEW: rename a deal (row title)
                  onRenameDeal={(rowId, name) =>
                    setGroups((gs) =>
                      gs.map((x) =>
                        x.id === g.id
                          ? {
                              ...x,
                              rows: x.rows.map((r) =>
                                r.id === rowId ? { ...r, deal: name } : r
                              ),
                            }
                          : x
                      )
                    )
                  }
                  onRename={(name) =>
                    setGroups((gs) =>
                      gs.map((x) => (x.id === g.id ? { ...x, name } : x))
                    )
                  }
                  renderHeader={() => (
                    <div className="flex">
                      {/* PINNED header: resizable + renamable */}
                      <HeaderCell
                        width={pinned.width}
                        sticky
                        className="relative z-20"
                      >
                        {!editPinned ? (
                          <div
                            className="flex items-center justify-center gap-1"
                            onDoubleClick={(e) => {
                              e.stopPropagation();
                              setEditPinned(true);
                            }}
                            onMouseDown={(e) => e.stopPropagation()}
                            onKeyDown={(e) => {
                              if (e.key === "F2") {
                                e.preventDefault();
                                setEditPinned(true);
                              }
                            }}
                            tabIndex={0}
                            role="textbox"
                            title="Double-click to rename (or press F2)"
                          >
                            <span className="truncate rounded-md border border-dotted border-transparent px-1 hover:border-foreground/40 hover:cursor-text">
                              {pinned.label}
                            </span>
                          </div>
                        ) : (
                          <input
                            autoFocus
                            value={pinnedDraft}
                            onChange={(e) => setPinnedDraft(e.target.value)}
                            onBlur={() => {
                              const next = pinnedDraft.trim();
                              if (next && next !== pinned.label)
                                onColumnRename(pinned.id, next);
                              setEditPinned(false);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                const next = pinnedDraft.trim();
                                if (next && next !== pinned.label)
                                  onColumnRename(pinned.id, next);
                                setEditPinned(false);
                              }
                              if (e.key === "Escape") setEditPinned(false);
                            }}
                            className="w-[20ch] rounded-md border px-1 py-0.5 text-center outline-none"
                          />
                        )}

                        <div
                          role="separator"
                          aria-orientation="vertical"
                          aria-label="Resize column"
                          title="Drag to resize"
                          onPointerDown={onPinnedPointerDown}
                          className="absolute right-0 top-0 h-full w-1.5 cursor-col-resize hover:bg-foreground/10 active:bg-foreground/20 touch-none"
                          style={{ transform: "translateX(50%)" }}
                        />
                      </HeaderCell>

                      {/* FLEX headers: DnD + resize + rename */}
                      <div
                        className="flex"
                        style={{
                          width: flexCols.reduce(
                            (t, c) => widthSum(t, c.width),
                            0
                          ),
                        }}
                      >
                        <DndContext
                          sensors={sensors}
                          onDragEnd={onColumnsDragEnd}
                        >
                          <SortableContext
                            items={flexCols.map((c) => c.id)}
                            strategy={horizontalListSortingStrategy}
                          >
                            {flexCols.map((c) => (
                              <SortableHeader
                                key={c.id}
                                id={c.id}
                                width={c.width}
                                label={c.label}
                                onResize={onColumnResize}
                                onRename={onColumnRename}
                              />
                            ))}
                          </SortableContext>
                        </DndContext>
                      </div>
                    </div>
                  )}
                />
              )}
            </SortableGroup>
          ))}
        </SortableContext>
      </DndContext>

      <div className="px-4 py-2">
        <Button
          variant="outline"
          className="h-9 gap-2 rounded-md"
          onClick={addGroup}
        >
          <Plus className="h-4 w-4" />
          <span className="text-sm">Add new group</span>
        </Button>
      </div>
    </div>
  );
}

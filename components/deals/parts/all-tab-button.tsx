"use client";

import * as React from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Search, GripVertical, Pin } from "lucide-react";

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
  useSortable,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type AllTabItem = { id: string; label: string; pinned?: boolean };

export function AllTabButton({
  onOpen, // unchanged (kept for compatibility if you add "Add" section later)
  onActivate, // 👈 click an item to activate that tab
  className,
  items, // current tabs (including duplicates)
  onReorder, // push new order back to DealsTabs
}: {
  onOpen: (label: string) => void;
  onActivate: (id: string) => void;
  className?: string;
  items: AllTabItem[];
  onReorder: (ids: string[]) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [q, setQ] = React.useState("");

  // mirror the incoming list for local drag
  const [order, setOrder] = React.useState<AllTabItem[]>(items);
  React.useEffect(() => setOrder(items), [items]);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, {
      pressDelay: 150,
      activationConstraint: { distance: 5 },
    })
  );

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;

    const ids = order.map((t) => t.id);
    const oldIndex = ids.indexOf(String(active.id));
    const newIndex = ids.indexOf(String(over.id));
    if (oldIndex < 0 || newIndex < 0) return;

    const next = arrayMove(order, oldIndex, newIndex);
    setOrder(next);
    onReorder(next.map((t) => t.id));
  };

  // filter + duplicate numbering for display
  const filtered = React.useMemo(() => {
    const s = q.trim().toLowerCase();
    return s ? order.filter((t) => t.label.toLowerCase().includes(s)) : order;
  }, [q, order]);

  const numbered = React.useMemo(() => {
    const seen: Record<string, number> = {};
    return filtered.map((t) => {
      const n = (seen[t.label] = (seen[t.label] ?? 0) + 1);
      return { ...t, display: n > 1 ? `${t.label} ${n}` : t.label };
    });
  }, [filtered]);

  // split pinned vs others for the visual grouping
  const pinnedList = numbered.filter((t) => t.pinned);
  const otherList = numbered.filter((t) => !t.pinned);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {/* look like a tab, no underline */}
        <button
          type="button"
          aria-haspopup="menu"
          className={`
            relative inline-flex items-center justify-center
            rounded-md bg-transparent
            px-7 pb-2 pt-2 text-sm font-medium
            text-foreground/80 hover:bg-muted/40 hover:text-foreground
            transition-colors
            ${className ?? ""}
          `}
        >
          <span className="flex items-center gap-1">
            All <span className="text-md">▾</span>
          </span>
        </button>
      </PopoverTrigger>

      <PopoverContent className="w-[320px] p-3" align="start" sideOffset={8}>
        {/* search */}
        <div className="relative">
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search view"
            className="pr-9"
          />
          <Search className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 opacity-60" />
        </div>

        {/* PINNED */}
        {pinnedList.length > 0 && (
          <>
            <div className="mt-3 mb-2 text-xs font-medium text-muted-foreground">
              Pinned
            </div>
            <DndContext sensors={sensors} onDragEnd={onDragEnd}>
              <ScrollArea className="max-h-[180px]">
                <SortableContext
                  items={pinnedList.map((t) => t.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <ul className="space-y-1">
                    {pinnedList.map((t) => (
                      <SortableRow
                        key={t.id}
                        id={t.id}
                        label={t.display}
                        pinned
                        onActivate={() => {
                          onActivate(t.id);
                          setOpen(false);
                        }}
                      />
                    ))}
                  </ul>
                </SortableContext>
              </ScrollArea>
            </DndContext>
            <Separator className="my-3" />
          </>
        )}

        {/* OTHERS */}
        <DndContext sensors={sensors} onDragEnd={onDragEnd}>
          <ScrollArea className="max-h-[360px]">
            <SortableContext
              items={otherList.map((t) => t.id)}
              strategy={verticalListSortingStrategy}
            >
              <ul className="space-y-1">
                {otherList.map((t) => (
                  <SortableRow
                    key={t.id}
                    id={t.id}
                    label={t.display}
                    onActivate={() => {
                      onActivate(t.id);
                      setOpen(false);
                    }}
                  />
                ))}
                {pinnedList.length === 0 && otherList.length === 0 && (
                  <li className="px-2 py-6 text-center text-sm text-muted-foreground">
                    No results
                  </li>
                )}
              </ul>
            </SortableContext>
          </ScrollArea>
        </DndContext>
      </PopoverContent>
    </Popover>
  );
}

function SortableRow({
  id,
  label,
  pinned = false,
  onActivate,
}: {
  id: string;
  label: string;
  pinned?: boolean;
  onActivate: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className="relative group"
      {...attributes}
    >
      <button
        type="button"
        onClick={onActivate}
        className={`flex w-full items-center rounded-md pr-2 pl-8 py-1.5 text-left
          ${isDragging ? "bg-muted/60" : "hover:bg-muted/40"}`}
      >
        {/* leading icons */}
        <span className="mr-2 inline-flex w-4 justify-center">
          {pinned ? <Pin className="h-4 w-4 opacity-80" /> : null}
        </span>
        <span className="text-sm">{label}</span>
      </button>

      {/* left grab handle (on hover/focus/drag) */}
      <button
        ref={setActivatorNodeRef}
        {...listeners}
        aria-label="Drag"
        onClick={(e) => e.preventDefault()}
        className={`absolute left-2 top-1/2 -translate-y-1/2 inline-flex h-5 w-5
                    items-center justify-center rounded
                    cursor-grab active:cursor-grabbing transition-opacity
                    ${
                      isDragging
                        ? "opacity-100"
                        : "opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
                    }`}
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </button>
    </li>
  );
}

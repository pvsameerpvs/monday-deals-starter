// components/reports/ChartView.tsx
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
  rectSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from "recharts";

import { Grip, Filter, MoreHorizontal, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";

/* ───────────────────────────────────────────────────────────────
  Types & constants
──────────────────────────────────────────────────────────────── */
type WidgetKind = "chart" | "numbers" | "gauge" | "activity" | "battery";
type Widget = {
  id: string;
  kind: WidgetKind;
  title: string;
  w: number; // 1..12 (12-col grid)
  h: number; // 1..12 (row spans)
};

const uid = () => Math.random().toString(36).slice(2, 9);
const GRID_COLS = 12;
const ROW_HEIGHT = 120;
const MIN_W = 2;
const MIN_H = 2;

const clamp = (n: number, a: number, b: number) => Math.max(a, Math.min(b, n));

/* ───────────────────────────────────────────────────────────────
  Widget library (menu)
──────────────────────────────────────────────────────────────── */
const LIB: { kind: WidgetKind; title: string; desc: string }[] = [
  { kind: "gauge", title: "Gauge", desc: "Track target vs actual" },
  { kind: "activity", title: "Activity tracker", desc: "Key sales activities" },
  { kind: "chart", title: "Chart", desc: "Visualize your data" },
  { kind: "numbers", title: "Numbers", desc: "Quick sums & counts" },
  { kind: "battery", title: "Battery", desc: "Progress at a glance" },
];

/* ───────────────────────────────────────────────────────────────
  Tiny visual widgets
──────────────────────────────────────────────────────────────── */
function ChartWidget() {
  const data = [
    { name: "Negotiation", count: 1 },
    { name: "Discovery", count: 2 },
    { name: "New", count: 4 },
  ];
  return (
    <div className="h-[360px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis allowDecimals={false} />
          <Tooltip
            cursor={{ fillOpacity: 0.06 }}
            contentStyle={{ borderRadius: 8, padding: "8px 10px" }}
          />
          <Bar dataKey="count" radius={[6, 6, 0, 0]}>
            <LabelList dataKey="count" position="top" />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function NumbersWidget() {
  return (
    <div className="grid h-[200px] place-items-center">
      <div className="text-6xl font-semibold">$0</div>
    </div>
  );
}
function GaugeWidget() {
  return (
    <div className="flex h-[260px] flex-col items-center justify-center">
      <div className="relative h-44 w-80 overflow-hidden">
        <div className="absolute inset-x-0 bottom-0 h-36 rounded-b-[90px] bg-gray-200" />
        <div className="absolute left-1/2 top-[70%] h-1 w-64 -translate-x-1/2 origin-left rotate-[6deg] rounded bg-black" />
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
function ActivityWidget() {
  return (
    <div className="space-y-2">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex gap-2">
          {[...Array(10)].map((__, j) => (
            <span
              key={j}
              className="h-2 flex-1 rounded bg-muted"
              style={{ opacity: (j + 3) % 4 === 0 ? 0.4 : 1 }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
function BatteryWidget() {
  return (
    <div className="grid h-[160px] place-items-center">
      <div className="relative h-10 w-64 rounded-md border">
        <div className="absolute inset-y-1 left-1 right-8 rounded bg-emerald-600/20" />
        <div className="absolute inset-y-1 left-1 w-1/3 rounded bg-emerald-600" />
        <div className="absolute right-1 top-1/2 h-6 w-2 -translate-y-1/2 rounded bg-foreground/40" />
      </div>
    </div>
  );
}

const RENDER: Record<WidgetKind, React.FC> = {
  chart: ChartWidget,
  numbers: NumbersWidget,
  gauge: GaugeWidget,
  activity: ActivityWidget,
  battery: BatteryWidget,
};

/* ───────────────────────────────────────────────────────────────
  Sortable + Resizable card (custom, no packages)
──────────────────────────────────────────────────────────────── */
function SortableResizableCard({
  widget,
  children,
  onResize,
  onRemove,
  onRename,
}: {
  widget: Widget;
  children: React.ReactNode;
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

  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState(title);
  React.useEffect(() => setDraft(title), [title]);

  // bottom-right resize (pointer math → grid spans)
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
        Math.round(start.current.h + dy / ROW_HEIGHT),
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
      className={[
        "group relative rounded-xl border bg-white shadow-sm",
        "outline outline-0 outline-cyan-600/60",
        isDragging ? "opacity-80" : "",
      ].join(" ")}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2 rounded-t-xl border-b px-3 py-2">
        <div className="flex items-center gap-2">
          <button
            {...listeners}
            {...attributes}
            aria-label="Drag widget"
            className="drag-handle grid h-7 w-7 place-items-center rounded hover:bg-muted/50 cursor-grab active:cursor-grabbing"
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
              className="w-[20ch] rounded border px-1 py-0.5 text-[14px] outline-none"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={() => {
                const t = draft.trim();
                if (t && t !== title) onRename(id, t);
                setEditing(false);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter")
                  (e.currentTarget as HTMLInputElement).blur();
                if (e.key === "Escape") setEditing(false);
              }}
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

      {/* Hover wedge */}
      <span
        aria-hidden
        className="pointer-events-none absolute right-0 top-0 h-0 w-0 opacity-0 transition-opacity duration-150 border-t-[12px] border-r-[12px] border-t-cyan-700 border-r-transparent rounded-tr-[6px] group-hover:opacity-100"
      />

      {/* Body */}
      <div className="p-4">{children}</div>

      {/* Resize handle */}
      <div
        onPointerDown={onPointerDown}
        title="Drag to resize"
        role="separator"
        aria-orientation="horizontal"
        className="absolute bottom-0 right-0 h-4 w-4 cursor-nwse-resize after:absolute after:inset-0 after:m-auto after:h-3 after:w-3 after:rounded-sm after:border-b-2 after:border-r-2 after:border-gray-400 after:content-['']"
      />
    </div>
  );
}

/* ───────────────────────────────────────────────────────────────
  Add widget menu
──────────────────────────────────────────────────────────────── */
function AddWidgetMenu({ onSelect }: { onSelect: (kind: WidgetKind) => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="gap-2 bg-[var(--primary-hover-color,#007c89)] hover:bg-[var(--primary-hover-color,#007c89)]/90">
          <Plus className="h-4 w-4" />
          Add widget
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        {LIB.map((w) => (
          <DropdownMenuItem
            key={w.kind}
            className="flex items-start gap-3 py-3"
            onClick={() => onSelect(w.kind)}
          >
            <span className="mt-0.5 inline-block h-8 w-8 rounded-md bg-muted" />
            <span>
              <div className="text-[14px] font-medium">{w.title}</div>
              <div className="text-xs text-muted-foreground">{w.desc}</div>
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/* ───────────────────────────────────────────────────────────────
  Main
──────────────────────────────────────────────────────────────── */
export default function ChartView() {
  const [widgets, setWidgets] = React.useState<Widget[]>([
    { id: uid(), kind: "chart", title: "Chart", w: 8, h: 4 },
  ]);

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
    const ids = widgets.map((w) => w.id);
    const oldIndex = ids.indexOf(String(active.id));
    const newIndex = ids.indexOf(String(over.id));
    if (oldIndex < 0 || newIndex < 0) return;
    setWidgets((w) => arrayMove(w, oldIndex, newIndex));
  };

  const resize = (id: string, w: number, h: number) =>
    setWidgets((list) =>
      list.map((x) =>
        x.id === id
          ? { ...x, w: clamp(w, MIN_W, GRID_COLS), h: clamp(h, MIN_H, 12) }
          : x
      )
    );

  const remove = (id: string) =>
    setWidgets((list) => list.filter((x) => x.id !== id));
  const rename = (id: string, title: string) =>
    setWidgets((list) => list.map((x) => (x.id === id ? { ...x, title } : x)));

  const addWidget = (kind: WidgetKind) => {
    const defaults: Record<WidgetKind, Partial<Widget>> = {
      chart: { w: 6, h: 4, title: "Chart" },
      numbers: { w: 3, h: 3, title: "Numbers" },
      gauge: { w: 6, h: 5, title: "Gauge" },
      activity: { w: 6, h: 4, title: "Activity" },
      battery: { w: 4, h: 3, title: "Battery" },
    };
    const d = defaults[kind];
    setWidgets((list) => [
      ...list,
      { id: uid(), kind, title: d.title!, w: d.w!, h: d.h! },
    ]);
  };

  return (
    <div className="space-y-3 p-3">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          This dashboard has {widgets.length}/30 widgets
        </div>
        <AddWidgetMenu onSelect={addWidget} />
      </div>

      {/* Grid canvas (12 cols; row = 120px). Drag+resize fully custom */}
      <DndContext sensors={sensors} onDragEnd={onDragEnd}>
        <SortableContext
          items={widgets.map((w) => w.id)}
          strategy={rectSortingStrategy}
        >
          <div
            data-grid
            className="
              grid gap-4
              grid-cols-12
              auto-rows-[120px]  /* must match ROW_HEIGHT */
            "
          >
            {widgets.map((w) => {
              const R = RENDER[w.kind];
              return (
                <SortableResizableCard
                  key={w.id}
                  widget={w}
                  onResize={resize}
                  onRemove={remove}
                  onRename={rename}
                >
                  <R />
                </SortableResizableCard>
              );
            })}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}

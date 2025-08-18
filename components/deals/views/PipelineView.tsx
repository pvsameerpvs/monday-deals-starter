// components/pipeline/PipelineView.tsx
"use client";

import * as React from "react";
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCenter,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  arrayMove,
  verticalListSortingStrategy,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Plus, MoreHorizontal, Grip, MessageCircle, Table } from "lucide-react";

type Deal = {
  id: string;
  title: string;
  amount?: number;
  owner?: string;
};

type Column = {
  id: string;
  title: string;
  color: string; // header color
  deals: Deal[];
};

const currency = (n = 0) =>
  `$${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

/* ------------------------------ INITIAL DATA ------------------------------ */
const initial: Column[] = [
  {
    id: "discovery",
    title: "Discovery",
    color: "#79B8FF",
    deals: [
      {
        id: uid("d"),
        title: "Google deal",
        amount: 70000,
        owner: "Steven Scott",
      },
      { id: uid("d"), title: "Apple deal", amount: 55000, owner: "Sam Jones" },
    ],
  },
  {
    id: "new",
    title: "New",
    color: "#7A6CF3",
    deals: [{ id: uid("d"), title: "hh" }],
  },
  {
    id: "proposal",
    title: "Proposal",
    color: "#6DD3FF",
    deals: [
      {
        id: uid("d"),
        title: "Amazon deal",
        amount: 100000,
        owner: "Robert Thompson",
      },
    ],
  },
  {
    id: "negotiation",
    title: "Negotiation",
    color: "#63E0D2",
    deals: [],
  },
  {
    id: "won",
    title: "Won",
    color: "#2AD19A",
    deals: [
      {
        id: uid("d"),
        title: "Amazon deal",
        amount: 55000,
        owner: "Robert Thompson",
      },
      { id: uid("d"), title: "Apple deal", amount: 30000 },
    ],
  },
];

/* --------------------------------- HOOKS --------------------------------- */
function useDroppableArea(id: string, data?: any) {
  const { setNodeRef } = useDroppable({ id, data });
  return setNodeRef;
}

/* --------------------------- SORTABLE BUILDING BLOCKS --------------------------- */
function SortableColumn({
  column,
  children,
}: {
  column: Column;
  children: React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: column.id,
      data: { type: "column" },
    });

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="w-[320px] shrink-0">
      {/* Header */}
      <div
        className="rounded-t-lg px-4 py-3 text-white flex items-center justify-between"
        style={{ backgroundColor: column.color }}
        aria-label="Drag column"
        {...attributes}
        {...listeners}
      >
        <div className="flex items-center gap-2">
          <div className="font-semibold">{column.title}</div>
          <span className="ml-1 text-sm opacity-90">{column.deals.length}</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            aria-label="Add deal"
            className="rounded p-1/2 opacity-90 hover:opacity-100"
          >
            <Plus className="h-4 w-4" />
          </button>
          <button
            aria-label="Column menu"
            className="rounded p-1/2 opacity-90 hover:opacity-100"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Sum row */}
      <div className="border-b rounded-b-none rounded-t-none border-x bg-white">
        <div className="px-4 py-2">
          <div className="text-lg font-semibold leading-none">
            {currency(column.deals.reduce((a, d) => a + (d.amount ?? 0), 0))}
          </div>
          <div className="text-xs text-gray-500">sum</div>
        </div>
      </div>

      {/* Body */}
      <div className="rounded-b-xl border border-t-0 bg-[#f7f9fd] p-3">
        {children}
      </div>
    </div>
  );
}

function SortableDeal({ deal, columnId }: { deal: Deal; columnId: string }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: deal.id,
    data: { type: "deal", columnId },
  });

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        group mb-3 rounded-xl border bg-white p-4 shadow-sm
        ${isDragging ? "opacity-70" : ""}
      `}
      {...attributes}
      {...listeners}
    >
      <div className="text-[15px] font-medium">{deal.title}</div>

      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {deal.amount != null && (
            <span className="rounded-md border bg-gray-50 px-2 py-0.5 text-sm">
              {deal.amount.toLocaleString("en-US")}
            </span>
          )}
          {deal.owner && (
            <span className="rounded-md bg-[#dff1f1] px-2 py-0.5 text-sm">
              {deal.owner}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 text-gray-400">
          <MessageCircle className="h-4 w-4" />
          <Table className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
}

/* -------------------------------- MAIN VIEW -------------------------------- */
export default function PipelineView() {
  const [cols, setCols] = React.useState<Column[]>(initial);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 120, tolerance: 8 },
    })
  );

  // Helpful maps for lookups
  const columnIds = React.useMemo(() => cols.map((c) => c.id), [cols]);
  const cardIdToColumn = React.useCallback(
    (dealId: string) =>
      cols.find((c) => c.deals.some((d) => d.id === dealId))?.id,
    [cols]
  );

  // Drag overlay state (optional polish)
  const [activeType, setActiveType] = React.useState<"deal" | "column" | null>(
    null
  );

  const onDragStart = (e: DragStartEvent) => {
    setActiveType((e.active.data.current as any)?.type ?? null);
  };

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    setActiveType(null);
    if (!over) return;

    const aData = active.data.current as any;
    const oData = over.data.current as any;

    // Reorder columns
    if (aData?.type === "column" && oData?.type === "column") {
      const oldIndex = cols.findIndex((c) => c.id === active.id);
      const newIndex = cols.findIndex((c) => c.id === over.id);
      if (oldIndex !== newIndex)
        setCols((prev) => arrayMove(prev, oldIndex, newIndex));
      return;
    }

    // Move/reorder deals
    if (aData?.type === "deal") {
      const fromColId: string | undefined =
        aData.columnId ?? cardIdToColumn(String(active.id));
      if (!fromColId) return;

      // Drop target could be: another deal OR a column body (we attach droppable to the body)
      let toColId =
        oData?.columnId ?? cardIdToColumn(String(over.id)) ?? oData?.id;

      // If dropping on the column header/box, ensure we resolve to that column
      if (oData?.type === "column") toColId = oData.id;

      if (!toColId) return;

      setCols((prev) => {
        const next = prev.map((c) => ({ ...c, deals: [...c.deals] }));
        const fromCol = next.find((c) => c.id === fromColId)!;
        const toCol = next.find((c) => c.id === toColId)!;

        const dealIndex = fromCol.deals.findIndex((d) => d.id === active.id);
        const [moved] = fromCol.deals.splice(dealIndex, 1);

        // If dropping over a specific deal, insert before it; else push to end
        const overIndex = toCol.deals.findIndex((d) => d.id === over.id) ?? -1;
        if (overIndex >= 0) {
          toCol.deals.splice(overIndex, 0, moved);
        } else {
          toCol.deals.push(moved);
        }
        return next;
      });
    }
  };

  return (
    <div className="p-4">
      <DndContext
        sensors={sensors}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        collisionDetection={closestCenter}
      >
        {/* Horizontal columns */}
        <SortableContext
          items={columnIds}
          strategy={horizontalListSortingStrategy}
        >
          <div className="flex gap-5 overflow-x-auto pb-6">
            {cols.map((col) => (
              <ColumnView key={col.id} column={col} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}

/* ------------------------------- COLUMN VIEW ------------------------------- */
function ColumnView({ column }: { column: Column }) {
  // Make the whole column body a droppable target for cards
  const setDropRef = useDroppableArea(`drop-${column.id}`, {
    type: "column",
    id: column.id,
    columnId: column.id,
  });

  return (
    <SortableColumn column={column}>
      <SortableContext
        items={column.deals.map((d) => d.id)}
        strategy={verticalListSortingStrategy}
      >
        <div ref={setDropRef}>
          {column.deals.length === 0 && (
            <div className="mb-3 text-sm text-gray-500">+ Add deal</div>
          )}
          {column.deals.map((deal) => (
            <SortableDeal key={deal.id} deal={deal} columnId={column.id} />
          ))}
        </div>
      </SortableContext>
    </SortableColumn>
  );
}

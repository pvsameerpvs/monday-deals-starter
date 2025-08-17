// components/kanban/KanbanView.tsx
// or app/(whatever)/KanbanView.tsx
"use client";

import * as React from "react";
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverEvent,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  arrayMove,
  verticalListSortingStrategy,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  MoreHorizontal,
  Plus,
  GripVertical,
  MessageSquare,
  ListTodo,
} from "lucide-react";

/* ───────────────────────────────────────────────────────────────
   Types & helpers
──────────────────────────────────────────────────────────────── */
type Task = { id: string; title: string };
type Card = { id: string; title: string; status: string; tasks: Task[] };
type Column = { id: string; title: string; color: string; cards: Card[] };

const uid = () => Math.random().toString(36).slice(2, 9);

// id helpers
const cid = (id: string) => `col:${id}`;
const kid = (id: string) => `card:${id}`;
const tid = (id: string) => `task:${id}`;
const cardContainer = (cardId: string) => `tasks:${cardId}`;
const columnContainer = (colId: string) => `cards:${colId}`;

const getType = (id: string) =>
  id.startsWith("col:")
    ? "column"
    : id.startsWith("card:")
    ? "card"
    : id.startsWith("task:")
    ? "task"
    : id.startsWith("cards:")
    ? "cards-container"
    : id.startsWith("tasks:")
    ? "tasks-container"
    : "unknown";

/* ───────────────────────────────────────────────────────────────
   Initial data (like your screenshots)
──────────────────────────────────────────────────────────────── */
const STAGES: Column[] = [
  {
    id: "new",
    title: "New",
    color: "#6b6cf6",
    cards: [
      {
        id: uid(),
        title: "New deal",
        status: "New",
        tasks: [
          { id: uid(), title: "Discovery call" },
          { id: uid(), title: "Qualify lead" },
        ],
      },
      { id: uid(), title: "New deal", status: "New", tasks: [] },
      { id: uid(), title: "New deal", status: "New", tasks: [] },
    ],
  },
  {
    id: "blank",
    title: "Blank",
    color: "#7a7a86",
    cards: Array.from({ length: 8 }).map(() => ({
      id: uid(),
      title: "New deal",
      status: "New",
      tasks: [],
    })),
  },
  {
    id: "discovery",
    title: "Discovery",
    color: "#90b6ff",
    cards: [
      {
        id: uid(),
        title: "New deal",
        status: "Discovery",
        tasks: [{ id: uid(), title: "Book demo" }],
      },
    ],
  },
  { id: "proposal", title: "Proposal", color: "#4db3ff", cards: [] },
  {
    id: "negotiation",
    title: "Negotiation",
    color: "#6ad1c9",
    cards: [
      {
        id: uid(),
        title: "New Deal",
        status: "Negotiation",
        tasks: [
          { id: uid(), title: "Counter-offer" },
          { id: uid(), title: "Legal review" },
        ],
      },
    ],
  },
  { id: "won", title: "Won", color: "#2ecc71", cards: [] },
  { id: "lost", title: "Lost", color: "#e85a71", cards: [] },
];

/* ───────────────────────────────────────────────────────────────
   DnD building blocks
──────────────────────────────────────────────────────────────── */
function DroppableArea({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  const { setNodeRef } = useDroppable({ id });
  return (
    <div ref={setNodeRef} data-area={id} className="min-h-[8px]">
      {children}
    </div>
  );
}

function SortableShell({
  id,
  className,
  children,
  style,
}: {
  id: string;
  className?: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });
  const inline = {
    transform: CSS.Transform.toString(transform),
    transition,
    ...style,
  };
  return (
    <div
      ref={setNodeRef}
      style={inline}
      className={className}
      {...attributes}
      {...listeners}
    >
      {children}
    </div>
  );
}

/* ───────────────────────────────────────────────────────────────
   Visual atoms (task, card, column)
──────────────────────────────────────────────────────────────── */
function TaskItem({ task }: { task: Task }) {
  return (
    <SortableShell id={tid(task.id)} className="group">
      <div className="flex items-center gap-2 rounded-md border px-2 py-1.5 bg-white">
        <GripVertical className="h-4 w-4 shrink-0 text-gray-400" />
        <div className="text-[13px]">{task.title}</div>
      </div>
    </SortableShell>
  );
}

function CardItem({ card, accent }: { card: Card; accent: string }) {
  return (
    <SortableShell id={kid(card.id)}>
      <div className="rounded-xl border bg-white p-3 shadow-sm">
        <div className="mb-3 flex items-start justify-between">
          <div>
            <div className="text-[15px] font-semibold leading-tight">
              {card.title}
            </div>
            <div className="mt-2 inline-flex items-center gap-2 rounded-md bg-gray-100 px-2 py-1 text-[12px]">
              <span
                className="h-4 w-1.5 rounded-sm"
                style={{ background: accent }}
                aria-hidden
              />
              {card.status}
            </div>
          </div>
          <div className="pt-1 text-gray-400">
            <MessageSquare className="mr-3 inline-block h-4 w-4" />
            <ListTodo className="inline-block h-4 w-4" />
          </div>
        </div>

        {/* Tasks (sortable within/across cards) */}
        <DroppableArea id={cardContainer(card.id)}>
          <SortableContext
            id={cardContainer(card.id)}
            items={card.tasks.map((t) => tid(t.id))}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {card.tasks.map((t) => (
                <TaskItem key={t.id} task={t} />
              ))}
            </div>
          </SortableContext>
        </DroppableArea>
      </div>
    </SortableShell>
  );
}

/* ───────────────────────────────────────────────────────────────
   Main component
   - Inline composer for “+ Add deal”
──────────────────────────────────────────────────────────────── */
export default function KanbanView() {
  const [cols, setCols] = React.useState<Column[]>(STAGES);

  // inline composer state
  const [composer, setComposer] = React.useState<{
    colId: string | null;
    value: string;
  }>({
    colId: null,
    value: "",
  });

  const openComposer = (colId: string) => setComposer({ colId, value: "" });
  const cancelComposer = () => setComposer({ colId: null, value: "" });
  const submitComposer = () => {
    if (!composer.colId) return cancelComposer();
    const title = composer.value.trim();
    if (!title) return cancelComposer();

    setCols((prev) => {
      const next = structuredClone(prev) as Column[];
      const col = next.find((c) => c.id === composer.colId)!;
      col.cards.push({ id: uid(), title, status: col.title, tasks: [] }); // append to bottom
      return next;
    });
    cancelComposer();
  };

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, {
      pressDelay: 120,
      activationConstraint: { distance: 6 },
    })
  );

  const colIds = cols.map((c) => cid(c.id));

  // helpers to find locations
  const findCard = (cardId: string) => {
    for (const col of cols) {
      const idx = col.cards.findIndex((c) => kid(c.id) === cardId);
      if (idx !== -1) return { colId: col.id, col, index: idx };
    }
    return null;
  };

  const findTask = (taskId: string) => {
    for (const col of cols) {
      for (const card of col.cards) {
        const idx = card.tasks.findIndex((t) => tid(t.id) === taskId);
        if (idx !== -1)
          return { colId: col.id, cardId: card.id, card, index: idx };
      }
    }
    return null;
  };

  const onDragStart = (_e: DragStartEvent) => {};

  const onDragOver = (e: DragOverEvent) => {
    const { active, over } = e;
    if (!over) return;
    const aType = getType(String(active.id));
    const oType = getType(String(over.id));

    // Move CARD across columns
    if (aType === "card" && (oType === "card" || oType === "cards-container")) {
      setCols((prev) => {
        const src = findCard(String(active.id));
        if (!src) return prev;
        const next = structuredClone(prev) as Column[];
        const srcCol = next.find((c) => c.id === src.colId)!;
        const [moved] = srcCol.cards.splice(src.index, 1);

        if (oType === "card") {
          const tgt = findCard(String(over.id))!;
          const tgtCol = next.find((c) => c.id === tgt.colId)!;
          tgtCol.cards.splice(tgt.index, 0, moved);
        } else {
          const tgtColId = String(over.id).split(":")[1];
          const tgtCol = next.find((c) => c.id === tgtColId)!;
          tgtCol.cards.push(moved);
        }
        return next;
      });
    }

    // Move TASK across cards
    if (aType === "task" && (oType === "task" || oType === "tasks-container")) {
      setCols((prev) => {
        const src = findTask(String(active.id));
        if (!src) return prev;
        const next = structuredClone(prev) as Column[];

        const srcCol = next.find((c) => c.id === src.colId)!;
        const srcCard = srcCol.cards.find((c) => c.id === src.cardId)!;
        const [moved] = srcCard.tasks.splice(src.index, 1);

        if (oType === "task") {
          const tgt = findTask(String(over.id))!;
          const tgtCol = next.find((c) => c.id === tgt.colId)!;
          const tgtCard = tgtCol.cards.find((c) => c.id === tgt.cardId)!;
          tgtCard.tasks.splice(tgt.index, 0, moved);
        } else {
          const toCardId = String(over.id).split(":")[1];
          for (const c of next) {
            const card = c.cards.find((x) => x.id === toCardId);
            if (card) {
              card.tasks.push(moved);
              break;
            }
          }
        }
        return next;
      });
    }
  };

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over) return;
    const aType = getType(String(active.id));
    const oType = getType(String(over.id));

    // Reorder columns
    if (aType === "column" && oType === "column") {
      const oldIndex = colIds.indexOf(String(active.id));
      const newIndex = colIds.indexOf(String(over.id));
      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        setCols((prev) => arrayMove(prev, oldIndex, newIndex));
      }
      return;
    }

    // Reorder cards within same column
    if (aType === "card" && oType === "card") {
      const src = findCard(String(active.id));
      const tgt = findCard(String(over.id));
      if (!src || !tgt || src.colId !== tgt.colId) return;
      setCols((prev) => {
        const next = structuredClone(prev) as Column[];
        const col = next.find((c) => c.id === src.colId)!;
        col.cards = arrayMove(col.cards, src.index, tgt.index);
        return next;
      });
      return;
    }

    // Reorder tasks within same card
    if (aType === "task" && oType === "task") {
      const src = findTask(String(active.id));
      const tgt = findTask(String(over.id));
      if (!src || !tgt || src.cardId !== tgt.cardId) return;
      setCols((prev) => {
        const next = structuredClone(prev) as Column[];
        const col = next.find((c) => c.id === src.colId)!;
        const card = col.cards.find((c) => c.id === src.cardId)!;
        card.tasks = arrayMove(card.tasks, src.index, tgt.index);
        return next;
      });
    }
  };

  return (
    <div className="h-[calc(100vh-80px)] w-full p-3">
      {/* Horizontal scroll container */}
      <div className="flex h-full gap-2 overflow-x-auto pb-3">
        <DndContext
          sensors={sensors}
          onDragStart={onDragStart}
          onDragOver={onDragOver}
          onDragEnd={onDragEnd}
        >
          {/* Columns (sortable horizontally) */}
          <SortableContext
            items={colIds}
            strategy={horizontalListSortingStrategy}
          >
            {cols.map((c) => (
              <SortableShell
                key={cid(c.id)}
                id={cid(c.id)}
                className="w-[340px] shrink-0"
              >
                <div className="mx-2 flex h-[calc(100vh-140px)] flex-col rounded-2xl bg-[#f7f8fb]">
                  {/* Header */}
                  <div
                    className="flex items-center justify-between rounded-t-2xl px-4 py-3 text-white"
                    style={{ background: c.color }}
                  >
                    <div className="flex items-center gap-2 text-[16px] font-semibold">
                      {c.title}{" "}
                      <span className="opacity-90">{c.cards.length}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <MoreHorizontal className="h-5 w-5 opacity-90" />
                      <button
                        onClick={() => openComposer(c.id)}
                        aria-label="Add deal"
                      >
                        <Plus className="h-5 w-5 opacity-90" />
                      </button>
                    </div>
                  </div>

                  {/* Cards list */}
                  <div className="flex-1 space-y-3 overflow-y-auto px-3 py-3">
                    <DroppableArea id={columnContainer(c.id)}>
                      <SortableContext
                        id={columnContainer(c.id)}
                        items={c.cards.map((card) => kid(card.id))}
                        strategy={verticalListSortingStrategy}
                      >
                        {c.cards.map((card) => (
                          <CardItem
                            key={card.id}
                            card={card}
                            accent={c.color}
                          />
                        ))}
                      </SortableContext>
                    </DroppableArea>

                    {/* Inline composer */}
                    {composer.colId === c.id ? (
                      <div className="rounded-xl border bg-white p-3 shadow-sm">
                        <input
                          autoFocus
                          className="w-full rounded-md border px-3 py-2 text-sm outline-none"
                          placeholder="New deal title…"
                          value={composer.value}
                          onChange={(e) =>
                            setComposer((d) => ({
                              ...d,
                              value: e.target.value,
                            }))
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") submitComposer();
                            if (e.key === "Escape") cancelComposer();
                          }}
                          onBlur={submitComposer} // create on blur if filled
                        />
                      </div>
                    ) : (
                      <button
                        onClick={() => openComposer(c.id)}
                        className="mb-2 mt-2 text-left text-[14px] font-medium text-gray-500 hover:text-gray-700"
                      >
                        + Add deal
                      </button>
                    )}
                  </div>
                </div>
              </SortableShell>
            ))}
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}

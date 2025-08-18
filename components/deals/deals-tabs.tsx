"use client";

import { useMemo, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AddMenu } from "./parts/add-menu";

import { VIEW_REGISTRY } from "./parts/view-registry";

import PipelineView from "@/components/deals/views/PipelineView";
import { AllTabButton } from "./parts/all-tab-button";
import { TabKebab } from "./parts/tab-kebab";
import { CardContent } from "../ui/card";

import {
  DndContext,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  arrayMove,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { DealsToolbar } from "./deals-toolbar";
import { Pin } from "lucide-react";
import { MainTable } from "./parts/main-table/MainTable";
import SalesReportView from "./reports/ sales-report/SalesReportView";
import KanbanView from "./views/KanbanView";

type TabItem = { id: string; label: string; content?: React.ReactNode };

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const SHOW_ALL_AT = 6;

export function DealsTabs() {
  const baseTabs: TabItem[] = useMemo(
    () => [
      { id: "main", label: "Main table", content: <MainTable /> },
      { id: "sales", label: "Sales report", content: <SalesReportView /> },
      { id: "Kanban", label: "Kanban", content: <KanbanView /> },
      { id: "Pipeline", label: "Pipeline", content: <PipelineView /> },
    ],
    []
  );

  const [tabs, setTabs] = useState<TabItem[]>(baseTabs);
  const [active, setActive] = useState<string>(baseTabs[0].id);
  const [pinned, setPinned] = useState<Set<string>>(new Set());

  // --- inline rename state ---
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<string>("");

  const startRename = (id: string, current: string) => {
    setEditingId(id);
    setDraft(current);
    setActive(id);
  };
  const commitRename = () => {
    if (!editingId) return;
    const next = draft.trim();
    if (next) {
      setTabs((prev) =>
        prev.map((t) => (t.id === editingId ? { ...t, label: next } : t))
      );
    }
    setEditingId(null);
    setDraft("");
  };
  const cancelRename = () => {
    setEditingId(null);
    setDraft("");
  };

  // ---- helpers ----
  const slugUnique = (base: string) => {
    let id = base;
    let i = 2;
    const ids = new Set(tabs.map((t) => t.id));
    while (ids.has(id)) id = `${base}-${i++}`;
    return id;
  };

  const openView = (label: string) => {
    const id = slugUnique(slugify(label));
    const Comp = VIEW_REGISTRY[label];
    setTabs((prev) => [
      ...prev,
      { id, label, content: Comp ? <Comp /> : null },
    ]);
    setActive(id);
  };

  const onAdd = (label: string) => openView(label);

  const pinnedTabs = tabs.filter((t) => pinned.has(t.id));
  const regularTabs = tabs.filter((t) => !pinned.has(t.id));

  const togglePin = (id: string) => {
    setPinned((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else {
        next.add(id);
        setTabs((prevTabs) => {
          const idx = prevTabs.findIndex((t) => t.id === id);
          if (idx <= 0) return prevTabs;
          const moved = [...prevTabs];
          const [tab] = moved.splice(idx, 1);
          moved.unshift(tab);
          return moved;
        });
      }
      return next;
    });
  };

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, {
      pressDelay: 150,
      activationConstraint: { distance: 5 },
    })
  );

  const onDragEnd = (e: DragEndEvent) => {
    const { active: a, over } = e;
    if (!over || a.id === over.id) return;

    const aPinned = pinned.has(String(a.id));
    const bPinned = pinned.has(String(over.id));
    if (aPinned !== bPinned) return;

    if (aPinned) {
      const ids = pinnedTabs.map((t) => t.id);
      const oldIndex = ids.indexOf(String(a.id));
      const newIndex = ids.indexOf(String(over.id));
      if (oldIndex === -1 || newIndex === -1) return;
      const newPinnedOrder = arrayMove(ids, oldIndex, newIndex);
      const byId = new Map(tabs.map((t) => [t.id, t]));
      const newOrderIds = [...newPinnedOrder, ...regularTabs.map((t) => t.id)];
      setTabs(newOrderIds.map((id) => byId.get(id)!));
    } else {
      const ids = regularTabs.map((t) => t.id);
      const oldIndex = ids.indexOf(String(a.id));
      const newIndex = ids.indexOf(String(over.id));
      if (oldIndex === -1 || newIndex === -1) return;
      const newRegularOrder = arrayMove(ids, oldIndex, newIndex);
      const byId = new Map(tabs.map((t) => [t.id, t]));
      const newOrderIds = [...pinnedTabs.map((t) => t.id), ...newRegularOrder];
      setTabs(newOrderIds.map((id) => byId.get(id)!));
    }
  };

  // Sortable wrapper (keeps your visual classes)
  const SortableTab = ({ tab }: { tab: TabItem }) => {
    const { attributes, listeners, setNodeRef, transform, transition } =
      useSortable({ id: tab.id });

    const style = { transform: CSS.Transform.toString(transform), transition };
    const isEditing = editingId === tab.id;

    // disable drag listeners while editing so typing doesn't drag the tab
    const dragListeners = isEditing ? {} : (listeners as any);

    return (
      <div
        ref={setNodeRef}
        style={style}
        className="relative inline-flex items-start"
        {...attributes}
        {...dragListeners}
      >
        <TabsTrigger
          value={tab.id}
          className="
    group relative flex items-center rounded-none bg-transparent
    pl-2 pr-8 pt-2 pb-[10px] text-sm font-light
    text-foreground/80  hover:text-foreground hover:bg-black/5
    data-[state=active]:text-foreground
    hover:pb-[10px] data-[state=active]:pb-[10px]
    after:absolute after:left-0 after:bottom-0 after:h-[4px] after:w-0
    after:bg-[var(--primary-hover-color,#006278)] after:transition-all after:z-10
    data-[state=active]:after:w-full rounded-md hover:bg-black/5
  "
        >
          {/* pin icon (only when pinned and not renaming) */}
          {!isEditing && pinned.has(tab.id) ? (
            <Pin
              className="mr-1.5 h-3.5 w-3.5 shrink-0 text-muted-foreground"
              aria-hidden="true"
            />
          ) : null}

          {/* label OR inline editor */}
          {isEditing ? (
            <input
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => {
                if (e.key === "Enter") commitRename();
                if (e.key === "Escape") cancelRename();
              }}
              onBlur={commitRename}
              className="
        w-[12ch] md:w-[24ch] truncate
        rounded-md border-2 px-2 py-[2px]
        border-[var(--primary-hover-color,#006278)]
        outline-none bg-transparent
      "
            />
          ) : (
            <span className="truncate">{tab.label}</span>
          )}

          {/* kebab (hidden while editing) */}
          {!isEditing && (
            <span
              onClick={(e) => e.stopPropagation()}
              className="absolute right-1 top-1/2 -translate-y-1/2"
            >
              <TabKebab
                pinned={pinned.has(tab.id)}
                disableRename={tab.id === "main"}
                onTogglePin={() => togglePin(tab.id)}
                onRename={() => startRename(tab.id, tab.label)}
                onDuplicate={() => {
                  const original = tabs.find((t) => t.id === tab.id);
                  if (!original) return;
                  const copyLabel = `${original.label} copy`;
                  const id = slugUnique(slugify(copyLabel));
                  setTabs((prev) => [
                    ...prev,
                    { id, label: copyLabel, content: original.content },
                  ]);
                  setActive(id);
                }}
                onExport={(type) => console.log("export", tab.id, type)}
                onShare={() => console.log("share", tab.id)}
                onLock={() => console.log("lock", tab.id)}
                onReorder={(action) => console.log("reorder action", action)}
                onDelete={() =>
                  setTabs((prev) => prev.filter((t) => t.id !== tab.id))
                }
              />
            </span>
          )}
        </TabsTrigger>
      </div>
    );
  };

  return (
    <div className="">
      <div className="pt-1">
        <Tabs value={active} onValueChange={setActive} className="w-full">
          <div className="relative w-full">
            <div className="flex items-end justify-between ">
              <DndContext sensors={sensors} onDragEnd={onDragEnd}>
                <TabsList className="h-10 flex items-end gap-0 bg-transparent p-0">
                  {/* pinned first */}
                  <SortableContext
                    items={pinnedTabs.map((t) => t.id)}
                    strategy={horizontalListSortingStrategy}
                  >
                    {pinnedTabs.map((tab) => (
                      <SortableTab key={tab.id} tab={tab} />
                    ))}
                  </SortableContext>

                  {/* regular next */}
                  <SortableContext
                    items={regularTabs.map((t) => t.id)}
                    strategy={horizontalListSortingStrategy}
                  >
                    {regularTabs.map((tab) => (
                      <SortableTab key={tab.id} tab={tab} />
                    ))}
                  </SortableContext>

                  {/* All (fixed) */}
                  {tabs.length >= SHOW_ALL_AT && (
                    <AllTabButton
                      onOpen={openView}
                      onActivate={(id) => setActive(id)}
                      className="ml-1"
                      items={tabs.map(({ id, label }) => ({
                        id,
                        label,
                        pinned: pinned.has(id),
                      }))}
                      onReorder={(ids) => {
                        const byId = new Map(tabs.map((t) => [t.id, t]));
                        setTabs(ids.map((id) => byId.get(id)!).filter(Boolean));
                      }}
                    />
                  )}

                  {/* + Add (fixed) */}
                  <AddMenu onAdd={onAdd} />
                </TabsList>
              </DndContext>
            </div>
            <DealsToolbar
              onCreate={() => console.log("new deal")}
              onCreateFrom={(t) => console.log("new via", t)}
              onSearchClick={() => console.log("search")}
              onPersonClick={() => console.log("person")}
              onFilterClick={() => console.log("filter")}
              onGroupByClick={() => console.log("group by")}
              onMoreClick={() => console.log("more")}
            />
            <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-px bg-border" />
          </div>

          {tabs.map((tab) => (
            <TabsContent key={tab.id} value={tab.id} className="mt-3 px-3">
              <CardContent className="p-0">{tab.content ?? null}</CardContent>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}

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
  arrayMove,
} from "@dnd-kit/sortable";

import { Button } from "@/components/ui/button";

import { GRID_COLS, ROW_HEIGHT, MIN_H, MIN_W } from "./constants";
import { clamp, uid } from "./utils";
import type { Widget, WidgetKind } from "./types";
import { RENDERERS, WIDGET_LIBRARY } from "../widgets";
import AddWidgetMenu from "./ AddWidgetMenu";
import SortableResizableCard from "./ SortableResizableCard";

export default function SalesReportView() {
  const [widgets, setWidgets] = React.useState<Widget[]>([
    { id: uid(), kind: "numbers", title: "Total won …", w: 3, h: 3 },
    { id: uid(), kind: "numbers", title: "Num…", w: 3, h: 3 },
    { id: uid(), kind: "chart", title: "Deals stage distribution", w: 6, h: 3 },
    { id: uid(), kind: "gauge", title: "Annual Target", w: 6, h: 5 },
    { id: uid(), kind: "activity", title: "# of Deals", w: 6, h: 5 },
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
          ? {
              ...x,
              w: clamp(w, MIN_W, GRID_COLS),
              h: clamp(h, MIN_H, 12),
            }
          : x
      )
    );

  const remove = (id: string) =>
    setWidgets((list) => list.filter((x) => x.id !== id));

  const rename = (id: string, title: string) =>
    setWidgets((list) => list.map((x) => (x.id === id ? { ...x, title } : x)));

  const addWidget = (kind: WidgetKind) => {
    const lib = WIDGET_LIBRARY.find((w) => w.kind === kind)!;
    setWidgets((list) => [
      ...list,
      {
        id: uid(),
        kind,
        title: lib.title,
        w: kind === "chart" ? 6 : 3,
        h: kind === "gauge" ? 5 : 3,
      },
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

      {/* Grid canvas */}
      <DndContext sensors={sensors} onDragEnd={onDragEnd}>
        <SortableContext
          items={widgets.map((w) => w.id)}
          strategy={rectSortingStrategy}
        >
          <div
            data-grid
            className="grid gap-4 grid-cols-12"
            style={{ gridAutoRows: `${ROW_HEIGHT}px` }} // keep in sync with resize math
          >
            {widgets.map((w) => {
              const Renderer = RENDERERS[w.kind];
              return (
                <SortableResizableCard
                  key={w.id}
                  widget={w}
                  rowHeight={ROW_HEIGHT}
                  onResize={resize}
                  onRemove={remove}
                  onRename={rename}
                >
                  <Renderer />
                </SortableResizableCard>
              );
            })}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}

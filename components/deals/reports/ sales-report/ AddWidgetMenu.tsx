"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Plus } from "lucide-react";

import type { WidgetKind } from "./types";
import { WIDGET_LIBRARY } from "../widgets";

export default function AddWidgetMenu({
  onSelect,
}: {
  onSelect: (kind: WidgetKind) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="gap-2 bg-[var(--primary-hover-color,#007c89)] hover:bg-[var(--primary-hover-color,#007c89)]/90">
          <Plus className="h-4 w-4" />
          Add widget
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        {WIDGET_LIBRARY.map((w) => (
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

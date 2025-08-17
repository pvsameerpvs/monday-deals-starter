"use client";

import * as React from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Search,
  Table as TableIcon,
  BarChart2,
  CalendarRange,
  KanbanSquare,
  FileText,
  FileStack,
  FormInput,
  Settings2,
} from "lucide-react";

const ALL_VIEWS = [
  { label: "Sales report", icon: BarChart2 },
  { label: "Table", icon: TableIcon },
  { label: "Kanban", icon: TableIcon },
  { label: "Main table", icon: TableIcon },
  { label: "Pipeline", icon: KanbanSquare },
  { label: "Gantt", icon: BarChart2 },
  { label: "Customizable view", icon: Settings2 },
  { label: "Activity tracker", icon: BarChart2 },
  { label: "Calendar", icon: CalendarRange },
  { label: "File gallery", icon: FileStack },
  { label: "Form", icon: FormInput },
  // add/duplicate any as you like to mirror your list
];

export function AllMenu({
  onOpen,
  buttonClassName,
}: {
  onOpen: (label: string) => void;
  buttonClassName?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const [q, setQ] = React.useState("");

  const filtered = React.useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return ALL_VIEWS;
    return ALL_VIEWS.filter((v) => v.label.toLowerCase().includes(s));
  }, [q]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={buttonClassName ?? "h-9 gap-1"}
          aria-label="All views"
        >
          All
          <span className="ml-1">▾</span>
        </Button>
      </PopoverTrigger>

      <PopoverContent align="start" className="w-[320px] p-3" sideOffset={8}>
        <div className="relative">
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search view"
            className="pr-9"
          />
          <Search className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 opacity-60" />
        </div>

        <Separator className="my-3" />

        <ScrollArea className="max-h-[360px]">
          <ul className="space-y-1">
            {filtered.map(({ label, icon: Icon }) => (
              <li key={label}>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3"
                  onClick={() => {
                    onOpen(label);
                    setOpen(false);
                  }}
                >
                  <Icon className="h-4 w-4 opacity-80" />
                  <span>{label}</span>
                </Button>
              </li>
            ))}
            {filtered.length === 0 && (
              <li className="px-2 py-6 text-center text-sm text-muted-foreground">
                No results
              </li>
            )}
          </ul>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}

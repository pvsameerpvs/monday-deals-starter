"use client";

import * as React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Info,
  Table as TableIcon,
  BarChart2,
  SlidersHorizontal,
  PieChart,
  CalendarRange,
  KanbanSquare,
  Images,
  FileText,
  Settings2,
  ChevronRight,
} from "lucide-react";

type ViewRow = {
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  tag?: "New";
};

const VIEW_ROWS: ViewRow[] = [
  { label: "Table", icon: TableIcon },
  { label: "Activity tracker", icon: BarChart2, tag: "New" },
  { label: "Gantt", icon: SlidersHorizontal },
  { label: "Chart", icon: PieChart },
  { label: "Calendar", icon: CalendarRange },
  { label: "Kanban", icon: KanbanSquare },
  { label: "File gallery", icon: Images },
  { label: "Form", icon: FileText },
  { label: "Customizable view", icon: Settings2 },
];

export function AddMenu({ onAdd }: { onAdd: (label: string) => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {/* plus button styled like your tabs (no underline) */}
        <button
          type="button"
          aria-haspopup="menu"
          aria-label="Add"
          className="
            relative inline-flex items-center justify-center
            pl-3 pr-3 pt-2 pb-[10px]
            text-sm font-medium text-foreground/80
            border border-transparent
            rounded-md hover:bg-black/5 hover:text-foreground
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
          "
        >
          <Plus className="h-4 w-4" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-64 p-0" /* wider, no inner padding to match the ref UI */
      >
        {/* Header: "Board views" + info icon */}
        <div className="flex items-center justify-between px-3 pt-3 pb-2 text-xs font-medium text-muted-foreground">
          <span>Board views</span>
          <Info className="h-4 w-4 opacity-70" />
        </div>

        <DropdownMenuGroup>
          {VIEW_ROWS.map(({ label, icon: Icon, tag }) => (
            <DropdownMenuItem
              key={label}
              onClick={() => onAdd(label)}
              className="flex items-center gap-3 px-3 py-2"
            >
              <Icon className="h-4 w-4 opacity-80" />
              <span className="text-sm">{label}</span>

              {/* trailing "New" pill when provided */}
              {tag === "New" && (
                <span className="ml-auto rounded border px-2 text-[10px] leading-5 text-[var(--primary-hover-color,#006278)]">
                  New
                </span>
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="my-2" />

        {/* Apps row with a chevron (submenu stub so it shows ▸) */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="px-3 py-2">
            <span className="text-sm">Apps</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="w-56">
            <div className="px-2 py-2 text-sm text-muted-foreground">
              (Put app options here)
            </div>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSeparator className="my-2" />

        {/* Footer link style */}
        <button
          type="button"
          className="w-full cursor-pointer px-3 pb-3 text-left text-sm text-[var(--primary-hover-color,#006278)] hover:underline"
          // onClick={() => ...} // optional: open a “more views” page
        >
          Explore more views
        </button>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

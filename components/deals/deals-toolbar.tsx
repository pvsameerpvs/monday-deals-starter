// components/deals/toolbar/DealsToolbar.tsx
"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  ChevronDown,
  MoreHorizontal,
  UserRound,
  Filter as FilterIcon,
  LayoutGrid,
  Plus,
} from "lucide-react";
import clsx from "clsx";

// ⬇️ add this import
import { SearchWithColumnPicker } from "@/components/deals/toolbar/SearchWithColumnPicker";

type DealsToolbarProps = {
  className?: string;
  onCreate?: () => void;
  onCreateFrom?: (type: "blank" | "fromTemplate" | "import") => void;
  onSearchClick?: () => void; // will be called on first type/expand
  onPersonClick?: () => void;
  onFilterClick?: () => void;
  onGroupByClick?: () => void;
  onMoreClick?: () => void;
};

export function DealsToolbar({
  className,
  onCreate,
  onCreateFrom,
  onSearchClick,
  onPersonClick,
  onFilterClick,
  onGroupByClick,
  onMoreClick,
}: DealsToolbarProps) {
  return (
    <div
      className={clsx("flex flex-wrap items-center gap-4", "py-2", className)}
    >
      {/* New deal — split button */}
      <div className="flex overflow-hidden rounded-md">
        <Button
          onClick={onCreate}
          className="
            h-9 rounded-none px-4 text-sm font-medium
            bg-[var(--primary-hover-color,#007c89)]
            hover:bg-[var(--primary-hover-color,#007c89)]/90
            text-white
          "
        >
          <Plus className="mr-2 h-4 w-4" />
          New deal
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              className="
                h-9 rounded-none border-l px-2
                bg-[var(--primary-hover-color,#007c89)]
                hover:bg-[var(--primary-hover-color,#007c89)]/90
                text-white
              "
              aria-label="Choose how to create"
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            <DropdownMenuLabel>New deal</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onCreateFrom?.("blank")}>
              Start from blank
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onCreateFrom?.("fromTemplate")}>
              From template
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onCreateFrom?.("import")}>
              Import…
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Search + column picker (inline, collapses to “Search”) */}
      <SearchWithColumnPicker
        placeholder="Search this board"
        onSearch={(val) => console.log("search:", val)}
      />

      {/* Person */}
      <Button
        variant="ghost"
        className="h-9 gap-2 px-3"
        onClick={onPersonClick}
      >
        <UserRound className="h-4 w-4 opacity-80" />
        <span className="text-sm">Person</span>
      </Button>

      {/* Filter (with chevron) */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-9 gap-2 px-3">
            <FilterIcon className="h-4 w-4 opacity-80" />
            <span className="text-sm">Filter</span>
            <ChevronDown className="ml-1 h-4 w-4 opacity-70" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuItem onClick={onFilterClick}>
            Add filter…
          </DropdownMenuItem>
          <DropdownMenuItem>Save as view</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Clear filters</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Group by (with chevron) */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-9 gap-2 px-3">
            <LayoutGrid className="h-4 w-4 opacity-80" />
            <span className="text-sm">Group by</span>
            <ChevronDown className="ml-1 h-4 w-4 opacity-70" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuItem onClick={onGroupByClick}>Status</DropdownMenuItem>
          <DropdownMenuItem>Owner</DropdownMenuItem>
          <DropdownMenuItem>Priority</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>None</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* More */}
      <Button
        variant="ghost"
        className="ml-auto h-9 px-2"
        onClick={onMoreClick}
        aria-label="More actions"
      >
        <MoreHorizontal className="h-4 w-4" />
      </Button>
    </div>
  );
}

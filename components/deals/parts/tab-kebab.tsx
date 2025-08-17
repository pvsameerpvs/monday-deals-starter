"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  MoreHorizontal,
  Pin,
  PinOff,
  Pencil,
  Copy,
  Download,
  Share2,
  Lock,
  Shuffle,
  Trash2,
} from "lucide-react";

type ExportType = "csv" | "xlsx" | "pdf";

export function TabKebab({
  pinned = false,
  onTogglePin,
  onRename,
  onDuplicate,
  onExport,
  onShare,
  onLock,
  onReorder,
  onDelete,
  isActive, // kept for API compat
  disableRename = false, // 👈 NEW: disable only the rename item
}: {
  isActive?: boolean;
  pinned?: boolean;
  onTogglePin: () => void;
  onRename: () => void;
  onDuplicate: () => void;
  onExport?: (type: ExportType) => void;
  onShare?: () => void;
  onLock?: () => void;
  onReorder?: (action?: string) => void;
  onDelete: () => void;
  disableRename?: boolean;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          tabIndex={-1}
          title="More"
          className="h-6 w-6 p-0 rounded-md hover:bg-muted/50"
        >
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Tab menu</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="w-60">
        <DropdownMenuItem onClick={onTogglePin}>
          {pinned ? (
            <>
              <PinOff className="mr-2 h-4 w-4" />
              Unpin view
            </>
          ) : (
            <>
              <Pin className="mr-2 h-4 w-4" />
              Pin view
            </>
          )}
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Rename (disabled for Main table) */}
        <DropdownMenuItem
          onClick={!disableRename ? onRename : undefined}
          disabled={disableRename}
        >
          <Pencil className="mr-2 h-4 w-4" />
          Rename view
        </DropdownMenuItem>

        <DropdownMenuItem onClick={onDuplicate}>
          <Copy className="mr-2 h-4 w-4" />
          Duplicate view
        </DropdownMenuItem>

        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Download className="mr-2 h-4 w-4" />
            <span className="flex-1">Export</span>
            <span className="ml-2 rounded border px-1.5 text-[10px] leading-5 text-[var(--primary-hover-color,#006278)]">
              New
            </span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="w-44">
            <DropdownMenuItem onClick={() => onExport?.("csv")}>
              CSV
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onExport?.("xlsx")}>
              Excel (.xlsx)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onExport?.("pdf")}>
              PDF
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuItem onClick={onShare}>
          <Share2 className="mr-2 h-4 w-4" />
          Share view
        </DropdownMenuItem>

        <DropdownMenuItem onClick={onLock}>
          <Lock className="mr-2 h-4 w-4" />
          Lock view to restrict edits
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Shuffle className="mr-2 h-4 w-4" />
            Reorder (for everyone)
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="w-56">
            <DropdownMenuItem onClick={() => onReorder?.("open")}>
              Open reorder panel
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onReorder?.("alphabetical")}>
              Alphabetical
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onReorder?.("reset")}>
              Reset to default
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={onDelete}
          className="text-red-600 focus:text-red-600"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete view
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

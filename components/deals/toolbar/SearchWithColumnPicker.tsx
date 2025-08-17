"use client";

import * as React from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, SlidersHorizontal, Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";

type Column = {
  id: string;
  label: string;
  badge?: { text: string; bg: string; fg: string };
};

const DEFAULT_COLUMNS: Column[] = [
  {
    id: "name",
    label: "Name",
    badge: { text: "Tt", bg: "bg-purple-100", fg: "text-purple-700" },
  },
  {
    id: "activities",
    label: "Activities timeline",
    badge: { text: "•", bg: "bg-sky-100", fg: "text-sky-700" },
  },
  {
    id: "stage",
    label: "Stage",
    badge: { text: "▦", bg: "bg-emerald-100", fg: "text-emerald-700" },
  },
  {
    id: "owner",
    label: "Owner",
    badge: { text: "👤", bg: "bg-blue-100", fg: "text-blue-700" },
  },
  {
    id: "value",
    label: "Deal Value",
    badge: { text: "$", bg: "bg-amber-100", fg: "text-amber-700" },
  },
  {
    id: "contacts",
    label: "Contacts",
    badge: { text: "✉︎", bg: "bg-rose-100", fg: "text-rose-700" },
  },
  {
    id: "created",
    label: "Created at",
    badge: { text: "⏱", bg: "bg-slate-100", fg: "text-slate-700" },
  },
  {
    id: "updated",
    label: "Last update",
    badge: { text: "↻", bg: "bg-slate-100", fg: "text-slate-700" },
  },
];

export function SearchWithColumnPicker({
  columns = DEFAULT_COLUMNS,
  defaultSelected,
  onSelectedChange,
  placeholder = "Search this board",
  onSearch,
  className,
}: {
  columns?: Column[];
  defaultSelected?: string[];
  onSelectedChange?: (ids: string[]) => void;
  placeholder?: string;
  onSearch?: (value: string) => void;
  className?: string;
}) {
  const [expanded, setExpanded] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [q, setQ] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (expanded) inputRef.current?.focus();
  }, [expanded]);

  const allIds = React.useMemo(() => columns.map((c) => c.id), [columns]);
  const [selected, setSelected] = React.useState<Set<string>>(
    new Set(
      defaultSelected && defaultSelected.length ? defaultSelected : allIds
    )
  );

  React.useEffect(() => {
    onSelectedChange?.(Array.from(selected));
  }, [selected, onSelectedChange]);

  const [cq, setCq] = React.useState("");
  const visible = React.useMemo(() => {
    const s = cq.trim().toLowerCase();
    return s
      ? columns.filter((c) => c.label.toLowerCase().includes(s))
      : columns;
  }, [columns, cq]);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const allChecked = selected.size === allIds.length;
  const setAll = (value: boolean) => setSelected(new Set(value ? allIds : []));

  const tryCollapse = () => {
    if (!open && q.trim() === "") setExpanded(false);
  };

  return (
    <div className={clsx("relative", className)}>
      <AnimatePresence initial={false} mode="wait">
        {!expanded ? (
          <motion.button
            key="collapsed"
            type="button"
            onClick={() => setExpanded(true)}
            className="inline-flex items-center gap-2 rounded-md px-2 py-1.5 text-[13px] text-foreground/80 hover:bg-muted/40"
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -6 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <Search className="h-4 w-4 opacity-70" />
            <span>Search</span>
          </motion.button>
        ) : (
          <motion.div
            key="expanded"
            className="relative w-[400px] max-w-full"
            initial={{ opacity: 0, x: 18 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 18 }}
            transition={{ duration: 1.25, ease: [0.22, 1, 0.36, 1] }}
          >
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-60" />
            <input
              ref={inputRef}
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                onSearch?.(e.target.value);
              }}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  setQ("");
                  setExpanded(false);
                }
              }}
              onBlur={tryCollapse}
              placeholder={placeholder}
              className="h-9 w-full rounded-md border bg-background pl-9 pr-10 text-[13px] outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary-hover-color,#006278)]"
            />

            <Popover
              open={open}
              onOpenChange={(v) => {
                setOpen(v);
                if (!v) tryCollapse();
              }}
            >
              <PopoverTrigger asChild>
                <button
                  type="button"
                  aria-label="Choose columns to search"
                  onMouseDown={(e) => e.preventDefault()} // keeps input focused
                  className="absolute right-1 top-1/2 -translate-y-1/2 inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted/40"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                </button>
              </PopoverTrigger>

              <AnimatePresence>
                {open && (
                  <PopoverContent
                    asChild
                    align="end"
                    side="bottom"
                    sideOffset={8}
                    onEscapeKeyDown={() => setOpen(false)}
                    onInteractOutside={() => setOpen(false)} // click outside closes
                  >
                    <motion.div
                      className="w-[320px] p-0 origin-right"
                      initial={{ opacity: 0, x: 26, scale: 0.98 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      exit={{ opacity: 0, x: 26, scale: 0.98 }}
                      transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }} // slow
                    >
                      <ScrollArea className="h-[260px] pr-1">
                        <div className="p-1">
                          <div className="mb-2 flex items-center justify-between">
                            <h3 className="text-[15px] font-semibold">
                              Choose columns to search
                            </h3>
                            <button
                              type="button"
                              className="inline-flex h-7 w-7 items-center justify-center rounded-full hover:bg-muted/40"
                              title="Save as favorite"
                            >
                              <Heart className="h-4 w-4" />
                            </button>
                          </div>

                          {/* inner column search */}
                          <div className="relative">
                            <Input
                              value={cq}
                              onChange={(e) => setCq(e.target.value)}
                              placeholder="Find a column"
                              className="h-9 pr-9 text-[13px]"
                            />
                            <Search className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 opacity-60" />
                          </div>

                          <Separator className="my-3" />

                          {/* master toggle */}
                          <button
                            type="button"
                            onClick={() => setAll(!allChecked)}
                            className="mb-1 flex w-full items-center gap-3 rounded-md px-1.5 py-1.5 text-left hover:bg-muted/40"
                          >
                            <Checkbox
                              checked={allChecked}
                              onCheckedChange={(v) => setAll(Boolean(v))}
                              className="h-4 w-4 rounded-[6px] border
                              data-[state=checked]:bg-[var(--primary-hover-color,#0b7c89)]
                              data-[state=checked]:border-[var(--primary-hover-color,#0b7c89)]"
                            />
                            <div className="flex items-baseline gap-2">
                              <span className="text-[14px] font-semibold">
                                All columns
                              </span>
                              <span className="text-[13px] text-muted-foreground">
                                {selected.size} selected
                              </span>
                            </div>
                          </button>

                          <div className="mb-1 pl-7 text-[12px] font-medium text-muted-foreground">
                            Item columns
                          </div>

                          {/* list */}
                          <ScrollArea className="max-h-[260px] pr-1">
                            <ul className="space-y-1">
                              {visible.map((c) => {
                                const checked = selected.has(c.id);
                                return (
                                  <li key={c.id}>
                                    <button
                                      type="button"
                                      onClick={() => toggle(c.id)}
                                      className={clsx(
                                        "flex w-full items-center gap-3 rounded-md px-1.5 py-1.5 text-left hover:bg-muted/40",
                                        checked && "bg-teal-100/60"
                                      )}
                                    >
                                      <Checkbox
                                        checked={checked}
                                        onCheckedChange={() => toggle(c.id)}
                                        className="h-4 w-4 rounded-[6px] border
                                        data-[state=checked]:bg-[var(--primary-hover-color,#0b7c89)]
                                        data-[state=checked]:border-[var(--primary-hover-color,#0b7c89)]"
                                        // let row click handle; prevent double-focus
                                        onClick={(e) => e.stopPropagation()}
                                      />
                                      {c.badge ? (
                                        <span
                                          className={clsx(
                                            "grid h-6 w-6 place-content-center rounded",
                                            c.badge.bg,
                                            c.badge.fg,
                                            "text-[12px] font-semibold"
                                          )}
                                        >
                                          {c.badge.text}
                                        </span>
                                      ) : null}
                                      <span className="text-[13px]">
                                        {c.label}
                                      </span>
                                    </button>
                                  </li>
                                );
                              })}
                            </ul>
                          </ScrollArea>
                        </div>
                      </ScrollArea>
                    </motion.div>
                  </PopoverContent>
                )}
              </AnimatePresence>
            </Popover>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

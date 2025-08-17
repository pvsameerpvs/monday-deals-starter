// // components/deals/parts/main-table.tsx
// "use client";

// import * as React from "react";
// import {
//   DndContext,
//   DragEndEvent,
//   MouseSensor,
//   TouchSensor,
//   useSensor,
//   useSensors,
// } from "@dnd-kit/core";
// import {
//   SortableContext,
//   verticalListSortingStrategy,
//   horizontalListSortingStrategy,
//   useSortable,
//   arrayMove,
// } from "@dnd-kit/sortable";
// import { CSS } from "@dnd-kit/utilities";

// import {
//   ChevronDown,
//   ChevronRight,
//   Plus,
//   GripVertical,
//   Hand,
// } from "lucide-react";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { ScrollArea } from "@/components/ui/scroll-area";
// import clsx from "clsx";

// /* ──────────────────────────────────────────────────────────────────────────────
//    Types & Data
// ────────────────────────────────────────────────────────────────────────────── */

// type Row = {
//   id: string;
//   deal: string;
//   stage: StageKey;
//   value: number;
//   owner?: string;
//   contacts?: number;
//   account?: string;
//   created?: string;
//   probability?: number;
//   notes?: string;
// };

// type Group = {
//   id: string;
//   name: string;
//   color: string; // left color bar
//   collapsed?: boolean;
//   rows: Row[];
// };

// type Column = {
//   id:
//     | "deal"
//     | "activities"
//     | "stage"
//     | "owner"
//     | "value"
//     | "contacts"
//     | "account"
//     | "created"
//     | "probability"
//     | "notes";
//   label: string;
//   width: number; // px
//   pinned?: boolean; // first column pinned
// };

// const STAGES = [
//   { key: "new", label: "New", color: "bg-indigo-600" },
//   { key: "qualified", label: "Qualified", color: "bg-amber-600" },
//   { key: "proposal", label: "Proposal", color: "bg-sky-600" },
//   { key: "won", label: "Won", color: "bg-emerald-600" },
//   { key: "lost", label: "Lost", color: "bg-rose-600" },
// ] as const;
// type StageKey = (typeof STAGES)[number]["key"];

// const DEFAULT_COLUMNS: Column[] = [
//   { id: "deal", label: "Deal", width: 280, pinned: true }, // sticky
//   { id: "activities", label: "Activities timeline", width: 360 },
//   { id: "stage", label: "Stage", width: 180 },
//   { id: "owner", label: "Owner", width: 160 },
//   { id: "value", label: "Deal Value", width: 200 },
//   { id: "contacts", label: "Contacts", width: 180 },
//   { id: "account", label: "Account", width: 200 },
//   { id: "created", label: "Created at", width: 180 },
//   { id: "probability", label: "Probability", width: 160 },
//   { id: "notes", label: "Notes", width: 320 },
// ];

// const makeRow = (n: number): Row => ({
//   id: `row-${crypto.randomUUID()}`,
//   deal: `New deal`,
//   stage: "new",
//   value: 0,
//   contacts: 0,
//   account: "",
//   created: new Date().toISOString().slice(0, 10),
//   probability: 10 + (n % 5) * 10,
//   notes: "",
// });

// const seedGroup = (name: string, color: string, count = 2): Group => ({
//   id: `grp-${crypto.randomUUID()}`,
//   name,
//   color,
//   rows: Array.from({ length: count }, (_, i) => makeRow(i)),
// });

// /* ──────────────────────────────────────────────────────────────────────────────
//    MainTable
// ────────────────────────────────────────────────────────────────────────────── */

// export function MainTable() {
//   // groups
//   const [groups, setGroups] = React.useState<Group[]>([
//     seedGroup("New Group", "#f59e0b"),
//     seedGroup("New Group", "#e11d48", 0),
//   ]);

//   // column order (first is pinned & not draggable)
//   const [columns, setColumns] = React.useState<Column[]>(DEFAULT_COLUMNS);
//   const pinned = columns[0]; // Deal
//   const flexCols = columns.slice(1); // draggable

//   // DnD sensors (used for column DnD and each group's row DnD)
//   const sensors = useSensors(
//     useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
//     useSensor(TouchSensor, {
//       pressDelay: 150,
//       activationConstraint: { distance: 5 },
//     })
//   );

//   /* ------------------------------- Column DnD -------------------------------- */
//   const onColumnsDragEnd = (e: DragEndEvent) => {
//     const { active, over } = e;
//     if (!over || active.id === over.id) return;

//     const ids = flexCols.map((c) => c.id);
//     const oldIndex = ids.indexOf(String(active.id) as Column["id"]);
//     const newIndex = ids.indexOf(String(over.id) as Column["id"]);
//     if (oldIndex < 0 || newIndex < 0) return;

//     const moved = arrayMove(flexCols, oldIndex, newIndex);
//     setColumns([pinned, ...moved]);
//   };

//   const addGroup = () =>
//     setGroups((gs) => [...gs, seedGroup("New Group", randomColor())]);

//   return (
//     <div className="select-none">
//       {/* Each group */}
//       {groups.map((g, gi) => (
//         <GroupTable
//           key={g.id}
//           group={g}
//           columns={columns}
//           sensors={sensors}
//           onToggle={() =>
//             setGroups((gs) =>
//               gs.map((x) =>
//                 x.id === g.id ? { ...x, collapsed: !x.collapsed } : x
//               )
//             )
//           }
//           onRowsReorder={(newOrder) =>
//             setGroups((gs) =>
//               gs.map((x) =>
//                 x.id === g.id
//                   ? { ...x, rows: reorderByIds(x.rows, newOrder) }
//                   : x
//               )
//             )
//           }
//           onAddRow={(name) =>
//             setGroups((gs) =>
//               gs.map((x) =>
//                 x.id === g.id
//                   ? { ...x, rows: [...x.rows, { ...makeRow(0), deal: name }] }
//                   : x
//               )
//             )
//           }
//           onStageChange={(rowId, stage) =>
//             setGroups((gs) =>
//               gs.map((x) =>
//                 x.id === g.id
//                   ? {
//                       ...x,
//                       rows: x.rows.map((r) =>
//                         r.id === rowId ? { ...r, stage } : r
//                       ),
//                     }
//                   : x
//               )
//             )
//           }
//           onValueChange={(rowId, value) =>
//             setGroups((gs) =>
//               gs.map((x) =>
//                 x.id === g.id
//                   ? {
//                       ...x,
//                       rows: x.rows.map((r) =>
//                         r.id === rowId ? { ...r, value } : r
//                       ),
//                     }
//                   : x
//               )
//             )
//           }
//           headerRight={
//             gi === 0 && (
//               // Column drag area only once (top group header row), but it controls global order
//               <div className="flex items-center gap-2">
//                 <span className="text-xs text-muted-foreground">
//                   Drag to reorder columns
//                 </span>
//                 <Hand className="h-4 w-4 opacity-60" />
//               </div>
//             )
//           }
//           // Render the column headers (pinned + draggable rest) once per group table
//           renderHeader={() => (
//             <div className="flex">
//               {/* pinned header */}
//               <HeaderCell width={pinned.width} sticky className="z-20">
//                 <div className="flex items-center gap-1">
//                   <GripVertical className="h-3.5 w-3.5 opacity-40" />
//                   <span className="truncate">{pinned.label}</span>
//                 </div>
//               </HeaderCell>

//               {/* scrollable headers (DnD) */}
//               <div className="min-w-0 flex-1 overflow-x-auto">
//                 <div
//                   className="flex"
//                   style={{ width: flexCols.reduce((t, c) => t + c.width, 0) }}
//                 >
//                   <DndContext sensors={sensors} onDragEnd={onColumnsDragEnd}>
//                     <SortableContext
//                       items={flexCols.map((c) => c.id)}
//                       strategy={horizontalListSortingStrategy}
//                     >
//                       {flexCols.map((c) => (
//                         <SortableHeader
//                           key={c.id}
//                           id={c.id}
//                           width={c.width}
//                           label={c.label}
//                         />
//                       ))}
//                     </SortableContext>
//                   </DndContext>
//                 </div>
//               </div>
//             </div>
//           )}
//         />
//       ))}

//       <div className="px-4 py-2">
//         <Button
//           variant="outline"
//           className="h-9 gap-2 rounded-md"
//           onClick={addGroup}
//         >
//           <Plus className="h-4 w-4" />
//           <span className="text-sm">Add new group</span>
//         </Button>
//       </div>
//     </div>
//   );
// }

// /* ──────────────────────────────────────────────────────────────────────────────
//    Group table (collapsible, rows sortable; first column pinned)
// ────────────────────────────────────────────────────────────────────────────── */

// function GroupTable({
//   group,
//   columns,
//   sensors,
//   onToggle,
//   onRowsReorder,
//   onAddRow,
//   onStageChange,
//   onValueChange,
//   headerRight,
//   renderHeader,
// }: {
//   group: Group;
//   columns: Column[];
//   sensors: any;
//   onToggle: () => void;
//   onRowsReorder: (ids: string[]) => void;
//   onAddRow: (name: string) => void;
//   onStageChange: (rowId: string, stage: StageKey) => void;
//   onValueChange: (rowId: string, value: number) => void;
//   headerRight?: React.ReactNode;
//   renderHeader: () => React.ReactNode;
// }) {
//   const [adding, setAdding] = React.useState(false);
//   const [draft, setDraft] = React.useState("");

//   const pinned = columns[0];
//   const flexCols = columns.slice(1);

//   // new row accept
//   const commitAdd = () => {
//     const name = draft.trim();
//     if (name) onAddRow(name);
//     setDraft("");
//     setAdding(false);
//   };

//   return (
//     <div className="mb-8">
//       {/* Group header */}
//       <div className="flex items-center justify-between px-4">
//         <button
//           type="button"
//           onClick={onToggle}
//           className="flex items-center gap-2 py-2"
//         >
//           <span
//             className="inline-block h-8 w-1.5 rounded-full"
//             style={{ backgroundColor: group.color }}
//           />
//           {group.collapsed ? (
//             <ChevronRight className="h-4 w-4 opacity-60" />
//           ) : (
//             <ChevronDown className="h-4 w-4 opacity-60" />
//           )}
//           <span className="text-lg font-semibold">{group.name}</span>
//           <span className="ml-3 text-sm text-muted-foreground">
//             {group.rows.length} {group.rows.length === 1 ? "Deal" : "Deals"}
//           </span>
//         </button>
//         {headerRight}
//       </div>

//       {/* Table */}
//       {!group.collapsed && (
//         <div className="mx-4 rounded-lg border shadow-sm">
//           {/* header row */}
//           <div className="sticky top-0 z-10 rounded-t-lg border-b bg-background/80 backdrop-blur">
//             {renderHeader()}
//           </div>

//           {/* body */}
//           <DndContext
//             sensors={sensors}
//             onDragEnd={(e) => {
//               const { active, over } = e;
//               if (!over || active.id === over.id) return;
//               const ids = group.rows.map((r) => r.id);
//               const oldIndex = ids.indexOf(String(active.id));
//               const newIndex = ids.indexOf(String(over.id));
//               if (oldIndex < 0 || newIndex < 0) return;
//               onRowsReorder(arrayMove(ids, oldIndex, newIndex));
//             }}
//           >
//             <SortableContext
//               items={group.rows.map((r) => r.id)}
//               strategy={verticalListSortingStrategy}
//             >
//               {group.rows.map((row, idx) => (
//                 <SortableRow
//                   key={row.id}
//                   id={row.id}
//                   pinnedWidth={pinned.width}
//                   flexCols={flexCols}
//                   row={row}
//                   onStageChange={(s) => onStageChange(row.id, s)}
//                   onValueChange={(v) => onValueChange(row.id, v)}
//                   zebra={idx % 2 === 1}
//                 />
//               ))}
//             </SortableContext>
//           </DndContext>

//           {/* "+ Add deal" row */}
//           <div className="flex border-t">
//             {/* pinned "add" cell */}
//             <Cell width={pinned.width} sticky className="z-10">
//               {!adding ? (
//                 <button
//                   type="button"
//                   onClick={() => setAdding(true)}
//                   className="inline-flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-muted/40"
//                 >
//                   <Plus className="h-4 w-4" />
//                   <span className="text-sm">Add deal</span>
//                 </button>
//               ) : (
//                 <Input
//                   autoFocus
//                   placeholder="Deal name"
//                   value={draft}
//                   onChange={(e) => setDraft(e.target.value)}
//                   className="h-8 w-[220px]"
//                   onKeyDown={(e) => {
//                     if (e.key === "Enter") commitAdd();
//                     if (e.key === "Escape") {
//                       setAdding(false);
//                       setDraft("");
//                     }
//                   }}
//                   onBlur={commitAdd}
//                 />
//               )}
//             </Cell>

//             {/* flex "add" area to align with scroll section */}
//             <div className="min-w-0 flex-1 overflow-x-auto">
//               <div style={{ width: flexCols.reduce((t, c) => t + c.width, 0) }}>
//                 <div className="h-10" />
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// /* ──────────────────────────────────────────────────────────────────────────────
//    Sortable Row
// ────────────────────────────────────────────────────────────────────────────── */

// function SortableRow({
//   id,
//   pinnedWidth,
//   flexCols,
//   row,
//   onStageChange,
//   onValueChange,
//   zebra,
// }: {
//   id: string;
//   pinnedWidth: number;
//   flexCols: Column[];
//   row: Row;
//   onStageChange: (s: StageKey) => void;
//   onValueChange: (v: number) => void;
//   zebra?: boolean;
// }) {
//   const {
//     attributes,
//     listeners,
//     setNodeRef,
//     transform,
//     transition,
//     isDragging,
//   } = useSortable({ id });

//   const style: React.CSSProperties = {
//     transform: CSS.Transform.toString(transform),
//     transition,
//   };

//   // one-line helper to color the stage pill
//   const stageMeta = STAGES.find((s) => s.key === row.stage)!;

//   return (
//     <div
//       ref={setNodeRef}
//       style={style}
//       className={clsx(
//         "flex border-b",
//         zebra && "bg-muted/20",
//         isDragging && "opacity-80"
//       )}
//       {...attributes}
//     >
//       {/* pinned cell (deal + grab handle) */}
//       <Cell width={pinnedWidth} sticky className="z-10">
//         <div className="flex items-center gap-2">
//           <button
//             {...listeners}
//             aria-label="Drag row"
//             className="inline-flex h-6 w-6 items-center justify-center rounded hover:bg-muted/50 cursor-grab active:cursor-grabbing"
//           >
//             <Hand className="h-4 w-4 opacity-70" />
//           </button>
//           <span className="truncate">{row.deal}</span>
//         </div>
//       </Cell>

//       {/* scrollable part */}
//       <div className="min-w-0 flex-1 overflow-x-auto">
//         <div
//           className="flex"
//           style={{ width: flexCols.reduce((t, c) => t + c.width, 0) }}
//         >
//           {flexCols.map((c) => {
//             return (
//               <Cell key={c.id} width={c.width}>
//                 {renderCell(c.id, row, onStageChange, onValueChange, stageMeta)}
//               </Cell>
//             );
//           })}
//         </div>
//       </div>
//     </div>
//   );
// }

// /* ──────────────────────────────────────────────────────────────────────────────
//    Cells & Headers
// ────────────────────────────────────────────────────────────────────────────── */

// function HeaderCell({
//   width,
//   sticky,
//   className,
//   children,
// }: {
//   width: number;
//   sticky?: boolean;
//   className?: string;
//   children: React.ReactNode;
// }) {
//   return (
//     <div
//       className={clsx(
//         "h-10 shrink-0 border-r px-2.5 text-sm text-foreground/80",
//         "grid place-items-center text-center",
//         sticky && "sticky left-0 bg-background",
//         className
//       )}
//       style={{ width }}
//     >
//       <div className="w-full truncate">{children}</div>
//     </div>
//   );
// }

// function SortableHeader({
//   id,
//   width,
//   label,
// }: {
//   id: string;
//   width: number;
//   label: string;
// }) {
//   const { attributes, listeners, setNodeRef, transform, transition } =
//     useSortable({ id });
//   const style: React.CSSProperties = {
//     transform: CSS.Transform.toString(transform),
//     transition,
//     width,
//   };

//   return (
//     <div
//       ref={setNodeRef}
//       style={style}
//       className="h-10 shrink-0 border-r px-2.5 grid place-items-center text-sm text-foreground/80"
//       {...attributes}
//     >
//       <button
//         {...listeners}
//         className="mx-auto inline-flex items-center gap-1 rounded px-1.5 py-0.5 hover:bg-muted/50 cursor-grab active:cursor-grabbing"
//         aria-label="Drag column"
//         title="Drag to reorder"
//       >
//         <Hand className="h-3.5 w-3.5 opacity-60" />
//         <span className="truncate">{label}</span>
//       </button>
//     </div>
//   );
// }

// function Cell({
//   width,
//   children,
//   sticky,
//   className,
// }: {
//   width: number;
//   children?: React.ReactNode;
//   sticky?: boolean;
//   className?: string;
// }) {
//   return (
//     <div
//       className={clsx(
//         "h-12 shrink-0 border-r px-2.5 text-sm text-foreground/80",
//         "grid place-items-center text-center",
//         sticky && "sticky left-0 bg-background",
//         className
//       )}
//       style={{ width }}
//     >
//       <div className="w-full truncate">{children}</div>
//     </div>
//   );
// }

// /* ──────────────────────────────────────────────────────────────────────────────
//    Cell renderers
// ────────────────────────────────────────────────────────────────────────────── */

// function renderCell(
//   id: Column["id"],
//   row: Row,
//   onStageChange: (s: StageKey) => void,
//   onValueChange: (v: number) => void,
//   stageMeta: { key: StageKey; label: string; color: string }
// ) {
//   switch (id) {
//     case "activities":
//       return (
//         <div className="flex gap-1">
//           {Array.from({ length: 10 }).map((_, i) => (
//             <span
//               key={i}
//               className="h-2 w-5 rounded-full bg-muted"
//               aria-hidden
//             />
//           ))}
//         </div>
//       );

//     case "stage":
//       return (
//         <Select
//           defaultValue={row.stage}
//           onValueChange={(v) => onStageChange(v as StageKey)}
//         >
//           <SelectTrigger className="h-7 w-[120px] justify-center rounded-full border-0 px-0">
//             <SelectValue>
//               <span
//                 className={clsx(
//                   "inline-flex min-w-[90px] items-center justify-center rounded-full px-3 py-1 text-white",
//                   stageMeta.color
//                 )}
//               >
//                 {STAGES.find((s) => s.key === row.stage)?.label}
//               </span>
//             </SelectValue>
//           </SelectTrigger>
//           <SelectContent align="start" className="w-[160px]">
//             {STAGES.map((s) => (
//               <SelectItem key={s.key} value={s.key}>
//                 <span
//                   className={clsx(
//                     "mr-2 inline-block h-2.5 w-2.5 rounded-full",
//                     s.color
//                   )}
//                 />
//                 {s.label}
//               </SelectItem>
//             ))}
//           </SelectContent>
//         </Select>
//       );

//     case "owner":
//       return <span className="text-muted-foreground">—</span>;

//     case "value":
//       return (
//         <div className="flex items-center justify-center gap-2">
//           <span className="text-muted-foreground">$</span>
//           <Input
//             type="number"
//             className="h-8 w-[120px]"
//             value={row.value}
//             onChange={(e) => onValueChange(Number(e.target.value))}
//           />
//         </div>
//       );

//     case "contacts":
//       return <span>{row.contacts ?? 0}</span>;

//     case "account":
//       return <span className="truncate">{row.account ?? ""}</span>;

//     case "created":
//       return <span>{row.created}</span>;

//     case "probability":
//       return <span>{row.probability}%</span>;

//     case "notes":
//       return <span className="truncate">{row.notes ?? ""}</span>;

//     default:
//       return null;
//   }
// }

// /* ──────────────────────────────────────────────────────────────────────────────
//    Utils
// ────────────────────────────────────────────────────────────────────────────── */

// function reorderByIds<T extends { id: string }>(arr: T[], ids: string[]) {
//   const map = new Map(arr.map((x) => [x.id, x]));
//   return ids.map((id) => map.get(id)!).filter(Boolean);
// }

// function randomColor() {
//   const palette = ["#f59e0b", "#e11d48", "#06b6d4", "#22c55e", "#8b5cf6"];
//   return palette[Math.floor(Math.random() * palette.length)];
// }

// components/deals/parts/main-table/types.ts
export type Row = {
  id: string;
  deal: string;
  stage: StageKey;
  value: number;
  owner?: string;
  contacts?: number;
  account?: string;
  created?: string;
  probability?: number;
  notes?: string;
};

export type Group = {
  id: string;
  name: string;
  color: string;
  collapsed?: boolean;
  rows: Row[];
};

export type Column = {
  id:
    | "deal"
    | "activities"
    | "stage"
    | "owner"
    | "value"
    | "contacts"
    | "account"
    | "created"
    | "probability"
    | "notes";
  label: string;
  width: number;
  pinned?: boolean;
  
};

export const STAGES = [
  { key: "new",        label: "New",        color: "bg-indigo-600" },
  { key: "qualified",  label: "Qualified",  color: "bg-amber-600" },
  { key: "proposal",   label: "Proposal",   color: "bg-sky-600" },
  { key: "won",        label: "Won",        color: "bg-emerald-600" },
  { key: "lost",       label: "Lost",       color: "bg-rose-600" },
] as const;

export type StageKey = (typeof STAGES)[number]["key"];

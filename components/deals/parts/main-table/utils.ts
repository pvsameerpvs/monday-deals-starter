// components/deals/parts/main-table/utils.ts
import type { Row } from "./types";

export function reorderByIds<T extends { id: string }>(arr: T[], ids: string[]) {
  const map = new Map(arr.map((x) => [x.id, x]));
  return ids.map((id) => map.get(id)!).filter(Boolean);
}

export function randomColor() {
  const palette = ["#f59e0b", "#e11d48", "#06b6d4", "#22c55e", "#8b5cf6"];
  return palette[Math.floor(Math.random() * palette.length)];
}

export const widthSum = (w: number, n: number) => w + n;
export const uuid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

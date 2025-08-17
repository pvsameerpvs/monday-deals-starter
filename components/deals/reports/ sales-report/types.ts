export type WidgetKind = "numbers" | "chart" | "gauge" | "activity" | "battery";

export type Widget = {
  id: string;
  kind: WidgetKind;
  title: string;
  // Grid spans on a 12-col layout
  w: number; // 2..12
  h: number; // 2..12
};

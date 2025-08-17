"use client";
import NumbersWidget from "./NumbersWidget";
import PieWidget from "./PieWidget";
import GaugeWidget from "./GaugeWidget";

import BatteryWidget from "./BatteryWidget";
import { WidgetKind } from "../ sales-report/types";
import ActivityWidget from "./ ActivityWidget";


export const WIDGET_LIBRARY: { kind: WidgetKind; title: string; desc: string }[] = [
  { kind: "gauge", title: "Gauge", desc: "Track targets and quotas" },
  { kind: "activity", title: "Activity tracker", desc: "Highlight key activities" },
  { kind: "chart", title: "Chart", desc: "Visualize data" },
  { kind: "numbers", title: "Numbers", desc: "Quick view on sums / counts" },
  { kind: "battery", title: "Battery", desc: "Progress at a glance" },
];

export const RENDERERS: Record<WidgetKind, React.FC> = {
  numbers: NumbersWidget,
  chart: PieWidget,
  gauge: GaugeWidget,
  activity: ActivityWidget,
  battery: BatteryWidget,
};

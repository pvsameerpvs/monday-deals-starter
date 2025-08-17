import type { ComponentType } from "react";

import TableView from "@/components/deals/views/TableView";
import ActivityTrackerView from "@/components/deals/views/ActivityTrackerView";
import NewView from "@/components/deals/views/NewView";
import GanttView from "@/components/deals/views/GanttView";
import ChartView from "@/components/deals/views/ChartView";
import CalendarView from "@/components/deals/views/CalendarView";
import KanbanView from "@/components/deals/views/KanbanView";
import FileGalleryView from "@/components/deals/views/FileGalleryView";
import FormView from "@/components/deals/views/FormView";
import CustomizableView from "@/components/deals/views/CustomizableView";

export const VIEW_REGISTRY: Record<string, ComponentType<any>> = {
  Table: TableView,
  "Activity tracker": ActivityTrackerView,
  New: NewView,
  Gantt: GanttView,
  Chart: ChartView,
  Calendar: CalendarView,
  Kanban: KanbanView,
  "File gallery": FileGalleryView,
  Form: FormView,
  "Customizable view": CustomizableView,
};

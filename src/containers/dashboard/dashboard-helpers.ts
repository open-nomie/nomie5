import { strToColor } from "../../components/dymoji/dymoji";
import type { Widget, WidgetConfig } from "../../modules/dashboard/widget";
import dayjs from "dayjs";
import type { Dayjs } from "dayjs";
import type { Dashboard } from "../../modules/dashboard/dashboard";

export function getWidgetColor(block: Widget) {
  if (block.element && block.element.obj && block.element.obj.color) {
    return block.element.obj.color;
  } else {
    return strToColor(block.element.id);
  }
}

export function formatValue(value, block: WidgetConfig): string {
  if (block.element.obj && block.element.obj.displayValue) {
    return block.element.obj.displayValue(value);
  } else {
    return value;
  }
}

// export function getDashboardStartEndDates(dboard: Dashboard): { start: Dayjs; end: Dayjs } {
//   let start = dayjs().add(10, "year");
//   let end = dayjs().subtract(10, "year");
//   // Loop over the blocks
//   dboard.widgets.forEach((widget: Widget) => {
//     // Get the date range for this block
//     let dateRange = widget.getDateRange();
//     // Start is first element
//     let widgetStart = dateRange[0];
//     // End is last element
//     let widgetEnd = dateRange[1];
//     // If block end is greater (in the future) than end
//     // save it as the winner
//     if (widgetEnd.toDate() > end.toDate()) {
//       end = widgetEnd;
//     }
//     // If block start is less than (more in the past) then
//     // set it as the winner
//     if (widgetStart.toDate() < start.toDate()) {
//       start = widgetStart;
//     }
//   });
//   // Return Earliest and latest dates
//   console.log("Dashboard Start and End", { start, end });
//   return { start, end };
// }

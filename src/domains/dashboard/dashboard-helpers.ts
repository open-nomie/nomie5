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

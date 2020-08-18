import { strToColor } from "../../components/dymoji/dymoji";
import type { Widget, IWidget } from "../../modules/dashboard/widget";

export function getWidgetColor(block: Widget) {
  if (block.element && block.element.obj && block.element.obj.color) {
    return block.element.obj.color;
  } else {
    return strToColor(block.element.id);
  }
}

export function formatValue(value, block: IWidget): string {
  if (block.element.obj && block.element.obj.displayValue) {
    return block.element.obj.displayValue(value);
  } else {
    return value;
  }
}

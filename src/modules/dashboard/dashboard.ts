import nid from "../nid/nid";
import { Widget } from "./widget";
import type { WidgetConfig } from "./widget";
export class Dashboard {
  label: string;
  widgets: Array<Widget>;
  id: string;
  created?: Date;

  constructor(starter: any = {}) {
    this.label = starter.label || "Untitled";
    this.id = starter.id || nid();
    this.created = starter.created ? new Date(starter.created) : new Date();

    // Migrate from Blocks
    if (starter.blocks) {
      starter.widgets = starter.blocks;
      delete starter.blocks;
    }

    this.widgets = (starter.widgets || []).map((widget: WidgetConfig) => {
      return widget instanceof Widget ? widget : new Widget(widget);
    });
  }
}

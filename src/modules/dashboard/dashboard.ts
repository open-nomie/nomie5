import nid from "../nid/nid";
import { Widget } from "./widget";
import type { IWidget } from "./widget";
export class Dashboard {
  label: string;
  widgets: Array<IWidget>;
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

    this.widgets = (starter.widgets || []).map((widget: IWidget) => {
      return new Widget(widget);
    });
  }
}

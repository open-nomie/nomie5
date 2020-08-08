import nid from "../nid/nid";
import { Block } from "./block";
import type { IBlock } from "./block";
export class Dashboard {
  label: string;
  blocks: Array<IBlock>;
  id: string;
  created?: Date;

  constructor(starter: any = {}) {
    this.label = starter.label || "Untitled";
    this.id = starter.id || nid();
    this.created = starter.created ? new Date(starter.created) : new Date();
    this.blocks = (starter.blocks || []).map((block: IBlock) => {
      return new Block(block);
    });
  }
}

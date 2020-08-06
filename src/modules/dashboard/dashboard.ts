import dayjs from "dayjs";
import { Block, IBlock } from "./block";
import TrackableElement from "../../modules/trackable-element/trackable-element";
import nid from "../nid/nid";
export class Dashboard {
  label: string;
  blocks: Array<IBlock>;
  id: string;
  constructor(starter: any = {}) {
    this.label = starter.label || "Untitled";
    this.id = starter.id || nid();
    this.blocks = (starter.blocks || []).map((block) => {
      return new Block(block);
    });
  }
}

// interface ITimeFrame {
//   endOf?: string;
//   startOf?: string;
//   subtract?: Array<any>;
//   add?: Array<any>;
// }

// export interface IDashboardDate {
//   label?: string;
//   start?: ITimeFrame;
//   end?: ITimeFrame;
// }

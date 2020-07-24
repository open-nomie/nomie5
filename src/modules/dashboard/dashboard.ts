import dayjs from "dayjs";
import { Block, IBlock } from "./block";
import TrackableElement from "../../modules/trackable-element/trackable-element";

export class Dashboard {
  blocks: Array<IBlock>;
  constructor(starter: any = {}) {
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

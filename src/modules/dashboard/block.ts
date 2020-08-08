import TrackableElement, { ITrackableElement } from "../../modules/trackable-element/trackable-element";
import dayjs, { Dayjs, OpUnitType } from "dayjs";
import nid from "../nid/nid";
import type NLog from "../nomie-log/nomie-log";
import { strToColor } from "../../components/dymoji/dymoji";
/**
 * Block Date
 * The blockdate is either the start or end of a TimeFrame
 * They can have a hard coded date, or be dynamically set
 * using add, subtract, startOf and endOf
 */
export interface IBlockDate {
  date?: Dayjs;
  add?: Array<any>;
  subtract?: Array<any>;
  startOf?: any;
  endOf?: any;
  toDate(): Date;
}

export class BlockDate implements IBlockDate {
  date?: Dayjs;
  subtract?: Array<any>;
  add?: Array<any>;
  endOf?: OpUnitType;
  startOf?: OpUnitType;

  constructor(part: IBlockDate) {
    this.date = part.date;
    this.subtract = part.subtract;
    this.add = part.add;
    this.endOf = part.endOf;
    this.startOf = part.startOf;
  }

  public toDate() {
    let date = dayjs();
    if (this.subtract instanceof Array) {
      date = date.subtract(this.subtract[0], this.subtract[1]);
    }
    if (this.add instanceof Array) {
      date = date.add(this.subtract[0], this.subtract[1]);
    }
    if (this.startOf) {
      date = date.startOf(this.startOf);
    }
    if (this.endOf) {
      date = date.endOf(this.endOf);
    }
    return date.toDate();
  }
}

/**
 * Time Frame
 * A Timeframe is a start and end BlockDate
 * as well as a label, and ID to allow for easily
 * setting up pre-defined settings
 * TODO: Make a custom option
 */

export interface IBlockTimeFrame {
  id?: string;
  label?: string;
  start: IBlockDate;
  end: IBlockDate;
  getLabel(): string;
}

export class BlockTimeFrame {
  id?: string;
  label?: string;
  start: BlockDate;
  end: BlockDate;

  constructor(payload: IBlockTimeFrame) {
    if (payload) {
      this.label = payload.label;
      this.start = new BlockDate(payload.start);
      this.end = new BlockDate(payload.end);
      this.id = payload.id;
    }
    this.id = this.id || nid();
  }
  public getLabel(): string {
    let defaultDate = this.start.date ? `${this.start.date.format("MMM DD")} to ${this.end.date.format("MMM DD YYYY")}` : "Unknown";
    return this.label || defaultDate;
  }
}

/**
 * Block
 * The Block is a central object that defines
 * what we're showing, what type of block we should show,
 * and what the timeframe is.
 */

export interface IBlock {
  element: ITrackableElement;
  id?: string;
  type: string;
  timeRange: IBlockTimeFrame;
  includeAvg?: boolean;
  description?: string;
  compareValue?: number;
  compareOverColor?: string;
  compareUnderColor?: string;
  value?: any;
  math?: string;
  logs?: Array<NLog>;
  positivity?: any;
  stats?: any;
  lastUsed?: any;
  getTitle(): string;
  getLabel(): string;
  isValid(): boolean;
  toObject(): any;
  getStartDate(): Date;
  getEndDate(): any;
  getDateRange(): Array<Date>;
}

export class Block implements IBlock {
  element: ITrackableElement;
  id?: string;
  type: string = "value";
  timeRange: IBlockTimeFrame;
  includeAvg?: boolean = false;
  description?: string;
  compareValue?: number;
  compareOverColor?: string;
  compareUnderColor?: string;
  _editing?: any;
  math?: string;
  logs?: Array<NLog>;
  positivity?: any;
  stats?: any;
  lastUsed?: any;

  constructor(payload?: IBlock) {
    if (payload) {
      this.id = payload.id || nid();
      this.type = payload.type;
      this.description = payload.description;

      if (typeof payload.compareValue == "string") {
        payload.compareValue = parseFloat(payload.compareValue);
      }
      this.compareValue = payload.compareValue;
      this.compareOverColor = payload.compareOverColor;
      this.compareUnderColor = payload.compareUnderColor;

      this.includeAvg = payload.includeAvg ? true : false;

      if (payload.timeRange) {
        this.timeRange = new BlockTimeFrame(payload.timeRange);
      }

      if (payload.element) {
        this.element = new TrackableElement({ id: payload.element.id, type: payload.element.type });
      } else {
        this.element = new TrackableElement(payload.element);
      }
    } else {
      this.id = nid();
    }
  }
  getColor(): string {
    if (this.element && this.element.type == "tracker") {
      return this.element.obj.color;
    } else {
      return strToColor(this.element.id);
    }
  }
  getTitle(): string {
    if (this.element) {
      return this.element.id;
    } else {
      return "unknown";
    }
  }

  getLabel(): string {
    if (this.timeRange) {
      return this.timeRange.getLabel();
    } else {
      return "Unknown";
    }
  }

  isValid(): boolean {
    return this.type && this.id ? true : false;
  }

  toObject(): any {
    return JSON.parse(JSON.stringify(this));
  }

  getStartDate(): Date {
    if (this.timeRange && this.timeRange.start) {
      return this.timeRange.start.toDate();
    } else {
      return new Date();
    }
  }

  getEndDate() {
    if (this.timeRange && this.timeRange.end) {
      return this.timeRange.end.toDate();
    } else {
      return new Date();
    }
  }

  getDateRange() {
    return [this.getStartDate(), this.getEndDate()];
  }
}

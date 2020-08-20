import TrackableElement, { ITrackableElement } from "../trackable-element/trackable-element";
import dayjs, { Dayjs, OpUnitType } from "dayjs";
import nid from "../nid/nid";
import type NLog from "../nomie-log/nomie-log";
import { strToColor } from "../../components/dymoji/dymoji";
import { UserStore } from "../../store/user-store";
/**
 * Widget Date
 * The blockdate is either the start or end of a TimeFrame
 * They can have a hard coded date, or be dynamically set
 * using add, subtract, startOf and endOf
 */
export interface IWidgetDate {
  date?: Dayjs;
  add?: Array<any>;
  subtract?: Array<any>;
  startOf?: any;
  endOf?: any;
  toDate(): Date;
}

export class WidgetDate implements IWidgetDate {
  date?: Dayjs;
  subtract?: Array<any>;
  add?: Array<any>;
  endOf?: OpUnitType;
  startOf?: OpUnitType;

  constructor(part: IWidgetDate) {
    if (part) {
      this.date = part.date;
      this.subtract = part.subtract;
      this.add = part.add;
      this.endOf = part.endOf;
      this.startOf = part.startOf;
    }
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
 * A Timeframe is a start and end WidgetDate
 * as well as a label, and ID to allow for easily
 * setting up pre-defined settings
 * TODO: Make a custom option
 */

export interface IWidgetTimeFrame {
  id?: string;
  label?: string;
  start: IWidgetDate;
  end: IWidgetDate;
  getLabel(): string;
}

export class WidgetTimeFrame {
  id?: string;
  label?: string;
  start: WidgetDate;
  end: WidgetDate;

  constructor(payload: any = {}) {
    this.label = payload.label;
    this.start = new WidgetDate(payload.start);
    this.end = new WidgetDate(payload.end);
    this.id = payload.id;
    this.id = this.id || nid();
  }
  public getLabel(): string {
    let defaultDate = this.start.date ? `${this.start.date.format("MMM DD")} to ${this.end.date.format("MMM DD YYYY")}` : "Unknown";
    return this.label || defaultDate;
  }
}

/**
 * Widget
 * The Widget is a central object that defines
 * what we're showing, what type of block we should show,
 * and what the timeframe is.
 */

export interface IWidget {
  element: ITrackableElement;
  id?: string;
  size?: "sm" | "md" | "lg";
  type: string;
  timeRange: IWidgetTimeFrame;
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

export class Widget implements IWidget {
  element: ITrackableElement;
  id?: string;
  type: string = "value";
  size?: "sm" | "md" | "lg";
  timeRange: IWidgetTimeFrame;
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

  constructor(payload?: IWidget) {
    if (payload) {
      this.id = payload.id || nid();
      this.type = payload.type;
      this.description = payload.description;

      this.size = payload.size || "md";

      if (typeof payload.compareValue == "string") {
        payload.compareValue = parseFloat(payload.compareValue);
      }
      this.compareValue = payload.compareValue;
      this.compareOverColor = payload.compareOverColor;
      this.compareUnderColor = payload.compareUnderColor;

      this.includeAvg = payload.includeAvg ? true : false;

      if (payload.timeRange) {
        this.timeRange = new WidgetTimeFrame(payload.timeRange);
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

  private getStartOfWeek() {
    let startOfWeek = dayjs().startOf("week");
    if (UserStore.meta().firstDayOfWeek == "1") {
      startOfWeek = startOfWeek.subtract(1, "day");
    }
    return startOfWeek;
  }

  /**
   * jank alert
   * Since there isn't a good way to paramaterize the start of the week
   * since we have monday and sunday, I'm just going to
   * hard code the this-week and last-week conditions.
   */

  getStartDate(): Date {
    if (this.timeRange && ["this-week", "last-week"].indexOf(this.timeRange.id) > -1) {
      // This is hacky
      let startOfWeek = this.getStartOfWeek();
      switch (this.timeRange.id) {
        case "this-week":
          return startOfWeek.startOf("day").toDate();
          break;
        case "last-week":
          return startOfWeek.startOf("day").subtract(7, "day").toDate();
          break;
      }
    } else if (this.timeRange && this.timeRange.start) {
      return this.timeRange.start.toDate();
    } else {
      return new Date();
    }
  }

  getEndDate() {
    if (this.timeRange && ["this-week", "last-week"].indexOf(this.timeRange.id) > -1) {
      // This is hacky
      let startOfWeek = this.getStartOfWeek();
      switch (this.timeRange.id) {
        case "this-week":
          return startOfWeek.add(7, "day").endOf("day").toDate();
          break;
        case "last-week":
          return startOfWeek.add(7, "day").subtract(1, "week").endOf("day").toDate();
          break;
      }
    } else if (this.timeRange && this.timeRange.end) {
      return this.timeRange.end.toDate();
    } else {
      return new Date();
    }
  }

  getDateRange() {
    return [this.getStartDate(), this.getEndDate()];
  }
}

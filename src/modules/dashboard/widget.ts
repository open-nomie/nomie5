import TrackableElement from "../trackable-element/trackable-element";
import type { ITrackableElement } from "../trackable-element/trackable-element";
import dayjs, { Dayjs, OpUnitType } from "dayjs";
import nid from "../nid/nid";
import type NLog from "../nomie-log/nomie-log";
import { strToColor } from "../../components/dymoji/dymoji";
import { UserStore } from "../../store/user-store";
import { truncateText } from "../../utils/text/text";
import NDate from "../../utils/ndate/ndate";
/**
 * Widget Date
 * The blockdate is either the start or end of a TimeFrame
 * They can have a hard coded date, or be dynamically set
 * using add, subtract, startOf and endOf
 */
export interface WidgetDateConfig {
  date?: Dayjs;
  add?: Array<any>;
  subtract?: Array<any>;
  startOf?: OpUnitType;
  endOf?: OpUnitType;
}

export class WidgetDate {
  date?: Dayjs;
  add?: Array<any>;
  subtract?: Array<any>;
  startOf?: OpUnitType;
  endOf?: OpUnitType;

  constructor(part: WidgetDateConfig) {
    if (part) {
      this.date = part.date;
      this.subtract = part.subtract;
      this.add = part.add;
      this.endOf = part.endOf;
      this.startOf = part.startOf;
    }
  }

  public toDate(): Dayjs {
    let date = this.date ? this.date : dayjs();
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
    return date;
  }
}

/**
 * Time Frame
 * A Timeframe is a start and end WidgetDate
 * as well as a label, and ID to allow for easily
 * setting up pre-defined settings
 * TODO: Make a custom option
 */

export interface WidgetTimeFrameConfig {
  id?: string;
  label?: string;
  start?: WidgetDateConfig;
  end?: WidgetDateConfig;
}

export class WidgetTimeFrame {
  id?: string;
  label?: string;
  start: WidgetDate;
  end: WidgetDate;

  constructor(payload: WidgetTimeFrameConfig) {
    this.label = payload.label;
    this.start = new WidgetDate(payload.start);
    this.end = new WidgetDate(payload.end);
    this.id = payload.id || nid();
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

export interface WidgetConfig {
  element?: ITrackableElement;
  id?: string;
  size?: "sm" | "md" | "lg";
  type?: string;
  timeRange?: WidgetTimeFrame;
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
}

export class Widget {
  public _editing?: any;
  public compareOverColor?: string;
  public compareUnderColor?: string;
  public compareValue?: number;
  public dateFormat: string;
  public description?: string;
  public element?: TrackableElement;
  public id?: string;
  public includeAvg?: boolean = false;
  public lastUsed?: any;
  public logs?: Array<NLog>;
  public math?: string;
  public positivity?: any;
  public size?: "sm" | "md" | "lg" = "md";
  public stats?: any;
  public timeFormat?: string = "h:mm a";
  public timeRange?: WidgetTimeFrame;
  public type?: string = "value";

  constructor(payload?: WidgetConfig) {
    payload = payload || {};

    this.id = payload.id || nid();
    this.type = payload.type;
    this.description = payload.description;
    this.size = payload.size || "md";
    // Compare Value
    if (typeof payload.compareValue == "string") {
      payload.compareValue = parseFloat(payload.compareValue);
    }
    this.compareValue = payload.compareValue;
    this.compareOverColor = payload.compareOverColor;
    this.compareUnderColor = payload.compareUnderColor;
    // Including Avg
    this.includeAvg = payload.includeAvg ? true : false;
    // If a timeRange
    if (payload.timeRange) {
      this.timeRange = new WidgetTimeFrame(payload.timeRange);
    }
    // If an element
    if (payload.element) {
      this.element = new TrackableElement({ id: payload.element.id, type: payload.element.type });
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
    if (this.type == "text") {
      return truncateText(this.description, 30);
    } else if (this.element && this.element.id) {
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

  private getStartOfWeek(weekStartsOn: "1" | "2"): Dayjs {
    let start = NDate.setFirstDayOfWeek(weekStartsOn).getFirstDayOfWeek();
    let startOfWeek = dayjs(start).startOf("day");
    return startOfWeek;
  }

  private getEndOfWeek(weekStartsOn: "1" | "2"): Dayjs {
    let end = NDate.setFirstDayOfWeek(weekStartsOn).getLastDayOfWeek();
    let endOfWeek = end.endOf("day");
    return endOfWeek;
  }

  /**
   * jank alert
   * Since there isn't a good way to paramaterize the start of the week
   * since we have monday and sunday, I'm just going to
   * hard code the this-week and last-week conditions.
   */

  getStartDate(weekStartsOn: "1" | "2"): Dayjs {
    if (this.timeRange && ["this-week", "last-week"].indexOf(this.timeRange.id) > -1) {
      // This is hacky
      let startOfWeek = this.getStartOfWeek(weekStartsOn);
      switch (this.timeRange.id) {
        case "this-week":
          return startOfWeek.startOf("day");
          break;
        case "last-week":
          return startOfWeek.startOf("day").subtract(7, "day");
          break;
      }
    } else if (this.timeRange && this.timeRange.start && this.timeRange.start.date) {
      // If a set Date
      return this.timeRange.start.date;
    } else if (this.timeRange && this.timeRange.start) {
      return this.timeRange.start.toDate();
    } else {
      return dayjs().startOf("day");
    }
  }

  getEndDate(weekStartsOn: "1" | "2") {
    if (this.timeRange && ["this-week", "last-week"].indexOf(this.timeRange.id) > -1) {
      // This is hacky
      let endOfWeek = this.getEndOfWeek(weekStartsOn);
      switch (this.timeRange.id) {
        case "this-week":
          return endOfWeek.endOf("day");
          break;
        case "last-week":
          return endOfWeek.subtract(1, "week").endOf("day");
          break;
      }
    } else if (this.timeRange && this.timeRange.end && this.timeRange.end.date) {
      return this.timeRange.end.date;
    } else if (this.timeRange && this.timeRange.end) {
      return this.timeRange.end.toDate();
    } else {
      return dayjs().endOf("day");
    }
  }

  getDateRange(weekStartsOn: "1" | "2") {
    return [this.getStartDate(weekStartsOn), this.getEndDate(weekStartsOn)];
  }
}

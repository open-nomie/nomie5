import dayjs from "dayjs";

import TrackableElement from "../../modules/trackable-element/trackable-element";

export class DashboardDatePart {
  constructor(part) {
    if (part) {
      if (part instanceof Date) {
        this.date = dayjs(part);
      } else if (part instanceof String) {
        this.date = dayjs(new Date(part));
      } else if (part instanceof Number) {
        this.date = dayjs(new Date(part));
      } else if (typeof part == "object") {
        this.date = this.processDateObject(part);
      }
    } else {
      this.date = dayjs();
    }
  }
  processDateObject(dateObj) {
    let date = dayjs();
    if (dateObj.subtract instanceof Array) {
      date = date.subtract(dateObj.subtract[0], dateObj.subtract[1]);
    }
    if (dateObj.add instanceof Array) {
      date = date.add(dateObj.subtract[0], dateObj.subtract[1]);
    }
    if (dateObj.startOf) {
      date = date.startOf(dateObj.startOf);
    }
    if (dateObj.endOf) {
      date = date.endOf(dateObj.endOf);
    }
    return date;
  }
}
export class DashboardDate {
  constructor(payload = {}) {
    this.label = payload.label;
    this.start = new DashboardDatePart(payload.start);
    this.end = new DashboardDatePart(payload.end);
  }
  getLabel() {
    return this.label || `${this.start.date.format("MMM DD")} to ${this.end.date.format("MMM DD YYYY")}`;
  }
}

export class Block {
  constructor(payload = {}) {
    payload.element = payload.element || {};
    this.element = new TrackableElement({ id: payload.element.id, type: payload.element.type });
    this.id = payload.id;
    this.type = payload.type;
    this.dateRange = payload.dateRange ? new DashboardDate(payload.dateRange) : new DashboardDate();
  }

  getLabel() {
    return this.dateRange.getLabel();
  }

  isValid() {
    return this.type && this.id;
  }

  toObject() {
    return JSON.parse(JSON.stringify(this));
  }
}

// {
//   element: "tracker",
//   id: "mood",
//   type: "value",
//   date: {
//     label: "This Week",
//     start: {
//       subtract: [7, "days"]
//     },
//     end: null
//   }
// },
// {
//   element: "tracker",
//   id: "mood",
//   type: "chart"
// }

import dayjs, { Dayjs } from "dayjs";
// Modules
import Tracker from "../tracker/tracker";
import NomieLog from "../nomie-log/nomie-log";
import Log from "../nomie-log/nomie-log";
import logFilter from "../log-filter/log-filter";
// Utils
import Logger from "../../utils/log/log";
import _math from "../../utils/math/math";
import type TrackableElement from "../trackable-element/trackable-element";
import type { ITrackableElementType } from "../trackable-element/trackable-element";

import getDayOfWeek from "./day-of-week";
import getTimeOfDay from "./time-of-day";
import type { ITrackerMath } from "../tracker/tracker";
import math from "../../utils/math/math";
import type NLog from "../nomie-log/nomie-log";

export type IStatsChartUnit = "day" | "week" | "month" | "quarter" | "year";
export type IStatsChartMode = "d" | "w" | "m" | "q" | "y";
export interface IStatDow {
  count: number;
  percent: number;
  values: Array<number>;
}
export interface IStatsChartLabel {
  x: string;
}
export interface IStatsChartValue {
  x: string;
  y: number;
  date: Dayjs;
  unit: IStatsChartUnit;
}
interface IDow {
  mon: IStatDow;
  tue: IStatDow;
  wed: IStatDow;
  thu: IStatDow;
  fri: IStatDow;
  sat: IStatDow;
  sun: IStatDow;
}

export interface IStatsValueMap {
  [key: string]: Array<number>;
}

export interface IStatsTodUnit {
  count: number;
  values: Array<number>;
  start: number;
  end: number;
  percent: number;
}
export interface IStatsTod {
  afternoon: IStatsTodUnit;
  early_morning: IStatsTodUnit;
  evening: IStatsTodUnit;
  morning: IStatsTodUnit;
  night: IStatsTodUnit;
}

export interface IStatsMaxMin {
  date: Date;
  dateKey: string;
  value: number;
}

export interface IStats {
  trackableElement: TrackableElement;
  rows: Array<NomieLog>;
  type: ITrackableElementType;
  math: ITrackerMath;
  avg: number;
  sum: number;
  chart: {
    labels: Array<IStatsChartLabel>;
    values: Array<IStatsChartValue>;
    mode: IStatsChartMode;
  };
  dow: IDow;
  tod: IStatsTod;
  min: IStatsMaxMin;
  max: IStatsMaxMin;
  distance?: number;
  streak?: any;
  _stats?: StatsProcessor;
}

const console = new Logger("📊 V5 Stats");

export default class StatsProcessor implements IStats {
  trackableElement: TrackableElement;
  rows: Array<NomieLog>;
  type: ITrackableElementType;
  math: ITrackerMath;
  avg: number;
  sum: number;
  chart: {
    labels: Array<IStatsChartLabel>;
    values: Array<IStatsChartValue>;
    mode: IStatsChartMode;
  };
  dow: IDow;
  tod: IStatsTod;
  min: IStatsMaxMin;
  max: IStatsMaxMin;
  fromDate: Dayjs;
  toDate: Dayjs;
  mode: IStatsChartMode;
  is24Hour: boolean;
  streak?: any;
  _stats?: StatsProcessor;
  valueMap: IStatsValueMap;

  constructor(starter: any = {}) {
    // Set Defaults
    this.rows = starter.rows || [];
    this.fromDate = starter.fromDate || dayjs().subtract(1, "week");
    this.toDate = starter.toDate || dayjs();
    this.mode = starter.mode || "w";
    this.trackableElement = starter.trackableElement || null;
    this.is24Hour = starter.is24Hour || false;
    this.math = starter.math || "sum";
  }

  init(config) {
    this.fromDate = config.fromDate || this.fromDate;
    this.toDate = config.toDate || this.toDate;
    this.mode = config.mode || this.mode;
    this.trackableElement = config.trackableElement || this.trackableElement;
    this.is24Hour = config.is24Hour || this.is24Hour;
    this.rows = config.rows || this.rows;
    if (config.math !== this.math && config.math) {
      this.math = config.math;
    }
    try {
      this.rows = logFilter(this.rows, { search: this.trackableElement.toSearchTerm() });
    } catch (e) {
      console.error(e.message);
      console.error(`Filtering logs failed, is a trackableElement provided?`, this.trackableElement);
    }
  }

  /**
   * Generate Results from a Config
   * @param {Object} config
   */
  generate(config = {}) {
    this.init(config);
    return this.generateResults();
  }

  /**
   * getUnitFormat
   * Get Unit dayjs Format
   */
  getUnitFormat() {
    let unitFormat;
    if (this.mode == "d") {
      unitFormat = "H";
    } else if (this.mode == "w" || this.mode == "m") {
      unitFormat = "YYYY-MM-DD";
    } else if (this.mode == "q") {
      unitFormat = "YYYY-w";
    } else if (this.mode == "y") {
      unitFormat = "YYYY-MM";
    }
    return unitFormat;
  }

  getDayMap(): { [key: string]: number } {
    let map: any = {};
    let diff: number = Math.abs(this.fromDate.diff(this.toDate, "day")) + 1;
    for (var i = 1; i < diff; i++) {
      map[this.fromDate.add(i, "day").format("YYYY-MM-DD")] = 0;
    }
    return map;
  }

  getStreakData(): {
    coverage: number;
    days: number;
    on: number;
    off: number;
    streak: number;
  } {
    let dayMap = this.getDayMap();
    this.rows.forEach((row: NLog) => {
      let key = dayjs(new Date(row.end)).format("YYYY-MM-DD");
      if (dayMap[key]) {
        dayMap[key]++;
      }
    });
    // loop over totals
    let totals = Object.keys(dayMap)
      .map((dateKey: string) => {
        return {
          key: dateKey,
          count: dayMap[dateKey],
        };
      })
      .sort((a, b) => {
        return a.key < b.key ? 1 : -1;
      });
    // Find the first index with 0 count.
    let firstZero = totals.findIndex((row) => row.count == 0);
    // If -1 it's completed every day
    if (firstZero == -1) {
      return {
        coverage: 1,
        streak: Object.keys(dayMap).length,
        days: totals.length,
        on: totals.length,
        off: 0,
      };
    } else {
      let totalOn = totals.filter((row) => {
        return row.count > 0;
      }).length;
      let totalOff = totals.filter((row) => {
        return row.count == 0;
      }).length;
      // Return the Streak payload
      return {
        coverage: math.percentage(totalOn, totalOff),
        streak: firstZero,
        days: totals.length,
        on: totalOn,
        off: totals.filter((row) => {
          return row.count === 0;
        }).length,
      };
    }
  }

  public getScore(): { score: number; emoji: string } {
    let scores = [];
    this.rows.forEach((row) => {
      let score = row.score || row.calculateScore();
      scores.push(score);
    });
    let score = math.sum(scores);
    if (score > 0) {
      return {
        score,
        emoji: "😄",
      };
    } else if (score < 0) {
      return {
        score,
        emoji: "😞",
      };
    } else {
      return {
        score: 0,
        emoji: "😐",
      };
    }
  }

  /**
   * Generate a Value Map
   * {
   *    '2020-03-02': [1,2],
   *    '2020-03-01: [1]
   * }
   * @param {Array} rows
   */
  getValueMap(overrideRows, _unitFormat?: string): any {
    let rows = overrideRows || this.rows;
    let valueMap = {};

    // Loop Over each Row
    rows.forEach((row) => {
      // Expand Row if not expanded
      row = row instanceof NomieLog ? row : new NomieLog(row);
      if (!row.trackers) {
        row.getMeta();
      }
      let unitFormat = _unitFormat || this.getUnitFormat(); // get unit for time format
      let unitKey = dayjs(row.end).format(unitFormat); // generate unit Key
      // Fill in the Value Map with an empty array if not exist
      valueMap[unitKey] = valueMap[unitKey] || [];
      // If it's a person or context, just count 1
      if (this.trackableElement.type == "person" || this.trackableElement.type == "context") {
        valueMap[unitKey].push(1);
      } else {
        // It's a tracker
        row.trackers
          // filter only matches for thie trackableElement
          .filter((te) => {
            return te.id == this.trackableElement.id;
          })
          .forEach((trackerElement) => {
            valueMap[unitKey].push(trackerElement.value);
          });
      }
    });
    return valueMap;
  }

  /**
   * Get the Min and Max values
   * from a valueMap
   * @param {Object} valueMap
   */

  getMinMaxFromValueMap(valueMap) {
    let min = { value: null, dateKey: null, date: null };
    let max = { value: 0, dateKey: null, date: null };
    let dates = [];
    let values = [];
    Object.keys(valueMap).map((dateKey) => {
      let value;
      if (this.math === "sum") {
        value = _math.sum(valueMap[dateKey]);
      } else {
        value = _math.average(valueMap[dateKey]);
      }
      values.push(value);
      dates.push({ dateKey, value });
    });
    min.value = _math.min(values, false);
    max.value = _math.max(values);
    let maxDateFound = dates.find((d) => d.value == max.value);
    let minDateFound = dates.find((d) => d.value == min.value);
    min.date = minDateFound ? dayjs(minDateFound.dateKey).toDate() : new Date();
    min.dateKey = minDateFound ? minDateFound.dateKey : null;
    max.date = maxDateFound ? dayjs(maxDateFound.dateKey).toDate() : new Date();
    max.dateKey = maxDateFound ? maxDateFound.dateKey : null;

    return { min, max };
  }

  /**
   * Get Related Items
   * @param {Array} rows NomieLog
   */
  getRelated(overrideRows) {
    let rows = overrideRows || this.rows;
    let people = {};
    let context = {};
    let tags = {};

    this.rows.forEach((row: NomieLog) => {
      if (!row.trackers) {
        row.getMeta();
      }
      row.trackers.forEach((trackerElement) => {
        tags[trackerElement.id] = tags[trackerElement.id] || 0;
        tags[trackerElement.id]++;
      });
      row.people.forEach((personElement) => {
        people[personElement.id] = people[personElement.id] || 0;
        people[personElement.id]++;
      });
      row.context.forEach((contextElement) => {
        context[contextElement.id] = context[contextElement.id] || 0;
        context[contextElement.id]++;
      });
    });

    const returnMap = (base, type, prefix) => {
      return Object.keys(base).map((elementId) => {
        return {
          count: base[elementId],
          type: type,
          value: elementId,
          search: `${prefix}${elementId}`,
        };
      });
    };

    let peopleArr = returnMap(people, "person", "@");
    let tagArr = returnMap(tags, "tracker", "#");
    let contextArr = returnMap(context, "context", "+");

    let relatedArr = [...peopleArr, ...tagArr, ...contextArr].sort((a, b) => {
      return a.count < b.count ? 1 : -1;
    });

    return relatedArr;
  }

  /**
   * getChartDataByType
   * Generate chart data for a set of options
   *
   * @param {*} unit // hour, day, month, year
   * @param {*} timeFormat // format of the day
   * @param {*} labelFormat // label format dayjs
   * @param {*} valueMapTotals // totals from the valuemap
   */
  getChartDataByType(unit, timeFormat, labelFormat, valueMapTotals) {
    let labels = []; // Holds the labels for the chart
    let values = []; // holds the values for the cahrt
    let unitValues = valueMapTotals.days; // Each of the individual x units for the chart
    // Get start

    let from = unit == "hour" ? this.toDate.startOf("day") : this.fromDate;
    // Get End
    let to = unit == "hour" ? this.toDate.endOf("day") : this.toDate;
    // Get Length between to and fromt
    let diff = to.diff(from, unit);
    // Loop over each diff
    for (var i = 1; i <= diff; i++) {
      // Get the unit format
      const unitDate = dayjs(from).add(i, unit);
      // Generate the key
      let key = unitDate.format(timeFormat);
      // Generate a label
      let label = unitDate.format(labelFormat);
      // If our unitValues map has our key we will
      let value;
      // Get the value if it exists
      if (unitValues.hasOwnProperty(key)) {
        // Is this a sum or a average?
        value = this.math == "sum" ? unitValues[key].sum : unitValues[key].avg;
      }
      // Push the label
      labels.push({ x: label });
      // Push the value
      values.push({ x: label, y: value || 0, date: unitDate, unit });
    }
    // Return labels and values
    return {
      labels,
      values,
    };
  }

  /**
   * getChartData
   * returns the chart data fro a given type
   * @param {*} valueMapTotals
   */
  getChartData(valueMapTotals, modeOverride?: "d" | "w" | "m" | "q" | "y") {
    // If it's a date mode
    let mode = modeOverride || this.mode;
    if (mode == "d") {
      let { labels, values } = this.getChartDataByType("hour", "H", this.is24Hour ? "H" : "ha", valueMapTotals);

      return {
        mode: mode,
        labels,
        values,
      };
      // If it's a week mode
    } else if (this.mode == "w") {
      let { labels, values } = this.getChartDataByType("day", "YYYY-MM-DD", "dd Do", valueMapTotals);
      return {
        mode: mode,
        labels,
        values,
      };
      // if it's a month mode
    } else if (mode == "m") {
      let { labels, values } = this.getChartDataByType("day", "YYYY-MM-DD", "M/D", valueMapTotals);
      return {
        mode: mode,
        labels,
        values,
      };
      // If it's a year mode
    } else if (mode == "q") {
      let { labels, values } = this.getChartDataByType("week", "YYYY-w", "Ww", valueMapTotals);
      return {
        mode: mode,
        labels,
        values,
      };
      // If it's a year mode
    } else if (mode == "y") {
      let { labels, values } = this.getChartDataByType("month", "YYYY-MM", "MMM", valueMapTotals);
      return {
        mode: mode,
        labels,
        values,
      };
    }
  } // end to Chart Data;

  getTracker() {
    if (this.trackableElement.obj) {
      return new Tracker(this.trackableElement.obj);
    } else {
      return new Tracker({ tag: this.trackableElement.id });
    }
  }

  getValueMapTotals(valueMap) {
    let newMap = {
      sum: 0,
      avg: 0,
      days: {
        ...valueMap, // put the valuemap in this new map
      },
    };
    // Hold all values for total sum and avg
    let allValues = [];
    // Loop over the days provided
    Object.keys(newMap.days).forEach((date) => {
      let values = newMap.days[date];
      // If we should ignore zeros, then
      // filter them out.
      let ignoreZeros = this.getTracker().ignore_zeros;
      if (ignoreZeros) {
        values = values.filter((v) => {
          return v !== 0 ? true : false;
        });
      }
      // Let's calcuate the days total
      if (values.length) {
        // If it's sum - add them all up
        if (this.math === "sum") {
          allValues.push(_math.sum(values));
        } else {
          // Else add it to the array for average lating
          allValues = [...allValues, ...values];
        }
      }
      // Sum and Avg this day
      newMap.days[date] = {
        sum: _math.sum(values),
        avg: _math.average(values),
      };
    }); // end loop over each day

    newMap.sum = _math.sum(allValues);
    newMap.avg = _math.average(allValues, true);

    return newMap;
  }

  generateResults(): IStats {
    this.valueMap = this.getValueMap(this.rows);
    let valueMapTotals = this.getValueMapTotals(this.valueMap);
    let minMax = this.getMinMaxFromValueMap(this.valueMap);
    let chart = this.getChartData(valueMapTotals);
    return {
      _stats: this,
      type: this.trackableElement.type,
      trackableElement: this.trackableElement,
      math: this.math,
      rows: this.rows,
      chart: chart,
      avg: valueMapTotals.avg,
      sum: valueMapTotals.sum,
      min: minMax.min,
      max: minMax.max,
      // streak: this.getStreakData(),
      dow: getDayOfWeek(this.rows), // day of week
      tod: getTimeOfDay(this.rows), // time of day
    };
  }
}

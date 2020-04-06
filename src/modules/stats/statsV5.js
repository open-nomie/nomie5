import dayjs from "dayjs";
// Modules
import Tracker from "../tracker/tracker";
import Log from "../nomie-log/nomie-log";
// Utils
import Logger from "../../utils/log/log";
import math from "../../utils/math/math";
import regex from "../../utils/regex";

export default class StatsProcessor {
  constructor(starter = {}) {
    this.rows = starter.rows || [];
    this.fromDate = starter.fromDate || dayjs().subtract(1, "week");
    this.toDate = starter.toDate || dayjs();
    this.mode = starter.mode || "w";
    this.tracker = starter.tracker || null;
  }

  generate(config = {}) {
    this.rows = config.rows || this.rows;
    this.fromDate = config.fromDate || this.fromDate;
    this.toDate = config.toDate || this.toDate;
    this.mode = config.mode || this.mode;
    this.tracker = config.tracker || this.tracker;
    return this.generateResults();
  }

  getUnitFormat() {
    let unitFormat;
    if (this.mode == "d") {
      unitFormat = "HH";
    } else if (this.mode == "w" || this.mode == "m") {
      unitFormat = "YYYY-MM-DD";
    } else if (this.mode == "y") {
      unitFormat = "YYYY-MM";
    }
    return unitFormat;
  }

  /**
   * Generate a Value Map
   * {
   *    '2020-03-02': [1,2],
   *    '2020-03-01: [1]
   * }
   * @param {Array} rows
   */
  getValueMap(rows) {
    let valueMap = {};

    // Loop Over each Row
    rows.forEach((row) => {
      // Expand Row if not expanded
      if (!row.trackers) {
        row.expand();
      }
      let unitFormat = this.getUnitFormat(); // get unit for time format
      let unitKey = dayjs(row.end).format(unitFormat); // generate unit Key
      // Fill in the Value Map with an empty array if not exist
      valueMap[unitKey] = valueMap[unitKey] || [];
      // If it's a person or context, just count 1
      if (this.tracker.type == "person" || this.tracker.type == "context") {
        valueMap[unitKey].push(1);
      } else {
        // It's a tracker
        if (row.trackers[this.tracker.tag]) {
          let value = row.trackers[this.tracker.tag].value;
          value = isNaN(value) ? 0 : value;
          valueMap[unitKey].push(value);
        } else {
          valueMap[unitKey].push(1);
        }
      }
    });
    console.log("valueMap", valueMap);
    return valueMap;
  }

  /**
   * Get the Min and Max values
   * from a valueMap
   * @param {Object} valueMap
   */
  getMinMaxFromValueMap(valueMap) {
    let min = { value: null, dateKey: null, date: null };
    let max = { value: null, dateKey: null, date: null };
    let valueArray = Object.keys(valueMap)
      .map((dateKey) => {
        let value;

        if (this.getMath() === "sum") {
          value = math.sum(valueMap[dateKey]);
        } else {
          value = math.average(valueMap[dateKey]);
        }
        return {
          dateKey,
          value,
          date: dayjs(dateKey),
        };
      })
      .sort((a, b) => {
        return a.value < b.value ? -1 : 1;
      });

    if (valueArray.length) {
      min = valueArray[0];
      max = valueArray[valueArray.length - 1];
    }
    return { min, max };
  }

  // Generate Chart Data
  getChartDataByType(unit, timeFormat, labelFormat, valueMapTotals) {
    let labels = [];
    let values = [];
    let unitValues = valueMapTotals.days;

    let from = unit == "hour" ? this.fromDate.startOf("day") : this.fromDate;
    let to = unit == "hour" ? this.fromDate.endOf("day") : this.toDate;
    let diff = to.diff(from, unit);

    for (var i = 0; i < diff; i++) {
      const unitDate = dayjs(from).add(i, unit);
      let key = unitDate.format(timeFormat);
      let label = unitDate.format(labelFormat);
      if (unitValues.hasOwnProperty(key)) {
        const value = this.getMath() == "sum" ? unitValues[key].sum : unitValues[key].avg;
        labels.push({ x: label });
        values.push({ x: label, y: value });
      } else {
        labels.push({ x: label });
        values.push({ x: label, y: 0 });
      }
    }

    console.log("getChartDataByType", { diff, timeFormat, labelFormat, unitValues, timeExample: dayjs().format(timeFormat) });
    return {
      labels,
      values,
    };
  }

  getChartData(valueMapTotals) {
    if (this.mode == "d") {
      let { labels, values } = this.getChartDataByType("hour", "H", "H", valueMapTotals);
      return {
        mode: this.mode,
        labels,
        values,
      };
    } else if (this.mode == "w" || this.mode == "m") {
      let { labels, values } = this.getChartDataByType("day", "YYYY-MM-DD", "Do", valueMapTotals);
      return {
        mode: this.mode,
        labels,
        values,
      };
    } else if (this.mode == "y") {
      let { labels, values } = this.getChartDataByType("month", "YYYY-MM", "MMM", valueMapTotals);
      return {
        mode: this.mode,
        labels,
        values,
      };
    }
  } // end to Chart Data;

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
      let ignoreZeros = !this.tracker ? true : this.tracker.ignore_zeros;
      if (ignoreZeros) {
        values = values.filter((v) => {
          return v !== 0 ? true : false;
        });
      }
      // Let's calcuate the days total
      if (values.length) {
        // If it's sum - add them all up
        if (this.getMath() === "sum") {
          allValues.push(math.sum(values));
        } else {
          // Else add it to the array for average lating
          allValues = [...allValues, ...values];
        }
      }
      // Sum and Avg this day
      newMap.days[date] = {
        sum: math.sum(values),
        avg: math.average(values),
      };
    }); // end loop over each day

    newMap.sum = math.sum(allValues);
    newMap.avg = math.average(allValues);

    return newMap;
  }

  getMath() {
    return this.tracker.math || "sum";
  }

  generateResults() {
    let valueMap = this.getValueMap(this.rows);
    let valueMapTotals = this.getValueMapTotals(valueMap);
    let minMax = this.getMinMaxFromValueMap(valueMap);
    let chart = this.getChartData(valueMapTotals);
    return {
      tracker: this.tracker,
      type: this.tracker.type,
      math: this.getMath(),
      rows: this.rows,
      chart: chart,
      avg: valueMapTotals.avg,
      sum: valueMapTotals.sum,
      min: minMax.min,
      max: minMax.max,
    };
  }
}

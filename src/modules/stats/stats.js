// vendors
import dayjs from "dayjs";
// Modules
import Tracker from "../tracker/tracker";
import Log from "../nomie-log/nomie-log";
// Utils
import Logger from "../../utils/log/log";
import math from "../../utils/math/math";

const console = new Logger("📊 stats/overview");

export default class StatsProcessor {
  constructor(rows, tracker, date, caller) {
    caller = caller || "unknown";
    this.date = date || dayjs();
    this.rows = rows;
    this.tracker = tracker ? new Tracker(tracker) : null;
    this.valueMap = {}; // holder of days and array of values
    // Convert to Logs if not already
    this.initialize();
  }

  initialize() {
    //('Load()');
    this.rows = this.rows.map((row) => {
      let log = new Log(row);
      log.expand();
      return log;
    });
    // If we have a tracker - filter results for only that tracker
    if (this.tracker) {
      this.rows = this.rows.filter((row) => {
        return row.hasTracker(this.tracker.tag);
      });
    }
    // Setup Results Holder
    this.results = {
      year: {},
      month: {},
      day: {},
    };

    this.prepare();
  }

  useMath() {
    return !this.tracker ? "sum" : this.tracker.math;
  }

  gotoDate(date) {
    this.date = date;
    this.prepare();
    return this;
  }

  prepare() {
    // filter rows for only this tracker.
    this.results.year.count = this.rows.length;

    this.results.valueMap = this.getValueMap(this.rows);
    this.results.valueTotalMap = this.getValueMapTotals(this.results.valueMap);

    this.results.year.sum = this.results.valueTotalMap.sum;
    this.results.year.avg = this.results.valueTotalMap.avg;

    this.results.year.chart = this.toChartData("year");
    this.results.year = {
      ...this.results.year,
      ...this.getMinMaxFromValueMap(this.results.valueMap),
    };

    // Year is finished
    this.results.month = this.generate("month");
    this.results.day = this.generate("day");
  }

  date(date) {
    if (date) {
      if (dayjs.isDayjs(date)) {
        this.date = date;
      } else {
        this.date = dayjs(date);
      }
      return this.date;
    } else {
      // return the current
      return this.date;
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
      let ignoreZeros = !this.tracker ? true : this.tracker.ignore_zeros;
      if (ignoreZeros) {
        values = values.filter((v) => {
          return v !== 0 ? true : false;
        });
      }
      // Let's calcuate the days total
      if (values.length) {
        // If it's sum - add them all up
        if (this.useMath() === "sum") {
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

  getValueMap(rows) {
    let valueMap = {};
    rows.forEach((row) => {
      if (!row.trackers) {
        row.expand();
      }
      let dayKey = dayjs(row.end).format("YYYY-MM-DD");
      valueMap[dayKey] = valueMap[dayKey] || [];
      if (this.tracker) {
        if (row.trackers[this.tracker.tag]) {
          let value = row.trackers[this.tracker.tag].value;
          value = isNaN(value) ? 0 : value;
          valueMap[dayKey].push(value);
        }
      } else {
        // No Tracker Provided - just count them as 1;
        valueMap[dayKey].push(1);
      }
    });
    return valueMap;
  }

  getLocations(mode) {
    mode = mode || "year";
    let locations = {};
    this.getRows(mode).forEach((row) => {
      if (row.lat) {
        let key;
        if (mode === "year") {
          key = `${math.round(row.lat, 1000)},${math.round(row.lng, 1000)}`;
        } else {
          key = `${row.lat},${row.lng}`;
        }
        locations[key] = locations[key] || { lat: row.lat, lng: row.lng };
      }
    });
    return Object.keys(locations).map((key) => {
      return locations[key];
    });
  }

  getRows(mode) {
    return this.rows
      .filter((row) => {
        if (mode == "month") {
          let monthKey = new Date(row.end).getMonth();
          if (monthKey === this.date.month()) {
            return true;
          } else {
            return false;
          }
        } else if (mode == "day") {
          return this.date.toDate().toDateString() === new Date(row.end).toDateString();
        } else {
          return true;
        }
      })
      .sort((a, b) => {
        return a.end > b.end ? -1 : 1;
      });
  }

  getMinMaxFromValueMap(valueMap) {
    let min = { value: null, dateKey: null, date: null };
    let max = { value: null, dateKey: null, date: null };
    let valueArray = Object.keys(valueMap)
      .map((dateKey) => {
        let value;

        if (this.useMath() === "sum") {
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
  toChartData(mode) {
    // Chart needs an array of Pointsa nd Labels
    let chartData = {
      labels: [],
      points: [],
    };

    // Set Start to Null
    let start = null;
    let dayCount = 0;

    let hourMap = {};
    this.rows.forEach((row) => {
      let rowDate = dayjs(row.end);
      if (rowDate.format("YYYY-MM-DD") == this.date.format("YYYY-MM-DD")) {
        hourMap[rowDate.format("H")] = hourMap[rowDate.format("H")] || [];
      }
    });

    // If we're in a month
    if (mode === "month") {
      // Get number of days in month
      dayCount = this.date.endOf("month").toDate().getDate();
      // set start to start of month
      start = dayjs(this.date).subtract(1, "month");
      dayCount = start.diff(this.date, "day");
      // loop over days
      for (let i = 0; i < dayCount; i++) {
        // setup loop date
        let thisDate = start.add(i, "days");
        // Get label of day
        let dayLabel = thisDate.format("DD");
        // Push label of day to labels
        chartData.labels.push(dayLabel);
        // Get value of the day
        let dayValue = this.results.valueTotalMap.days[thisDate.format("YYYY-MM-DD")];
        // Create a point object with date, value and label
        let point = {
          date: thisDate,
          x: dayLabel,
          y: 0,
        };
        // If we have a value
        if (dayValue) {
          // figure out if we should provided the sum or avg
          point.y = this.useMath() === "sum" ? dayValue.sum : dayValue.avg;
        }
        // Push Point to Chart data array.
        chartData.points.push(point);
      } // end looping over days
    } else if (mode === "year") {
      let start = dayjs(this.date).startOf("year");
      let yearMap = {};
      for (var i = 0; i < 12; i++) {
        let month = dayjs(start).month(i);
        yearMap[month.format("YYYY-MM")] = [];
      }
      this.rows.forEach((row) => {
        let end = dayjs(row.end);
        if (this.tracker) {
          if (row.trackers[this.tracker.tag]) {
            yearMap[end.format("YYYY-MM")] = yearMap[end.format("YYYY-MM")] || [];
            yearMap[end.format("YYYY-MM")].push(row.trackers[this.tracker.tag].value);
          }
        } else {
          // No Tracker Provided just count
          yearMap[end.format("YYYY-MM")] = yearMap[end.format("YYYY-MM")] || [];
          yearMap[end.format("YYYY-MM")].push(1);
        }
      });

      Object.keys(yearMap).forEach((dateKey) => {
        let point = {
          x: dateKey,
          y: this.useMath() == "sum" ? math.sum(yearMap[dateKey]) : math.average(yearMap[dateKey]),
          date: dayjs(`${dateKey}-01`),
        };
        chartData.labels.push(dateKey);
        chartData.points.push(point);
      });
    }

    return chartData;
  } // end toChartData()

  generate(mode) {
    // Setup labels, points, row holder
    let points = []; // holds x/y
    // if we're doing a month
    let rows = this.getRows(mode);

    let valueMap = this.getValueMap(rows);
    let valueMapTotals = this.getValueMapTotals(valueMap);

    let response = {
      avg: valueMapTotals.avg,
      sum: valueMapTotals.sum,
      ...this.getMinMaxFromValueMap(valueMap),
      count: rows.length,
      chart: this.toChartData(mode),
    };

    return response;
  }
}

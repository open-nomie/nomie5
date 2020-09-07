// import Stats from "../../../src/modules/stats/stats";
import StatsV5, { IStats, IStatsChartMode, timeSpans, ITimeSpanUnit } from "./statsV5";
import NomieLog from "../nomie-log/nomie-log";
import Tracker from "../tracker/tracker";
import dayjs, { OpUnitType, Dayjs } from "dayjs";
import TrackableElement, { toElement } from "../trackable-element/trackable-element";
import StatsProcessor from "./statsV5";
import NLog from "../nomie-log/nomie-log";
import fs from "fs";
import { t } from "i18next";

// TODO: write tests for mean math trackers

function rowMaker(count: number): Array<NLog> {
  let rows = [];
  let startDaysBack = 100;
  let date = dayjs().subtract(startDaysBack, "day");
  for (let i = 0; i <= startDaysBack; i++) {
    // console.log(`creating row for ${date.add(i, "day").format("YYYY-MM-DD")}`);
    let log = new NLog({
      end: date.add(i, "day").valueOf(),
      note: `#fake(${i})`,
    });
    rows.push(log);
  }
  return rows;
}

function getStatsProcessor(
  options: any = {}
): {
  stats: StatsProcessor;
  config: {
    timespan: ITimeSpanUnit;
    daysBack?: number;
    fromDate?: Dayjs;
    toDate?: Dayjs;
  };
} {
  let config: any = {};
  config.mode = options.mode || "m";
  config.timespan = timeSpans[config.mode];
  config.daysBack = options.daysBack || 30;
  config.fromDate = options.fromDate || dayjs().subtract(config.daysBack, config.timespan.displayUnit).startOf("day");
  config.toDate = options.toDate || dayjs().endOf("day");

  let rows: Array<NLog> = rowMaker(config.daysBack);
  let stats = new StatsProcessor({
    rows,
    mode: config.mode,
    trackableElement: toElement("#fake"),
    fromDate: config.fromDate,
    toDate: config.toDate,
  });
  return { stats, config };
}

describe("stats processor", () => {
  let statpro = getStatsProcessor();
  let valueMap = statpro.stats.getStarterValueMap();
  let valueMapArray = Object.keys(valueMap);
  let matches = {
    start: statpro.config.fromDate.format(statpro.config.timespan.format),
    end: statpro.config.toDate.format(statpro.config.timespan.format),
    vstart: valueMapArray[valueMapArray.length - 1],
    vend: valueMapArray[0],
  };

  it("should have today in the rows", () => {
    expect(statpro.stats.rows.find((r) => dayjs(r.end).format("YYYY-MM-DD") == statpro.config.toDate.format("YYYY-MM-DD"))).toBeTruthy();
  });

  it("should generate the right Starter Valup Map", () => {
    expect(matches.start).toEqual(matches.vstart);
    expect(matches.end).toEqual(matches.vend);
    expect(valueMap[statpro.config.fromDate.format(statpro.config.timespan.format)]).toBeTruthy();
    expect(valueMap[statpro.config.toDate.format(statpro.config.timespan.format)]).toBeTruthy();
    // Right number of elements (days back + today);
    expect(Object.keys(valueMap).length).toBe(statpro.config.daysBack + 1);
  });

  it("should generate the right valueMap", () => {
    let from = statpro.config.fromDate.format(statpro.config.timespan.format);
    let to = statpro.config.toDate.format(statpro.config.timespan.format);
    let valueMap = statpro.stats.getValueMap(statpro.stats.rows);
    expect(valueMap[from].join("")).toBe(`${statpro.stats.rows.length - (statpro.config.daysBack + 1)}`);
    expect(valueMap[to].join("")).toBe("100");
  });
});

describe("modules/stats/stats", function () {
  let rows = [
    new NomieLog({
      note: `I'm  just a note #region`,
      end: dayjs().hour(1).toDate().getTime(),
    }),
    new NomieLog({
      note: `I'm the #first #note #mood(6) and I'm #good`,
      end: dayjs().day(1).hour(12).toDate().getTime(),
    }),
    new NomieLog({
      note: `I'm the #last #note and I'm #bad and #good(11)`,
      end: dayjs().day(1).hour(12).toDate().getTime(),
    }),
    new NomieLog({
      note: `#mood(0) is empty - and zero too`,
      end: dayjs().day(2).hour(11).toDate().getTime(),
    }),
    new NomieLog({
      note: `#mood(0) is empty - and zero`,
      end: dayjs().day(2).hour(12).toDate().getTime(),
    }),
    new NomieLog({
      note: `I'm a thing good! #soggy`,
      end: dayjs().hour(1).toDate().getTime(),
    }),
    new NomieLog({
      note: `I'm the #middle #note and I'm #good(4) too`,
      end: dayjs().subtract(1, "day").hour(1).toDate().getTime(),
    }),
    new NomieLog({
      note: `I'm the #middle #note #mood(2) and I'm #good(22) too`,
      end: dayjs().subtract(1, "week").hour(1).toDate().getTime(),
    }),
    new NomieLog({
      note: `I'm the #middle #note and I'm  too`,
      end: dayjs().subtract(1, "month").hour(1).toDate().getTime(),
    }),
  ];

  const moodElement = new TrackableElement({
    type: "tracker",
    id: "mood",
    raw: "#mood",
    obj: new Tracker({ tag: "mood", ignore_zeros: true }),
  });

  let startTime = dayjs().subtract(1, "week");
  let endTime = dayjs().endOf("day");

  let timeStats = new StatsV5({
    fromDate: startTime,
    toDate: endTime,
    rows,
    math: "sum",
    trackableElement: moodElement,
  });

  it("should handle the right times", () => {
    let stats: IStats = timeStats.generateResults();
    expect(stats).toBeTruthy();
    expect(timeStats.fromDate.format("YYYY-MM-DD")).toEqual(startTime.format("YYYY-MM-DD"));
    expect(timeStats.toDate.format("YYYY-MM-DD")).toEqual(endTime.format("YYYY-MM-DD"));

    timeStats.init({
      fromDate: startTime,
      toDate: endTime,
    });

    expect(timeStats.fromDate.format("YYYY-MM-DD")).toEqual(startTime.format("YYYY-MM-DD"));
    expect(timeStats.toDate.format("YYYY-MM-DD")).toEqual(endTime.format("YYYY-MM-DD"));
  });

  const monthago = dayjs().subtract(30, "day");
  const today = dayjs().endOf("day");

  const goodElement = new TrackableElement({
    type: "tracker",
    id: "good",
    raw: "#good",
  });

  let moodStats = new StatsV5({ math: "mean" });
  let goodStats = new StatsV5({ math: "sum" });
  let moodGenerated = moodStats.generate({ rows, fromDate: monthago, toDate: today, math: "mean", trackableElement: moodElement });
  let goodGenerated = goodStats.generate({ rows, fromDate: monthago, toDate: today, math: "sum", trackableElement: goodElement });

  it("stats initializes", () => {
    expect(goodStats).toBeInstanceOf(StatsV5);
  });

  it("should have the right start and end date", () => {
    let testDate = dayjs(goodGenerated.start).format("YYYY-MM-DD");
    let withDate = monthago.format("YYYY-MM-DD");
    expect(testDate).toBe(withDate);

    let testDateTo = dayjs(goodGenerated.end).format("YYYY-MM-DD");
    let withDateTo = today.format("YYYY-MM-DD");
    expect(testDateTo).toBe(withDateTo);
  });

  it("should sum good properlty", () => {
    expect(goodGenerated.sum).toEqual(38);
  });

  it("should mean mood properly", () => {
    expect(moodGenerated.avg).toEqual(4);
  });

  it("should respect config order", () => {
    let stats = new StatsV5({ math: "mean", mode: "d" });
    stats.init({ mode: "w" });
    expect(stats.math).toEqual("mean");
    expect(stats.mode).toEqual("w");
  });

  it("should generate results", () => {
    expect(moodGenerated.rows).toBeInstanceOf(Array);
    expect(moodGenerated.avg).toBeGreaterThan(-1);
    expect(moodGenerated.sum).toBeGreaterThan(-1);
    expect(moodGenerated.rows.length).toEqual(4);
  });

  it("stats rows should expand", () => {
    expect(moodGenerated.rows[0].getMeta().trackers[0].value).toEqual(1);
    expect(moodGenerated.rows[0].getMeta().trackers[0].id).toEqual("first");
  });

  it("getMinMaxFromValueMap()", () => {
    let valueMap = goodStats.getValueMap(rows);
    let minmax = goodStats.getMinMaxFromValueMap(valueMap);

    expect(minmax.min.value).toEqual(4);
    expect(minmax.max.value).toEqual(22);
  });
});

// outdated

// it("should generate the right number of labels for chart", () => {
//   let daysAgo = dayjs().diff(monthago, "day");
//   moodStats.generateResults();
//   console.log({ moodStats });
//   expect(moodStats.chart.labels.length).toEqual(daysAgo);
//   expect(moodStats.chart.values.length).toEqual(daysAgo);
// });

// describe("modules/stats/stats/processor", () => {
//   let first = results.chart.values[0];
//   let last = results.chart.values[results.chart.values.length - 1];
//   let secondLast = results.chart.values[results.chart.values.length - 2];
//   let diff = last.date.diff(first.date, "day");

//   it("should get the right number of days for 100", () => {
//     expect(results.rows.length).toBe(daysBack);
//   });

//   it("should have the right dates", () => {
//     expect(last.date.format(format)).toBe(toDate.format(format));
//     expect(secondLast.date.format(format)).toBe(toDate.subtract(1, unit).format(format));
//     expect(first.date.format(format)).toBe(fromDate.format(format));
//     expect(diff).toBe(daysBack);
//   });
//   it("should get right values and dates for the first and second last", () => {
//     expect(first.y).toBe(0);
//     expect(secondLast.y).toBe(daysBack - 1);
//   });
//   it("should have the right values for the Last", () => {
//     expect(last.y).toBe(daysBack);
//     expect(last.date.format(format)).toBe(dayjs().format(format));
//   });
// });

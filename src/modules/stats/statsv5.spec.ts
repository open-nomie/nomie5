// import Stats from "../../../src/modules/stats/stats";
import StatsV5, { IStats } from "./statsV5";
import NomieLog from "../nomie-log/nomie-log";
import Tracker from "../tracker/tracker";
import dayjs from "dayjs";
import TrackableElement from "../trackable-element/trackable-element";
import StatsProcessor from "./statsV5";

// TODO: write tests for mean math trackers

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

  // const monthago = dayjs().subtract(30, "day");
  // const weekago = dayjs().subtract(7, "day");
  // const dayago = dayjs().subtract(1, "day");
  // const today = dayjs().endOf("day");
  // const moodElement = new TrackableElement({
  //   type: "tracker",
  //   id: "mood",
  //   raw: "#mood",
  //   obj: new Tracker({ tag: "mood", ignore_zeros: true }),
  // });
  // const goodElement = new TrackableElement({
  //   type: "tracker",
  //   id: "good",
  //   raw: "#good",
  // });

  // let moodStats = new StatsV5({ math: "mean" });
  // let goodStats = new StatsV5({ math: "sum" });
  // let moodGenerated = moodStats.generate({ rows, fromDate: monthago, toDate: today, math: "mean", trackableElement: moodElement });
  // let goodGenerated = goodStats.generate({ rows, fromDate: monthago, toDate: today, math: "sum", trackableElement: goodElement });

  // it("stats initializes", () => {
  //   expect(goodStats).toBeInstanceOf(StatsV5);
  // });

  // it("should have the right start and end date", () => {
  //   let testDate = dayjs(goodGenerated.start).format("YYYY-MM-DD");
  //   let withDate = monthago.format("YYYY-MM-DD");
  //   expect(testDate).toBe(withDate);

  //   let testDateTo = dayjs(goodGenerated.start).format("YYYY-MM-DD");
  //   let withDateTo = today.format("YYYY-MM-DD");
  //   expect(testDateTo).toBe(withDateTo);
  // });

  // it("should sum good properlty", () => {
  //   expect(goodGenerated.sum).toEqual(38);
  // });

  // it("should mean mood properly", () => {
  //   expect(moodGenerated.avg).toEqual(4);
  // });

  // it("should respect config order", () => {
  //   let stats = new StatsV5({ math: "mean", mode: "d" });
  //   stats.init({ mode: "w" });
  //   expect(stats.math).toEqual("mean");
  //   expect(stats.mode).to.be.equal("w");
  // });

  // it("should generate results", () => {
  //   expect(moodGenerated.rows).toBeInstanceOf(Array);
  //   expect(moodGenerated.avg).to.be.greaterThan(-1);
  //   expect(moodGenerated.sum).to.be.greaterThan(-1);
  //   expect(moodGenerated.rows.length).toEqual(3);
  // });

  // it("stats rows should expand", () => {
  //   expect(moodGenerated.rows[0].getMeta().trackers[0].value).toEqual(1);
  //   expect(moodGenerated.rows[0].getMeta().trackers[0].id).toEqual("first");
  // });

  // it("should generate the right number of labels for chart", () => {
  //   let daysAgo = dayjs().diff(monthago, "day");
  //   expect(goodStats.results.chart.labels.length).toEqual(daysAgo);
  //   expect(goodStats.results.chart.values.length).toEqual(daysAgo);
  // });

  // it("getValueMap", () => {
  //   let todayKey = dayjs(new Date()).format("YYYY-MM-DD");
  //   let yesterdayKey = dayjs(new Date()).subtract(1, "day").format("YYYY-MM-DD");
  //   let valueMap = goodStats.getValueMap(rows);
  //   expect(valueMap[todayKey]).toBeInstanceOf(Array);
  //   expect(valueMap[yesterdayKey]).to.include.members([1, 11, 4]);
  // });

  // it("getMinMaxFromValueMap()", () => {
  //   let valueMap = goodStats.getValueMap(rows);
  //   let minmax = goodStats.getMinMaxFromValueMap(valueMap);

  //   expect(minmax.min.value).toEqual(16);
  //   expect(minmax.max.value).toEqual(22);
  // });
});

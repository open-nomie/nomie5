// import Stats from "../../../src/modules/stats/stats";
import StatsV5 from "../../../src/modules/stats/statsV5";
import NomieLog from "../../../src/modules/nomie-log/nomie-log";
import Tracker from "../../../src/modules/tracker/tracker";
import dayjs from "dayjs";
import TrackableElement from "../../../src/modules/trackable-element/trackable-element";

// TODO: write tests for mean math trackers

describe("modules/stats/stats", function () {
  let rows = [
    new NomieLog({
      note: `I'm  just a note`,
      end: dayjs().toDate().getTime(),
    }),
    new NomieLog({
      note: `I'm the #first #note #mood(10) and I'm #good`,
      end: dayjs().day(1).hour(12).toDate().getTime(),
    }),
    new NomieLog({
      note: `I'm the #last #note and #mood(5) I'm #bad and #good(11)`,
      end: dayjs().day(1).hour(12).toDate().getTime(),
    }),
    new NomieLog({
      note: `I'm a thing good!`,
    }),
    new NomieLog({
      note: `I'm the #middle #note and I'm #good(10) too`,
      end: dayjs().subtract(1, "day").toDate().getTime(),
    }),
    new NomieLog({
      note: `I'm the #middle #note #mood(5) and I'm #good(22) too`,
      end: dayjs().subtract(1, "week").toDate().getTime(),
    }),
    new NomieLog({
      note: `I'm the #middle #note and I'm  too`,
      end: dayjs().subtract(1, "month").toDate().getTime(),
    }),
  ];

  const monthago = dayjs().subtract(30, "day");
  const weekago = dayjs().subtract(7, "day");
  const dayago = dayjs().subtract(1, "day");
  const today = dayjs();
  const moodElement = new TrackableElement({
    type: "tracker",
    id: "mood",
    raw: "#mood",
  });
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
    expect(goodStats).to.be.instanceOf(StatsV5);
  });

  it("should sum good properlty", () => {
    expect(goodGenerated.sum).to.equal(44);
  });

  it("should mean mood properlty", () => {
    expect(moodGenerated.avg).to.equal(6.67);
  });

  it("should get the right time of day", () => {
    expect(moodGenerated.tod.afternoon.count).to.equal(2);
  });

  it("should get the right day of week", () => {
    expect(moodGenerated.dow.mon.count).to.equal(3);
  });

  it("should respect config order", () => {
    let stats = new StatsV5({ math: "mean", mode: "d" });
    stats.init({ mode: "w" });
    expect(stats.math).to.equal("mean");
    expect(stats.mode).to.be.equal("w");
  });

  it("should generate results", () => {
    expect(moodGenerated.rows).to.be.instanceOf(Array);
    expect(moodGenerated.avg).to.be.greaterThan(-1);
    expect(moodGenerated.sum).to.be.greaterThan(-1);
    expect(moodGenerated.rows.length).to.equal(3);
  });

  it("stats rows should expand", () => {
    expect(moodGenerated.rows[0].getMeta().trackers[0].value).to.equal(1);
    expect(moodGenerated.rows[0].getMeta().trackers[0].id).to.equal("first");
  });

  it("should generate the right number of labels for chart", () => {
    let daysAgo = dayjs().diff(monthago, "day");
    expect(goodStats.results.chart.labels.length).to.equal(daysAgo);
    expect(goodStats.results.chart.values.length).to.equal(daysAgo);
  });

  it("getValueMap", () => {
    let todayKey = dayjs(new Date()).format("YYYY-MM-DD");
    let yesterdayKey = dayjs(new Date()).subtract(1, "day").format("YYYY-MM-DD");
    let valueMap = goodStats.getValueMap(rows);
    console.log("Value Map", valueMap);
    expect(valueMap[todayKey]).to.be.instanceOf(Array);
    console.log("Valuemap", valueMap[todayKey]);
    expect(valueMap[todayKey]).to.include.members([11]);
    expect(valueMap[yesterdayKey]).to.include.members([10]);
  });

  it("getMinMaxFromValueMap()", () => {
    let valueMap = goodStats.getValueMap(rows);
    let minmax = goodStats.getMinMaxFromValueMap(valueMap);
    expect(minmax.min.value).to.equal(10);
    expect(minmax.max.value).to.equal(22);
  });
});

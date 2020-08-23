// Nomie ID
import logFilter from "./log-filter";
import NomieLog from "../nomie-log/nomie-log";
import TrackableElement from "../trackable-element/trackable-element";

let log1 = new NomieLog({ note: "Tracker #cheese for Brandon 1" });
let log2 = new NomieLog({ _id: "brandontest", note: "Tracker #cheese for @brandon, 2" });
let log3 = new NomieLog({ note: "Tracker #cheese? for @Brandon 3" });
let log4 = new NomieLog({ note: "Tracker #burger! for covid @brandOn 4" });
let log5 = new NomieLog({ note: "Tracker #fries for Brandon 5" });
let log6 = new NomieLog({ note: "Tracker #cheese(30) cheese(30) #cheesey(33) #cheese-bread for Brandon 6" });
let log7 = new NomieLog({ note: "Tracker #milk, for @brandon, +covid 7" });
let log8 = new NomieLog({ note: "Tracker not cheese for Brandon +covid 8" });
let log9 = new NomieLog({ _id: "latintest", note: "@aigües @aiüe Catalan Tracker #gas #pizza for Brandon 9" });
let log10 = new NomieLog({
  _id: "goattest",
  note: `Tracker #cheese(33:33) for Brandon 10

#goat`,
});

let logs = [log1, log2, log3, log4, log5, log6, log7, log8, log9, log10];
let cheeseTrackableElement = new TrackableElement({ id: "cheese", type: "tracker" });
let covidTrackableElement = new TrackableElement({ id: "covid", type: "context" });
let brandonTrackableElement = new TrackableElement({ id: "brandon", type: "person" });
let latinTrackableElement = new TrackableElement({ id: "aigües", type: "person" });
let goatTrackerElement = new TrackableElement({ id: "goat", type: "tracker" });

describe("modules/log-filter trackers", function () {
  it("Should find the latintest", () => {
    let filter = {
      search: latinTrackableElement,
    };
    let results = logFilter(logs, filter);
    expect((results[0] || {})._id).toEqual("latintest");
  });

  it("Should find the brandontest", () => {
    let filter = {
      search: brandonTrackableElement,
    };
    let results = logFilter(logs, filter);
    expect((results[0] || {})._id).toEqual("brandontest");
  });

  it("Should find the goat on a new line", () => {
    let filter = {
      search: goatTrackerElement,
    };
    let results = logFilter(logs, filter);
    expect((results[0] || {})._id).toEqual("goattest");
  });

  it("should search for a trackableElement if provided", () => {
    let filter = {
      search: cheeseTrackableElement,
    };
    let results = logFilter(logs, filter);
    expect(results.length).toEqual(5);
  });
  it("should search for a #hashtag if provided", () => {
    let filter = {
      search: "#cheese",
    };
    let results = logFilter(logs, filter);
    expect(results.length).toEqual(5);
  });
});

describe("modules/log-filter people", function () {
  it("should search for a trackableElement if provided", () => {
    let filter = {
      search: brandonTrackableElement,
    };
    let results = logFilter(logs, filter);
    expect(results.length).toEqual(4);
  });
  it("should search for a @username if provided", () => {
    let cheeseFilter = {
      search: "@brandon",
    };
    let results = logFilter(logs, cheeseFilter);
    expect(results.length).toEqual(4);
  });
});

describe("modules/log-filter context", function () {
  it("should search for a trackableElement if provided", () => {
    let filter = {
      search: covidTrackableElement,
    };
    let results = logFilter(logs, filter);
    expect(results.length).toEqual(2);
  });
  it("should search for a +context if provided", () => {
    let cheeseFilter = {
      search: "+covid",
    };
    let results = logFilter(logs, cheeseFilter);
    expect(results.length).toEqual(2);
  });
});

describe("modules/log-filter generic term", function () {
  it("should search for a trackableElement if provided", () => {
    let filter = {
      search: new TrackableElement({ id: "covid", type: "generic" }),
    };
    let results = logFilter(logs, { ...filter, ...{ fuzzy: true } });
    expect(results.length).toEqual(3);
  });
  it("should search for generic term using Fuzzy logic", () => {
    let filter = {
      search: "covid",
    };
    let results = logFilter(logs, { ...filter, ...{ fuzzy: true } });
    expect(results.length).toEqual(3);
  });
});

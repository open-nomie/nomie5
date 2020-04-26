// Nomie ID
import logFilter from "../../../src/modules/log-filter/log-filter";
import NomieLog from "../../../src/modules/nomie-log/nomie-log";
import TrackableElement from "../../../src/modules/trackable-element/trackable-element";

let log1 = new NomieLog({ note: "Tracker #cheese for Brandon 1" });
let log2 = new NomieLog({ note: "Tracker #cheese for @brandon, 2" });
let log3 = new NomieLog({ note: "Tracker #cheese? for @Brandon 3" });
let log4 = new NomieLog({ note: "Tracker #burger! for covid @brandOn 4" });
let log5 = new NomieLog({ note: "Tracker #fries for Brandon 5" });
let log6 = new NomieLog({ note: "Tracker #cheese(30) cheese(30) #cheesey(33) #cheese-bread for Brandon 6" });
let log7 = new NomieLog({ note: "Tracker #milk, for @brandon, +covid 7" });
let log8 = new NomieLog({ note: "Tracker not cheese for Brandon +covid 8" });
let log9 = new NomieLog({ note: "Tracker #gas #pizza for Brandon 9" });
let log10 = new NomieLog({ note: "Tracker #cheese(33:33) for Brandon 10" });

let logs = [log1, log2, log3, log4, log5, log6, log7, log8, log9, log10];
let cheeseTrackableElement = new TrackableElement({ id: "cheese", type: "tracker" });
let covidTrackableElement = new TrackableElement({ id: "covid", type: "context" });
let brandonTrackableElement = new TrackableElement({ id: "brandon", type: "person" });

describe("modules/log-filter trackers", function () {
  it("should search for a trackableElement if provided", () => {
    let filter = {
      search: cheeseTrackableElement,
    };
    let results = logFilter(logs, filter);
    expect(results.length).to.equal(5);
  });
  it("should search for a #hashtag if provided", () => {
    let filter = {
      search: "#cheese",
    };
    let results = logFilter(logs, filter);
    expect(results.length).to.equal(5);
  });
});

describe("modules/log-filter people", function () {
  it("should search for a trackableElement if provided", () => {
    let filter = {
      search: brandonTrackableElement,
    };
    let results = logFilter(logs, filter);
    expect(results.length).to.equal(4);
  });
  it("should search for a @username if provided", () => {
    let cheeseFilter = {
      search: "@brandon",
    };
    let results = logFilter(logs, cheeseFilter);
    expect(results.length).to.equal(4);
  });
});

describe("modules/log-filter context", function () {
  it("should search for a trackableElement if provided", () => {
    let filter = {
      search: covidTrackableElement,
    };
    let results = logFilter(logs, filter);
    expect(results.length).to.equal(2);
  });
  it("should search for a +context if provided", () => {
    let cheeseFilter = {
      search: "+covid",
    };
    let results = logFilter(logs, cheeseFilter);
    expect(results.length).to.equal(2);
  });
});

describe("modules/log-filter generic term", function () {
  it("should search for a trackableElement if provided", () => {
    let filter = {
      search: new TrackableElement({ id: "covid", type: "generic" }),
    };
    let results = logFilter(logs, filter);
    console.log("Results", results);
    expect(results.length).to.equal(3);
  });
  it("should search for generic term if provided", () => {
    let filter = {
      search: "covid",
    };
    let results = logFilter(logs, filter);
    expect(results.length).to.equal(3);
  });
});

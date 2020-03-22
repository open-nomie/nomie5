import Log from "../../../src/modules/nomie-log/nomie-log";

describe("modules/nomie-log", function() {
  let log;
  let stub = {
    note: `I'm a note for #testing and I'm #good(344) and #good and kinda #bad sometimes #bad and @brandon is now here +testing context and +more.
		 I bet @betty would have dug Nomie, she was my grandmother. +love
		`
  };

  it("log.getMeta", () => {
    log = new Log(stub);
    const meta = log.getMeta();

    console.log("Meat", meta);
    expect(meta.people[0]).to.equal("brandon");
    expect(meta.people[1]).to.equal("betty");
    expect(meta.context[0]).to.equal("testing");
    expect(meta.context[1]).to.equal("more");
    expect(meta.context[2]).to.equal("love");
    expect(meta.trackers[0].tag).to.equal("testing");
  });

  it("log initializes", () => {
    log = new Log(stub);
    expect(log).to.be.instanceOf(Log);
    // expect(log.note).to.equal(stub.note);
  });

  it("log.toObject", () => {
    log = new Log(stub);
    expect(log.toObject()._id).to.be.a("string");
  });
  it("log.expanded", () => {
    log = new Log(stub);
    log.expanded();
    expect(log.trackers.testing.value).to.equal(1);
  });
  it("log.hasTracker", () => {
    log = new Log(stub);
    log.expanded();
    expect(log.hasTracker("testing")).to.equal(true);
    expect(log.hasTracker("nothing")).to.equal(false);
  });
  it("log.trackersArray", () => {
    log = new Log(stub);
    log.expand();
    let trackers = log.trackersArray();
    expect(trackers.length).to.equal(3);
  });
  it("log.addTag", () => {
    log = new Log(stub);
    log.expanded();
    log.addTag("cheese", 44);
    expect(log.hasTracker("cheese")).to.equal(true);
    expect(log.trackers.cheese.value).to.equal(44);
  });
});

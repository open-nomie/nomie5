import Log from "../../../src/modules/nomie-log/nomie-log";
import math from "../../../src/utils/math/math";

describe("modules/nomie-log", function () {
  let log;
  let stub = {
    note: `I'm a note for #testing and I'm #good(344) and #good and kinda #bad sometimes #bad and @brandon is now here +testing context and +more.
		 I bet @betty would have dug Nomie, she was my grandmother. #cheese(50) +love
		`,
  };

  it("log.getMeta", () => {
    log = new Log(stub);
    const meta = log.getMeta();

    expect(meta.people[0].id).to.equal("brandon");
    expect(meta.people[1].id).to.equal("betty");
    expect(meta.context[0].id).to.equal("testing");
    expect(meta.context[1].id).to.equal("more");
    expect(meta.context[2].id).to.equal("love");
    expect(meta.trackers[0].id).to.equal("testing");
  });

  it("log initializes", () => {
    log = new Log(stub);
    expect(log).to.be.instanceOf(Log);
    // expect(log.note).to.equal(stub.note);
  });

  it("should scrub the note", () => {
    log = new Log({
      note: "Hello #there @brandon",
    });
    let scrubbed = log.getScrubbedNote();
    expect(scrubbed).to.equal("Hello @brandon");
  });

  it("should scrub the note", () => {
    log = new Log({
      note: "Hello #there #there(40) #there(30) @brandon",
    });
    let value = log.getTrackerValue("there");
    expect(value).to.equal(71);
  });

  it("log.toObject", () => {
    log = new Log(stub);
    expect(log.toObject()._id).to.be.a("string");
  });
  it("log.expanded", () => {
    log = new Log(stub);
    log.getMeta();
    expect(log.trackers.length).to.equal(6);
  });
  it("log.hasTracker", () => {
    log = new Log(stub);
    log.getMeta();
    expect(log.hasTracker("testing")).to.equal(true);
    expect(log.hasTracker("nothing")).to.equal(false);
  });

  it("log.addTag", () => {
    log = new Log(stub);
    log.expanded();
    log.addTag("cheese", 50);
    expect(log.hasTracker("cheese")).to.equal(true);
    expect(math.sum(log.getTrackerValues("cheese"))).to.equal(100);
  });
});

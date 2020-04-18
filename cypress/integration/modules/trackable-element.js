import TrackableElement from "../../../src/modules/trackable-element/trackable-element";
import extractor from "../../../src/utils/extract/extract";

describe("modules/trackable-element", function () {
  let trackerElement = extractor.toElement("#mood");
  let personElement = extractor.toElement("@bobby");
  let contextElement = extractor.toElement("+cheese");

  let manual = new TrackableElement({ id: "sample", type: "person" });

  it("should be instance of TrackableElement", () => {
    expect(trackerElement).to.be.instanceOf(TrackableElement);
    expect(personElement).to.be.instanceOf(TrackableElement);
    expect(contextElement).to.be.instanceOf(TrackableElement);
  });

  it("should be lowercase the ID ", () => {
    expect(new TrackableElement({ id: "Uppercase" }).id).to.equal("uppercase");
  });

  it("should be support populating data from a raw string ", () => {
    expect(new TrackableElement({ raw: "#cheese" }).id).to.equal("cheese");
    expect(new TrackableElement({ raw: "#cheese" }).type).to.equal("tracker");
    expect(new TrackableElement({ raw: "#cheese(44)" }).value).to.equal(44);
    expect(new TrackableElement({ raw: "@bobby" }).id).to.equal("bobby");
    expect(new TrackableElement({ raw: "@bobby" }).type).to.equal("person");
    expect(new TrackableElement({ raw: "+covid" }).id).to.equal("covid");
    expect(new TrackableElement({ raw: "+covid" }).type).to.equal("context");
  });

  it("should generate search terms", () => {
    expect(trackerElement.toSearchTerm()).to.equal("#mood");
    expect(personElement.toSearchTerm()).to.equal("@bobby");
    expect(contextElement.toSearchTerm()).to.equal("+cheese");
  });
  it("should generate search terms when created manually", () => {
    expect(manual.toSearchTerm()).to.equal("@sample");
  });

  it("should fill in missing information when person manually", () => {
    let person = new TrackableElement({ id: "sample", type: "person" });
    expect(person.raw).to.equal("@sample");
    expect(person.prefix).to.equal("@");
  });
  it("should fill in missing information when tracker manually", () => {
    let tracker = new TrackableElement({ id: "sample", type: "tracker" });
    expect(tracker.raw).to.equal("#sample");
    expect(tracker.prefix).to.equal("#");
  });
  it("should fill in missing information when context manually", () => {
    let context = new TrackableElement({ id: "sample", type: "context" });
    expect(context.raw).to.equal("+sample");
    expect(context.prefix).to.equal("+");
  });
});

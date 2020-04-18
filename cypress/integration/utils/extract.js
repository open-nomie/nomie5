import extractor from "../../../src/utils/extract/extract";

let note =
  "This is a #test of +context @person #语 @语 +语 @brandon Nomies #extractor(4)! #home(0)? #coffee(3), #sleep(01:00:00) and #cheese #cheese #cheese";

describe("utils/extractor", function () {
  it("Should be able extract Element from string", () => {
    expect(extractor.toElement("#mood").type).to.equal("tracker");
    expect(extractor.toElement("#mood(43)").value).to.equal(43);
    expect(extractor.toElement("#语(43.324321234321233oz)").value).to.equal(43.324321234321233);
    expect(extractor.toElement("#语(43)").id).to.equal("语");
    expect(extractor.toElement("@mood").type).to.equal("person");
    expect(extractor.toElement("+mood").type).to.equal("context");
    expect(extractor.toElement("+mood(32)").type).to.equal("context");
    expect(extractor.toElement("+mood(32)").id).to.equal("mood");
    expect(extractor.toElement("+mood(32): #dd").id).to.equal("mood");
    expect(extractor.toElement("+😁").id).to.equal("😁");
    expect(extractor.toElement("#timer(02:00:00)").value).to.equal(7200);
    expect(extractor.toElement("#timer(02:00)").value).to.equal(7200);
  });

  it("Should handle #test_time: #hj #bj", () => {
    let note = "#test_time: #hj #bj";
    let parsed = extractor.parse(note);
    expect(parsed[0].id).to.equal("test_time");
  });

  it("Should handle a generic object in the toElement", () => {
    let element = extractor.toElement("sample do");
    expect(element.id).to.equal("sample_do");
    expect(element.type).to.equal("generic");
    expect(element.raw).to.equal("sample do");
  });

  it("should handle being passed a null", () => {
    expect(extractor.parse().length).to.equal(0);
  });

  it("Should do fine with something like +covid19.", () => {
    let note = `This is a note  +covid19.\n\t\r +covid14 
    `;
    expect(extractor.parse(note)[1].type).to.equal("context");
    expect(extractor.parse(note)[1].id).to.equal("covid14");
    expect(extractor.parse(note)[0].type).to.equal("context");
    expect(extractor.parse(note)[0].id).to.equal("covid19");
  });

  it("should extract all the things", () => {
    let note =
      "This is a #test of +context @person #语 @语 +语 @brandon Nomies #extractor(4)! #home(0)? #coffee(3), #sleep(01:00:00) and #cheese #cheese #cheese";

    let results = extractor.parse(note);
    expect(results.length).to.equal(14);
    expect(results[0].type).to.equal("tracker");
    expect(results[1].type).to.equal("context");
    expect(results[2].type).to.equal("person");
  });

  it("should allow inclusion of generic terms", () => {
    let note = "This is a #note, can you dig it?";
    let parsed = extractor.parse(note, { includeGeneric: true });
    expect(parsed[3].remainder).to.equal(",");
    expect(parsed.length).to.equal(8);
    expect(parsed[7].raw).to.equal("it?");
  });

  it("should extract tracker detail", () => {
    let results = extractor.trackers(note);
    expect(results[0].id).to.equal("test");
    expect(results[1].id).to.equal("语");
    expect(results[2].id).to.equal("extractor");
    expect(results[2].value).to.equal(4);
    expect(results[3].id).to.equal("home");
    expect(results[3].value).to.equal(0);
    expect(results[4].id).to.equal("coffee");
    expect(results[4].value).to.equal(3);
    expect(results[5].id).to.equal("sleep");
    expect(results[5].value).to.equal(3600);
  });

  it("extract-people", () => {
    let note = "What a test! @brandon_corbin @b41d34 #extractor(4) +context1 +winner";
    let results = extractor.context(note);
    expect(results[0].id).to.equal("context1");
    expect(results[1].id).to.equal("winner");
    let note2 = "No Context";
    let results2 = extractor.context(note2);
    expect(results2.length).to.equal(0);
    // expect(math.sum([1, 2])).to.equal(3);
  });
  it("extract-people", () => {
    let note = "What a test! @brandon_corbin @b41d34 #extractor(4) +context1 +winner";
    let results = extractor.people(note);

    expect(results[0].id).to.equal("brandon_corbin");
    expect(results[1].id).to.equal("b41d34");

    let note2 = "No Context";
    let results2 = extractor.people(note2);
    expect(results2.length).to.equal(0);
    // expect(math.sum([1, 2])).to.equal(3);
  });
});

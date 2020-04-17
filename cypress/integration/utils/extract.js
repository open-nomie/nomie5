import extractor from "../../../src/utils/extract/extract";
import peopleExtractor from "../../../src/utils/extract/extract-people";
import contextExtractor from "../../../src/utils/extract/extract-context";

describe("utils/extract-trackers", function () {
  it("should extract all the things", () => {
    let note =
      "This is a #test of +context @person #语 @语 +语 @brandon Nomies #extractor(4)! #home(0)? #coffee(3), #sleep(01:00:00) and #cheese #cheese #cheese";
    let results = extractor.parse(note);
    console.log("Results", results);
    expect(results.length).to.equal(12);
  });

  // it("extract-tracker", () => {
  //   let note = "This is a #test of Nomies #extractor(4)! #home(0)? #coffee(3), #sleep(01:00:00) and #cheese #cheese #cheese";
  //   let results = extractor(note);

  //   expect(results.test.tracker).to.equal("test");
  //   expect(results.test.value).to.equal(1);
  //   expect(results.coffee.value).to.equal(3);
  //   expect(results.extractor.value).to.equal(4);
  //   expect(results.cheese.value).to.equal(3);
  //   expect(results.home.value).to.equal(0);
  //   expect(results.sleep.value).to.equal(3600);
  //   // expect(math.sum([1, 2])).to.equal(3);
  // });
});

describe("utils/extract-people", function () {
  it("extract-people", () => {
    let note =
      "This is a #test of @Nomies and @brandon_corbin? @b41d34, #extractor(4) #home(0) #sleep(01:00:00) and #cheese #cheese #cheese";
    let results = peopleExtractor(note);
    expect(results[0]).to.equal("Nomies");
    expect(results[1]).to.equal("brandon_corbin");
    expect(results[2]).to.equal("b41d34");

    let note2 = "No People";
    let results2 = peopleExtractor(note2);
    expect(results2.length).to.equal(0);

    // expect(math.sum([1, 2])).to.equal(3);
  });
});

describe("utils/extract-context", function () {
  it("extract-people", () => {
    let note = "What a test! @brandon_corbin @b41d34 #extractor(4) +context1 +winner";
    let results = contextExtractor(note);

    expect(results[0]).to.equal("context1");
    expect(results[1]).to.equal("winner");

    let note2 = "No Context";
    let results2 = contextExtractor(note2);
    expect(results2.length).to.equal(0);
    // expect(math.sum([1, 2])).to.equal(3);
  });
});

import regexs from "../../../src/utils/regex";

describe("utils/regex", function () {
  const note = "This is a #test #note(3) for @brandon, +dev +work @bigbird! Hell yes! #sleep(04:02:12)";

  it("extract tags by regex", () => {
    let exp = new RegExp(regexs.tag, "gi");
    expect(note.match(exp)).to.include.members(["#test", "#note(3)", "#sleep(04:02:12)"]);
  });

  it("it extracts people", () => {
    let exp = new RegExp(regexs.person, "gi");
    const matches = note.match(exp);
    expect(matches).to.include.members(["@brandon", "@bigbird"]);
  });

  it("it extracts context", () => {
    let exp = new RegExp(regexs.context, "gi");
    const matches = note.match(exp);
    expect(matches).to.include.members(["+dev", "+work"]);
  });

  it("it generates a proper tracker search template", () => {
    let tag = "tag";
    let searchReg = regexs.template.tagOnly(tag);
    let matchedNote = "This is a #tag(33) #tag, #tag2 #tagger #tagA";
    let noMatchNote = "This is a #tagged(33) ";
    console.log("Search Reg", searchReg, matchedNote.match(searchReg));
    expect(matchedNote.search(searchReg)).to.be.greaterThan(-1);
    expect(matchedNote.match(searchReg).length).to.equal(2);
    console.log(noMatchNote.match(searchReg));
    expect(noMatchNote.search(searchReg)).to.equal(-1);
  });

  it("it generates a proper person search template", () => {
    let tag = "brandon";
    let searchReg = regexs.template.person(tag);
    let matchedNote = "So @brandon @brandon is here @emily";
    let noMatchNote = "This is a #brandon is a tag ";
    console.log("Search Reg", searchReg, matchedNote.match(searchReg));
    expect(matchedNote.search(searchReg)).to.be.greaterThan(-1);
    expect(matchedNote.match(searchReg).length).to.equal(2);
    console.log("No match", noMatchNote.match(searchReg));
    expect(noMatchNote.search(searchReg)).to.equal(-1);
  });

  it("it generates a proper context search template", () => {
    let tag = "context";
    let searchReg = regexs.template.context(tag);
    let matchedNote = "So @brandon @brandon is +context +turkey +family +context-free @emily";
    let noMatchNote = "This is a #brandon is a tag #context";
    console.log("Search Reg", searchReg, matchedNote.match(searchReg));
    expect(matchedNote.search(searchReg)).to.be.greaterThan(-1);
    expect(matchedNote.match(searchReg).length).to.equal(1);
    console.log("No match", noMatchNote.match(searchReg));
    expect(noMatchNote.search(searchReg)).to.equal(-1);
  });
});

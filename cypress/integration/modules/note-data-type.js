let NoteDataType = require("../../../src/modules/note-data-type/note-data-type");

// Nomie ID
import nid from "../../../src/modules/nid/nid";
describe("modules/note-data-type", function () {
  it("Should parse tracker", () => {
    const type = NoteDataType.parse(`#pizza(43)`);
    expect(type.type).to.equal("tracker");
    expect(type.value).to.equal("pizza");
    expect(type.count).to.equal(43);
    const type2 = NoteDataType.parse(`#pizza(43.43)`);
    expect(type2.count).to.equal(43.43);
  });
  it("Should parse person", () => {
    const type = NoteDataType.parse(`@bethany`);
    expect(type.type).to.equal("person");
  });
  it("Should parse context", () => {
    const type = NoteDataType.parse(`+life`);
    expect(type.type).to.equal("context");
  });

  it("Should convert tracker to proper search string", () => {
    const trackerSearch = "#mood(43)";
    const note = "My note is #awesome #mood(1) #mood #moodly(32) and #cheese";
    const searchReg = NoteDataType.toSearchString(trackerSearch);
    const matches = note.match(searchReg);
    expect(matches).to.contain("#mood");
    expect(matches.length).to.equal(2);
    expect(matches).to.not.contain("#moodly");
  });

  it("Should convert people to proper search string", () => {
    const search = "@brandon";
    const note = "My life is @brandon @emily @maddy @ethan";
    const searchReg = NoteDataType.toSearchString(search);
    const matches = note.match(searchReg);
    expect(matches).to.contain("@brandon");
    expect(matches.length).to.equal(1);
    expect(matches).to.not.contain("@emily");
  });

  it("Should convert tracker to generic search string", () => {
    const trackerSearch = "mood";
    const note = "My note is #awesome #mood(1) #mood #moodly(32) and #cheese";
    const searchReg = NoteDataType.toSearchString(trackerSearch);
    const matches = note.match(searchReg);
    expect(matches).to.contain("mood");
    expect(matches.length).to.equal(3);
    expect(matches).to.not.contain("moodly");
  });

  it("Should convert tracker to context search string", () => {
    const trackerSearch = "+life";
    const note = "My note is #awesome #mood(1) +life +lifer is good, sometimes. #mood #moodly(32) and #cheese";
    const searchReg = NoteDataType.toSearchString(trackerSearch);
    console.log("Search Reg for context", searchReg);
    const matches = note.match(searchReg);
    expect(matches).to.contain("+life");
    expect(matches.length).to.equal(1);
    expect(matches).to.not.contain("+lifer");
    console.log(matches);
  });

  //   it("nid(4) should generate a length of 4", () => {
  //     expect(nid(4)).to.have.length.of(4);
  //   });
  //   it("two nid()s should generate unique values", () => {
  //     let nid1 = nid();
  //     let nid2 = nid();
  //     let match = nid1 == nid2;
  //     expect(match).to.be.false;
  //   });
  //   it("should hash a string if provided", () => {
  //     let nid1 = nid("my string is this", 10);
  //     let nid2 = nid("my string is this", 10);
  //     let match = nid1 == nid2;
  //     expect(match).to.be.true;
  //   });
});

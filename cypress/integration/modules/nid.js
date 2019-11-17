import nid from "../../../src/modules/nid/nid";

describe("modules/nid", function() {
  it("empty nid generator", () => {
    expect(nid()).to.have.length.of(32);
  });
  it("nid(4) should generate a length of 4", () => {
    expect(nid(4)).to.have.length.of(4);
  });
  it("two nid()s should generate unique values", () => {
    let nid1 = nid();
    let nid2 = nid();
    let match = nid1 == nid2;
    expect(match).to.be.false;
  });
  it("should hash a string if provided", () => {
    let nid1 = nid("my string is this", 10);
    let nid2 = nid("my string is this", 10);
    let match = nid1 == nid2;
    expect(match).to.be.true;
  });
});

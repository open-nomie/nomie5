import stringToValue from "../../../src/utils/string-to-value/string-to-value";

describe("utils/string-to-value", function () {
  it("should convert time properly", () => {
    expect(stringToValue("01:00:00")).to.equal(3600);
  });
  it("should convert decimal properly", () => {
    expect(stringToValue("10000.32")).to.equal(10000.32);
  });
  it("should convert number properly", () => {
    expect(stringToValue("10000")).to.equal(10000);
  });
  it("should convert string gracefully", () => {
    expect(isNaN(stringToValue("pizza"))).to.be.true;
  });
});

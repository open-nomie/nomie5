import is from "./is";

describe("is test sweeeet!", () => {
  it("should identify an emoji", () => {
    expect(is.emoji("😁")).toBe(true);
  });
  it("should identify NOT an emoji", () => {
    expect(is.emoji("d")).toBe(false);
  });
});

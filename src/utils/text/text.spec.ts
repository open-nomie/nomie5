import text from "./text";

describe("text tests", () => {
  it("should truncate", () => {
    expect(text.truncate("aaaaaaaaaa", 5)).toBe("aaaaa...");
  });
});

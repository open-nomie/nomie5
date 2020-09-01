import text from "./text";

describe("text tests", () => {
  it("should truncate", () => {
    expect(text.truncate("aaaaaaaaaa", 5)).toBe("aaaaa...");
  });
  it("should truncate with the end", () => {
    let _txt = "abcdefghijklmnopqrstuvwxyz.gif";
    expect(text.truncate(_txt, 10, 5)).toBe("abcde...z.gif");
  });
  it("should truncate with the end", () => {
    let _txt = "abcdefghijklmnopqrstuvwxyz.gif";
    expect(text.truncate(_txt, 10, 4)).toBe("abcdef....gif");
  });
});

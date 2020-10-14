import text, { initials } from "./text";

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

  it("should generate initials", () => {
    expect(initials("brandon corbin")).toBe("BC");
    expect(initials("Abraham Bart McSweeny McNight")).toBe("AM");
    expect(initials("Jacob B Smith")).toBe("JS");
    expect(initials("poooolboy")).toBe("PO");
    expect(initials("p")).toBe("P");
    expect(initials("")).toBe("NA");
  });
});

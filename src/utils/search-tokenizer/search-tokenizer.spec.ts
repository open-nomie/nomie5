import tokenizer from "./search-tokenizer";

describe("Search Tokenizer", () => {
  it("should convert to an array", () => {
    const tokened = tokenizer(`"åäö  "oh   BOY!!!!"`);
    console.log(tokened);
    expect(tokened).toBe("aao oh boy");
  });
});

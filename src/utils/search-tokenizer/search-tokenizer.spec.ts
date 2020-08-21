import tokenizer from "./search-tokenizer";

describe("Search Tokenizer", () => {
  it("should convert to an array", () => {
    const tokened = tokenizer(`"(text jack) asd AND blabla åäö`);
    console.log(tokened);
    expect(tokened).toBeInstanceOf(Array);
  });
});

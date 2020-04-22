import regexs from "../../../src/utils/regex";

describe("utils/regex", function () {
  it("escapes terms", () => {
    expect(regexs.escape("54?")).to.equal("54\\?");
  });
});

import Chainer from "./chainer";

describe("Chainer", () => {
  it("should chain steps", () => {
    let test = "Hi there";
    let d = new Chainer(test).whenExists((user) => "this is a user");
    expect(d).toBe("this is a user");
  });
});

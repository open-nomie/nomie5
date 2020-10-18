import emojiCount from "./emoji-count";

describe("emoji-count", () => {
  it("should count the right number of emojis", () => {
    expect(emojiCount(`☀️😙❤️🍔`)).toBe(4);
    expect(emojiCount(`WD`)).toBe(0);
  });
});

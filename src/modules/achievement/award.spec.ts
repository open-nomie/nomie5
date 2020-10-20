import Award from "./award.class";

describe("Award", () => {
  it("should create a new one", () => {
    let award = new Award({ name: "Test Award" });
    expect(award.id).toBeTruthy();
  });
  it("should require a name", () => {
    try {
      let award = new Award();
      expect(award).toBeTruthy();
    } catch (e) {
      expect(e).toBeTruthy();
    }
  });
});

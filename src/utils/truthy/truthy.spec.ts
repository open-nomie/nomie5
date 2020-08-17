import { isTruthy } from "./truthy";
describe("Truthy", () => {
  it("should test for truth elements", () => {
    expect(isTruthy(0)).toBe(true);
    expect(isTruthy("0")).toBe(true);
    expect(isTruthy([])).toBe(true);
    expect(isTruthy({})).toBe(true);
  });
  it("should return false for undefined null and false", () => {
    expect(isTruthy(false)).toBe(false);
    expect(isTruthy(null)).toBe(false);
    expect(isTruthy(undefined)).toBe(false);
    expect(isTruthy()).toBe(false);
  });
});

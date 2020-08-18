import math from "./math";

describe("utils/math/calc", () => {
  it("should add a calculator buffer", () => {
    expect(math.calculate([2, "+", 2])).toEqual(4);
    expect(math.calculate([2, "+", 2, "+", 4, "+", 4])).toEqual(12);
    expect(math.calculate([10, "*", 2])).toEqual(20);
    expect(math.calculate([5, ".", 5, "*", 2])).toEqual(11);
  });
});

describe("utils/math", function () {
  it("math.sum", () => {
    expect(math.sum([1, 2])).toEqual(3);
  });
  it("math.average", () => {
    expect(math.average([30, 344, 21, 23])).toEqual(104.5);
  });

  it("should generate percentages", () => {
    let positivity = [10, 5, 2];
    console.log("Positivity", positivity);
    expect(JSON.stringify(math.percentile(positivity))).toEqual(JSON.stringify([100, 50, 20]));
  });

  it("math.average sleeo", () => {
    let avg = math.average([
      29400,
      25980,
      24720,
      27420,
      1860,
      24900,
      5400,
      21540,
      18960,
      18060,
      11340,
      60,
      21180,
      3600,
      17760,
      28140,
      26940,
      23580,
      24000,
      28260,
      22500,
      6000,
      4020,
      3840,
      15660,
      17340,
      10800,
      25440,
      32400,
      24000,
      29820,
      22500,
      27660,
      23760,
      5340,
      22320,
      28620,
      20580,
      22860,
      21840,
      25560,
    ]);
    expect(avg).toEqual(19413.66);
  });

  it("math.round - default", () => {
    expect(math.round(10.12345)).toEqual(10.12);
  });
  it("math.round - 1000", () => {
    expect(math.round(10.12345, 1000)).toEqual(10.123);
  });
  it("math.round - 10", () => {
    expect(math.round(10.12345, 10)).toEqual(10.1);
  });
  it("math.max", () => {
    expect(math.max([0, 12, 223, 332, 12, 345, 32.32, -324])).toEqual(345);
  });
  it("math.min - negative", () => {
    expect(math.min([0, 12, 223, 332, 12, 345, 32.32, -324, 443])).toEqual(-324);
  });
  it("math.min - no negative", () => {
    expect(math.min([1, 12, 223, 332, 12, 345, 32.32, 443])).toEqual(1);
  });
  it("math.percentage", () => {
    expect(math.percentage(100, 50)).toEqual(50);
  });
  it("math.random", () => {
    // expect(math.random([10, 20, 30])).to([10, 20, 30]);
  });
  it("math.random_range", () => {
    // expect(math.random_range(0, 100)).toHave(0, 100);
  });
  it("math.percentile", () => {
    // expect(math.percentile([0, 50, 100])).toContain([0, 50, 100]);
  });
  it("math.trustfulNumber", () => {
    expect(math.trustfulNumber(32 + "abc", 0)).toEqual(0);
  });
});

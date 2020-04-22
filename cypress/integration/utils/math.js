import math from "../../../src/utils/math/math";
import NomieUOM from "../../../src/utils/nomie-uom/nomie-uom";

describe("utils/math/calc", () => {
  it("should add a calculator buffer", () => {
    expect(math.calculate([2, "+", 2])).to.equal(4);
    expect(math.calculate([2, "+", 2, "+", 4, "+", 4])).to.equal(12);
    expect(math.calculate([10, "*", 2])).to.equal(20);
    expect(math.calculate([5, ".", 5, "*", 2])).to.equal(11);
  });
});

describe("utils/math", function () {
  it("math.sum", () => {
    expect(math.sum([1, 2])).to.equal(3);
  });
  it("math.average", () => {
    expect(math.average([30, 344, 21, 23])).to.equal(104.5);
  });

  it("should generate percentages", () => {
    let positivity = [10, 5, 2];
    console.log("Positivity", positivity);
    expect(JSON.stringify(math.percentile(positivity))).to.equal(JSON.stringify([100, 50, 20]));
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
    expect(avg).to.equal(19413.66);
  });

  it("math.round - default", () => {
    expect(math.round(10.12345)).to.equal(10.12);
  });
  it("math.round - 1000", () => {
    expect(math.round(10.12345, 1000)).to.equal(10.123);
  });
  it("math.round - 10", () => {
    expect(math.round(10.12345, 10)).to.equal(10.1);
  });
  it("math.max", () => {
    expect(math.max([0, 12, 223, 332, 12, 345, 32.32, -324])).to.equal(345);
  });
  it("math.min - negative", () => {
    expect(math.min([0, 12, 223, 332, 12, 345, 32.32, -324, 443])).to.equal(-324);
  });
  it("math.min - no negative", () => {
    expect(math.min([1, 12, 223, 332, 12, 345, 32.32, 443])).to.equal(1);
  });
  it("math.percentage", () => {
    expect(math.percentage(100, 50)).to.equal(50);
  });
  it("math.random", () => {
    expect(math.random([10, 20, 30])).to.be.oneOf([10, 20, 30]);
  });
  it("math.random_range", () => {
    expect(math.random_range(0, 100)).to.be.within(0, 100);
  });
  it("math.percentile", () => {
    expect(math.percentile([0, 50, 100])).to.include.members([0, 50, 100]);
  });
  it("math.trustfulNumber", () => {
    expect(math.trustfulNumber(32 + "abc", 0)).to.equal(0);
  });
});

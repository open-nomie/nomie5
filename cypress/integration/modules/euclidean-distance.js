// Nomie ID
import distance from "../../../src/modules/data-distance/data-distance";

describe("euclidean-distance", function () {
  it("get a distance between two super simular arrays", () => {
    let array1 = [2, 4, 6, 8];
    let array2 = [4, 8, 12, 16];
    expect(distance.euclidean(array1, array2)).to.equal(0);
  });
  it("get a distance between two same arrays", () => {
    let array1 = [2, 4, 6, 8];
    let array2 = [2, 4, 6, 8];
    expect(distance.euclidean(array1, array2)).to.equal(0);
  });
  it("get a distance between same x100 arrays", () => {
    let array1 = [200, 400, 600, 800];
    let array2 = [2, 4, 6, 8];
    expect(distance.euclidean(array1, array2)).to.equal(0);
  });

  it("get a distance between increment+1 arrays", () => {
    let array1 = [5, 7, 9, 11];
    let array2 = [2, 4, 6, 8];
    expect(distance.euclidean(array1, array2)).to.equal(25.5235);
  });
});

import euclidean from "euclidean-distance";
import math from "../../utils/math/math";
// import DTW from "dynamic-time-warping";

const euclideanDistance = (arr1, arr2) => {
  let array1 = math.percentile(arr1);
  let array2 = math.percentile(arr2);
  return parseFloat(euclidean(array1, array2).toFixed(2));
};

const dtwDistance = (arr1, arr2) => {
  const distFunc = function (a, b) {
    return Math.abs(a - b);
  };
  let dtw = new DTW(arr1, arr2, distFunc);
  let cost = dtw.getDistance();
  return cost;
};

export default {
  dtw: dtwDistance,
  euclidean: euclideanDistance,
};

import euclidean from "euclidean-distance";
import math from "../../utils/math/math";
import rSquared from "r-squared";
// import DTW from "dynamic-time-warping";

function dataPoints(arr) {
  return arr.filter((a) => a).length;
}

const rS = (ar1, ar2) => {
  let ar1DP = dataPoints(ar1);
  let ar2DP = dataPoints(ar2);

  return new Promise((resolve, reject) => {
    if (ar2DP < ar1DP * 0.3) {
      resolve(0);
    } else {
      rSquared.rSquared(ar1, ar2, (err, data) => {
        if (!err) {
          resolve(data);
        } else {
          reject(err);
        }
      });
    }
  });
};

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
  score: rS,
};

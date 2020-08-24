import rSquared from "r-squared";

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
      try {
        rSquared.rSquared(ar1, ar2, (err, data) => {
          if (!err) {
            resolve(data);
          } else {
            resolve(0);
          }
        });
      } catch (e) {
        console.log(`error getting distance`, ar1.length, ar2.length);
        resolve(0);
      }
    }
  });
};

export default {
  score: rS,
};

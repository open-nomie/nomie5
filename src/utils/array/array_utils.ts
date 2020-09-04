import _ from "lodash";

export default {
  // move(arr, old_index, new_index) {
  //   if (new_index >= arr.length) {
  //     var k = new_index - arr.length + 1;
  //     while (k--) {
  //       arr.push(undefined);
  //     }
  //   }
  //   arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
  //   return arr; // for testing
  // },
  split(arr = []) {
    let half = Math.ceil(arr.length * 0.5);
    return [arr.splice(0, half), arr.splice(-half)];
  },
  unique(array) {
    return _.uniq(array);
  },
  chunk(array, chunkSize) {
    return _.chunk(array, chunkSize);
  },
};

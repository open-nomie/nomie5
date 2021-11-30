import { chunk, uniq } from "lodash";

export default {
  split(arr = []) {
    let half = Math.ceil(arr.length * 0.5);
    return [arr.splice(0, half), arr.splice(-half)];
  },
  unique(array) {
    return uniq(array);
  },
  chunk(array, chunkSize) {
    return chunk(array, chunkSize);
  },
};

export default {
  move(arr, old_index, new_index) {
    if (new_index >= arr.length) {
      var k = new_index - arr.length + 1;
      while (k--) {
        arr.push(undefined);
      }
    }
    arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
    return arr; // for testing
  },
  split(arr = []) {
    let half = Math.ceil(arr.length * 0.5);
    return [arr.splice(0, half), arr.splice(-half)];
  },
  unique(array) {
    return [...new Set(array)];
  },
  chunk(array, chunkSize) {
    var arrayOfArrays = [];

    if (array.length <= chunkSize) {
      arrayOfArrays.push(array);
    } else {
      for (var i = 0; i < array.length; i += chunkSize) {
        arrayOfArrays.push(array.slice(i, i + chunkSize));
      }
    }
    return arrayOfArrays;
  },
};

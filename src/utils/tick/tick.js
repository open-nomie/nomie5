export default (time, callback) => {
  return new Promise(resolve => {
    setTimeout(() => {
      if (callback) {
        callback();
      }
      resolve();
    }, time);
  });
};

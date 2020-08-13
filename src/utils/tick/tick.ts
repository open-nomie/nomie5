export default (time: number, callback?: Function) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (callback) {
        callback();
      }
      resolve();
    }, time);
  });
};

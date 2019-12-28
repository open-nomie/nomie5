export default (time, callback) => {
  return new Promise(resolve => {
    setTimeout(() => {
      callback || function() {};
    }, time);
  });
};

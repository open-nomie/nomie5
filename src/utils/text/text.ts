export default {
  truncate(str: string, len: number) {
    if (str.length <= len) {
      return str;
    } else {
      return str.substr(0, len) + "...";
    }
  },
};

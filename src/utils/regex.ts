const regex = {
  escape(str) {
    return str.replace(/[@.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
  },
};
export default regex;

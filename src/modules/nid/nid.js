/**
 * nid - nomie id
 * A small utility class to generate a unique-ish ID with a set length.
 * Since nomie runs locally, a collision will be unlikedly
 *
 */
import md5 from "md5";
export default (a1, a2) => {
  let str = new Date().getTime() + Math.random();
  let len = 32;
  if (typeof a1 == "string") {
    str = a1;
    len = a2 || len;
  } else if (typeof a1 == "number") {
    len = a1;
  }
  return md5(str).substr(0, len);
};

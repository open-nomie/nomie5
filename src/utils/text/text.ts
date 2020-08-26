export function truncateText(str: string, len: number) {
  if (str.length <= len) {
    return str;
  } else {
    return str.substr(0, len) + "...";
  }
}
export default {
  truncate: truncateText,
};

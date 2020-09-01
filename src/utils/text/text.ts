export function truncateText(str: string, len: number, showEnd: number = 0) {
  if (str.length <= len) {
    return str;
  } else {
    if (showEnd) {
      let end = str.substr(str.length - showEnd, str.length);
      let start = str.substr(0, len - showEnd);
      return `${start}...${end}`;
    } else {
      return str.substr(0, len) + "...";
    }
  }
}

export default {
  truncate: truncateText,
};

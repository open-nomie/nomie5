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

export function initials(str: string): string {
  str = `${str}`;
  const split = str.split(" ");
  if (split.length > 1) {
    return `${split[0].substr(0, 1)}${split[split.length - 1].substr(0, 1)}`.toUpperCase();
  } else if (!str.length) {
    return "NA";
  } else {
    return str.substr(0, 2).toUpperCase();
  }
}

export default {
  truncate: truncateText,
  initials,
};

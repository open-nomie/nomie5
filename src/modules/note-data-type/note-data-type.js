import regex from "../../utils/regex";
import Tracker from "../tracker/tracker";

import { TrackerStore } from "../../store/trackers";

export function parse(str) {
  if (str.search(regex.escape("@")) > -1) {
    let username = str.replace(regex.escape("@"), "");
    return {
      type: "person",
      prefix: "@",
      value: username,
      str,
      tracker: new Tracker({ tag: username }),
    };
  } else if (str.search(regex.escape("#")) > -1) {
    return {
      type: "tracker",
      prefix: "#",
      value: str.replace(regex.escape("#"), ""),
      str,
      tracker: TrackerStore.getByTag(str.replace(regex.escape("#"), "")),
    };
  } else if (str.search(regex.escape("+")) > -1) {
    const context = str.replace(regex.escape("+"), "");
    return {
      type: "context",
      prefix: "+",
      value: context,
      str,
      tracker: new Tracker({ tag: context }),
    };
  } else {
    return {
      type: "generic",
      prefix: "",
      value: str.replace(regex.escape("#"), ""),
      str,
      tracker: new Tracker({ tag: str }),
    };
  }
}

export default { parse };

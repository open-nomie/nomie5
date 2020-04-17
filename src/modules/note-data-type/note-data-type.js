import regex from "../../utils/regex";
import Tracker from "../tracker/tracker";

export function generate(str, type) {
  switch (type) {
    case "tracker":
      return `#${str}`;
      break;
    case "person":
      return `@${str}`;
      break;
    case "context":
      return `+${str}`;
      break;
    default:
      return str;
      break;
  }
}

export function toSearchString(str) {
  let type = parse(str);
  console.log("Tosearch", { type, str });
  if (type.type == "tracker") {
    return regex.template.tagOnly(type.value);
  } else if (type.type == "person") {
    return regex.template.person(type.value);
  } else if (type.type == "context") {
    return regex.template.context(type.value);
  } else {
    return regex.template.generic(str);
  }
}

export function parse(str) {
  if (str.search(regex.escape("@")) > -1) {
    let username = str.replace(regex.escape("@"), "");
    return {
      type: "person",
      prefix: "@",
      value: username.replace("@", ""),
      str,
      count: 1,
    };
  } else if (str.search(regex.escape("#")) > -1) {
    let trackerValue;
    try {
      let matchArray = str.match(/\((\d|.){1,300}\)/g);
      trackerValue = parseFloat(matchArray[0].replace(/(\(|\))/g, ""));
    } catch (e) {
      console.error("error parsing tracker", e.message);
      trackerValue = 1;
    }
    return {
      type: "tracker",
      prefix: "#",
      value: str.split("(")[0].replace("#", ""),
      str,
      count: trackerValue,
    };
  } else if (str.search(regex.escape("+")) > -1) {
    const context = str.replace(regex.escape("+"), "");
    return {
      type: "context",
      prefix: "+",
      value: context.replace("+", ""),
      str,
      count: 1,
    };
  } else {
    return {
      type: "generic",
      prefix: "",
      value: str.replace(regex.escape("#"), ""),
      str,
      count: 1,
    };
  }
}

export default { parse, toSearchString, generate };

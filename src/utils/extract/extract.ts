import TrackableElement from "../../modules/trackable-element/trackable-element";
import snakeCase from "../snake-case/snake-case";

import { tokenize } from "nomie-utils";

declare var window: any;
window.tokenize = tokenize;

/**
 * Parse a string into an array of Trackable Items
 * pass in an optional option.includeGeneric to include all terms
 * @param {String} str
 * @param {Object} options
 */
function parse(str = "", options?: any): Array<TrackableElement> {
  options = options || {};
  return tokenize(str)
    .map((elementObj) => {
      return new TrackableElement(elementObj);
    })
    .filter((element) => {
      if (options.includeGeneric) {
        return true;
      } else {
        return element.type !== "generic" && element.type !== "line-break";
      }
    });
}
/**
 * Converts a single trackable element like #tag or @people to a TrackableElement
 * @param {String} str
 */
function toElement(str: string) {
  const parsed: Array<TrackableElement> = parse(str);
  if (parsed.length) {
    return parsed[0];
  } else if (str.length) {
    parsed.push(new TrackableElement({ id: snakeCase(str), raw: str, type: "generic" }));
  }
  return parsed.length ? parsed[0] : null;
}

function generateRaw(str = "", type = "generic") {
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

export default {
  parse,
  toElement,
  generateRaw,
  people(str) {
    return parse(str).filter((trackableElement) => {
      return trackableElement.type == "person";
    });
  },
  trackers(str) {
    return parse(str).filter((trackableElement) => {
      return trackableElement.type == "tracker";
    });
  },
  context(str) {
    return parse(str).filter((trackableElement) => {
      return trackableElement.type == "context";
    });
  },
};

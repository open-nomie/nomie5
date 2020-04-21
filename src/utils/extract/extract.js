import TrackableElement from "../../modules/trackable-element/trackable-element";
import snakeCase from "../snake-case/snake-case";
import stringToValue from "../string-to-value/string-to-value";
import noteParser from "./note-parser";

/**
 * Parse a string into an array of Trackable Items
 * pass in an optional option.includeGeneric to include all terms
 * @param {String} str
 * @param {Object} options
 */
function parse(str = "", options = {}) {
  return noteParser(str)
    .map((elementObj) => {
      let element = new TrackableElement(elementObj);
      element.value = stringToValue(element.value);
      return element;
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
function toElement(str = {}) {
  const parsed = parse(str);
  if (parsed.length) {
    return parsed[0];
  } else if (str.length) {
    parsed.push(new TrackableElement({ id: snakeCase(str), raw: str, type: "generic" }));
  }
  return parsed.length ? parsed[0] : null;
}

/**
 * Cleans up a string before processing it.
 * @param {string} word
 */
function scrub(word) {
  let cleanedWord = word.replace(/(\'|\,|\.|\!|’|\?|:)/gi, "").trim();
  return {
    word: cleanedWord.trim(),
    remainder: word.replace(cleanedWord, ""),
  };
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

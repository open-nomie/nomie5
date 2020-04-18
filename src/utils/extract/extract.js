import TrackableElement from "../../modules/trackable-element/trackable-element";
import snakeCase from "../snake-case/snake-case";
import stringToValue from "../string-to-value/string-to-value";

/**
 * Parse a string into an array of Trackable Items
 * pass in an optional option.includeGeneric to include all terms
 * @param {String} str
 * @param {Object} options
 */
function parse(str = "", options = {}) {
  return (
    str
      .split(" ") // Convert to Array
      .map((word) => {
        // Loop over each word
        let scrubbed = scrub(word); // Scrub it clean
        let wordSplit = word.replace("#", "").split("(");
        let valueStr = wordSplit.length == 2 ? wordSplit[1].replace(")", "") : 1;
        let id = scrub(wordSplit[0]).word;

        switch (
          word.substr(0, 1) // switch to match of first character
        ) {
          // Tracker Type
          case "#":
            // Split for value gathering
            return new TrackableElement({
              id,
              raw: scrubbed.word,
              prefix: "#",
              type: "tracker",
              value: stringToValue(valueStr), // convert to value
              remainder: scrubbed.remainder,
              obj: window && window.$TrackerStore ? window.$TrackerStore.trackers[id] : null,
            });
            break;
          // People Type
          case "@":
            return new TrackableElement({
              id: id.replace("@", ""),
              raw: scrubbed.word,
              prefix: "@",
              type: "person",
              value: stringToValue(valueStr),
              remainder: scrubbed.remainder,
            });
            break;
          // Context Types
          case "+":
            return new TrackableElement({
              id: id.replace("+", ""),
              raw: scrubbed.word,
              prefix: "+",
              type: "context",
              value: stringToValue(valueStr),
              remainder: scrubbed.remainder,
            });
            break;
          // Default Type
          default:
            if (options.includeGeneric) {
              return new TrackableElement({
                id: word,
                raw: word,
                type: "generic",
                value: 1,
              });
            } else {
              return null;
            }
            break;
        }
      })
      .filter((word) => word) || []
  );
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
  let cleanedWord = word.replace(/(\'|\,|\.|\!|’|\?|:)/gi, "");
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
  all(str) {
    return {
      people: extractPeople(str),
      trackers: extractTrackers(str),
      context: extractContext(str),
    };
  },
  // asArray(str) {
  //   let all = this.all(str);
  //   console.log(all.trackers);
  //   return [...all.trackers, ...all.people, ...all.context];
  // },
  // asNote(str) {
  //   let note = [];
  //   let all = this.all(str);

  //   Object.keys(all.trackers || []).forEach((tag) => {
  //     let tkr = all.trackers[tag];
  //     if (tkr.value) {
  //       note.push(`#${tag}(${tkr.value})`);
  //     } else {
  //       note.push(`#${tag}`);
  //     }
  //   });
  //   (all.people || []).forEach((person) => {
  //     note.push(`@${person}`);
  //   });
  //   (all.context || []).forEach((context) => {
  //     note.push(`+${context}`);
  //   });
  //   return note.join(" ");
  // },
};

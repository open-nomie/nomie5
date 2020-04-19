export default function (str = "") {
  /**
   * getValueString
   * Returns a value string from #tracker(value)
   * @param {String} word
   */
  function getValueString(word) {
    const wordSplit = word.split("(");
    // if it's has a (value) use it, otherwise default to 1
    const valueStr = wordSplit.length == 2 ? wordSplit[1].replace(")", "") : 1;
    return valueStr;
  }

  /**
   * Scrub
   * Removes common word ending characters
   * @param {String} word
   */
  function scrub(word) {
    const cleanedWord = word.replace(/(\'|\,|\.|\!|’|\?|:)/gi, "").trim();
    return {
      word: cleanedWord.trim(),
      remainder: word.replace(cleanedWord, ""),
    };
  }

  /**
   * toElement
   * Creates a payload that can be turned into a TrackerElement
   * @param {String} type tracker,context,person,generic
   * @param {String} word
   * @param {String} value
   * @param {String} remainder
   */
  function toElement(type, word, value, remainder) {
    const prefixes = { context: "+", person: "@", tracker: "#" };
    const prefix = prefixes[type] || "";
    return {
      id: word.replace(prefix, "").split("(")[0], // key/id
      raw: word, // Raw word
      prefix, // #,@,+
      type, // type of trackableElement
      value, // value of the tracker
      remainder, //any trailing words
    };
  }

  /**
   * Parse
   * parses a string and returns an array of
   * elements
   * @param {String} str
   */
  function parse(str = "") {
    // Split to array
    const parsedNote =
      str
        .split(" ")
        .map((word) => {
          // Loop over each word
          let scrubbed = scrub(word); // Scrub it clean
          let valueStr = getValueString(word);
          let firstChar = word.trim().substr(0, 1);
          // Switch for type
          switch (firstChar) {
            // Tracker Type
            case "#":
              return toElement("tracker", scrubbed.word, valueStr, scrubbed.remainder);
              break;
            case "@":
              return toElement("person", scrubbed.word, valueStr, scrubbed.remainder);
              break;
            case "+":
              return toElement("context", scrubbed.word, valueStr, scrubbed.remainder);
              break;
            default:
              return toElement("generic", word, "");
              break;
          }
        })
        .filter((word) => word) || [];

    // Return parsed note
    return parsedNote;
  }
  /**
   * Main Return for the function
   */
  return parse(str);
}

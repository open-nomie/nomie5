export default function (str = "") {
  /**
   * getValueString
   * Returns a value string from #tracker(value)
   * @param {String} word
   */
  function getValueString(word) {
    // if it's has a (value) use it, otherwise default to 1
    const wordSplit = word.split("(");
    const valueStr = wordSplit.length == 2 ? wordSplit[1].replace(")", "") : 1;
    return valueStr;
  }

  /**
   * Scrub
   * Removes common word ending characters
   * @param {String} word
   */
  function scrub(word) {
    const cleanedWord = word.replace(/(\'|\,|\.|\!|’|\?|:)/gi, "");
    return {
      word: cleanedWord,
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
  const prefixes = { context: "+", person: "@", tracker: "#" };
  function toElement(type, word, value, remainder, raw) {
    const prefix = prefixes[type] || "";
    const id = word.search(/\(/) > -1 ? word.replace(prefix, "").split("(")[0] : word.replace(prefix, "");
    const raw = raw || word || "";
    return {
      id,
      raw, // Raw word
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
    // Split it into an array of lines
    let lines = str.split(/\r?\n/);
    let final = [];
    // Loop over each line
    lines.forEach((line) => {
      // Extract
      let elements = parseStr(line);
      // Loop over the elements in this line
      for (var e = 0; e < elements.length; e++) {
        final.push(elements[e]);
      }
      // Add the line Break
      if (lines.length > 1) {
        final.push(toElement("line-break", ""));
      }
    });
    // Return parsed note
    return final;
  }

  /**
   * Parse a Line to an array.
   * @param {String} str
   */
  function parseStr(str) {
    return (
      str
        .trim()
        .split(" ") // Split on the space
        .map((word) => {
          // Loop over each word
          word = word.trim();
          let scrubbed = scrub(word); // Scrub it clean
          let valueStr = getValueString(word);
          let firstChar = word.substr(0, 1);
          // Switch for type
          if (firstChar === "#") {
            return toElement("tracker", scrubbed.word, valueStr, scrubbed.remainder.replace(word, ""));
          } else if (firstChar == "@") {
            return toElement("person", scrubbed.word, valueStr, scrubbed.remainder);
          } else if (firstChar == "+") {
            return toElement("context", scrubbed.word, valueStr, scrubbed.remainder);
          } else {
            if (word.search(/https:|http:/) > -1) {
              return toElement("link", word.replace(/(https|http):\/\//gi, ""), null, null, word);
            } else if (word) {
              return toElement("generic", word, "");
            }
          }
        })
        .filter((word) => word) || []
    );
  } // end parse string

  /**
   * Main Return for the function
   */
  return parse(str);
}

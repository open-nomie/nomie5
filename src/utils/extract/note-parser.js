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
  function toElement(type, word, value, remainder, raw) {
    const prefixes = { context: "+", person: "@", tracker: "#" };
    const prefix = prefixes[type] || "";
    return {
      id: word.replace(prefix, "").split("(")[0], // key/id
      raw: raw || word, // Raw word
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
      elements.forEach((element) => {
        final.push(element);
      });
      // Add the line Break
      if (lines.length > 1) {
        final.push(toElement("line-break", ""));
      }
    });
    // Return parsed note
    return final;
  }

  function parseStr(str) {
    return (
      str
        .trim()
        .split(" ") // Split on the space
        .map((word) => {
          // Loop over each word
          let scrubbed = scrub(word); // Scrub it clean
          let valueStr = getValueString(word);
          let firstChar = word.trim().substr(0, 1);
          // Switch for type
          switch (firstChar) {
            // Tracker Type
            case "#":
              return toElement("tracker", scrubbed.word, valueStr, scrubbed.remainder.replace(word, ""));
              break;
            case "@":
              return toElement("person", scrubbed.word, valueStr, scrubbed.remainder);
              break;
            case "+":
              return toElement("context", scrubbed.word, valueStr, scrubbed.remainder);
              break;
            default:
              if (
                word
                  .trim()
                  .substr(0, 6)
                  .match(/https:|http:/)
              ) {
                let link = word.trim().replace(/(https|http):\/\//gi, "");
                return toElement("link", link, null, null, word.trim());
              } else {
                if (word) {
                  return toElement("generic", word, "");
                }
              }
              break;
          }
        })
        .filter((word) => word) || []
    );
  }

  /**
   * Main Return for the function
   */
  return parse(str);
}

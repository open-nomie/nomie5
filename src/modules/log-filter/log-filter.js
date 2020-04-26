import extractor from "../../utils/extract/extract";
import tokenizer from "search-text-tokenizer";
import TrackableElement from "../../modules/trackable-element/trackable-element";
import regex from "../../utils/regex";

export default function (logs, filter) {
  filter = filter || {};

  // First filter on search if it exists
  if (filter.search) {
    let searchType;
    if (filter.search instanceof TrackableElement) {
      searchType = filter.search;
    } else {
      searchType = extractor.toElement(filter.search);
    }
    // Convert search to token
    const tokens = tokenizer(searchType.toSearchTerm());
    // Filter Logs by tokens
    let filtered = logs.filter((log) => {
      // Tokenize the note
      let note = log.note
        .toLowerCase()
        .replace(/(\'|\,|\.|\!|’|\?|:)/gi, "")
        .split(" ");
      // Holder of matches
      let match = [];
      // Loop over tokenized search term
      tokens.forEach((token) => {
        // If we should exclude it
        if (token.exlcude) {
          // Does it have this term?
          match.push(note.indexOf(token.term) === -1);
        } else {
          // It's a normal search - look at the note completely
          let matches = note.filter((word) => {
            // split the word on ( - to see if it's a match
            if (searchType.type == "generic") {
              return word.match(token.term);
            } else {
              return word.split("(")[0] == token.term;
            }
          });
          match.push(matches.length ? true : false);
        }
      });
      return match.indexOf(false) === -1;
    }); // end filtered

    logs = filtered;
  } // end if we have a search term

  //. Now filter logs on start and end date

  if (filter.start || filter.end) {
    logs = logs.filter((log) => {
      let pass = false;
      if (filter.start && filter.end) {
        pass = log.end >= filter.start && log.end <= filter.end;
      } else if (filter.start) {
        pass = log.end >= filter.start;
      } else if (filter.end) {
        pass = log.end <= filter.end;
      }
      return pass;
    });
  } // end if data provided

  // If limit
  if (filter.limit) {
    logs = logs.filter((row, i) => {
      return i <= filter.limit;
    });
  }
  // end if limit

  return logs;
}

import extractor from "../../utils/extract/extract";
import tokenizer from "search-text-tokenizer";
import TrackableElement from "../trackable-element/trackable-element";

import searchItems from "../../utils/search/search-items";
import latinize from "../../utils/search/latinize";
import NLog from "../nomie-log/nomie-log";

export default function (logs, filter) {
  filter = filter || { fuzzy: false };

  let term;
  if (filter.search instanceof TrackableElement) {
    term = latinize(filter.search.toSearchTerm());
  } else {
    term = latinize(filter.search);
  }

  // If a search term is provided, filter it
  if (term) {
    logs = searchItems(term, logs, { fields: ["note"], fuzzy: filter.fuzzy });
  }

  // Filter by date if provided
  if (filter.start || filter.end) {
    logs = logs.filter((log: NLog) => {
      log = log instanceof NLog ? log : new NLog(log);
      let pass = false;
      if (filter.start && filter.end.valueOf()) {
        pass = log.end >= filter.start.valueOf() && log.end <= filter.end.valueOf();
      } else if (filter.start) {
        pass = log.end >= filter.start.valueOf();
      } else if (filter.end) {
        pass = log.end <= filter.end.valueOf();
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

// First filter on search if it exists
// if (filter.search) {
//   let searchType;
//   if (filter.search instanceof TrackableElement) {
//     searchType = filter.search;
//   } else {
//     searchType = extractor.toElement(filter.search);
//   }
//   // Convert search to token
//   const tokens = tokenizer(searchType.toSearchTerm());
//   // Filter Logs by tokens
//   let filtered = logs.filter((log) => {
//     // Tokenize the note
//     let note = log.note
//       .toLowerCase()
//       .replace(/\n/g, " ") // remove line breaks
//       .replace(/(\'|\,|\.|\!|’|\?|:)/gi, "")
//       .split(" ");
//     // Holder of matches
//     let match = [];
//     // Loop over tokenized search term
//     tokens.forEach((token) => {
//       // If we should exclude it
//       if (token.exclude) {
//         // Does it have this term?
//         match.push(note.indexOf(token.term) === -1);
//       } else {
//         // It's a normal search - look at the note completely
//         let matches = note.filter((word) => {
//           // split the word on ( - to see if it's a match
//           if (searchType.type == "generic") {
//             return word.match(token.term);
//           } else {
//             return word.split("(")[0] == token.term;
//           }
//         });
//         match.push(matches.length ? true : false);
//       }
//     });
//     return match.indexOf(false) === -1;
//   }); // end filtered

//   logs = filtered;
// } // end if we have a search term

//. Now filter logs on start and end date

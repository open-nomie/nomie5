import TrackableElement from "../trackable-element/trackable-element";
import searchItems from "../../utils/search/search-items";
import latinize from "../../utils/search/latinize";
import NLog from "../nomie-log/nomie-log";

export default function (searchLogs: Array<NLog>, filter) {
  let logs: Array<NLog> = searchLogs || [];

  filter = filter || { fuzzy: false };

  let term;
  if (filter.search instanceof TrackableElement) {
    term = latinize(filter.search.toSearchTerm());
  } else if (filter.search) {
    term = latinize(filter.search);
  }

  // If a search term is provided, filter it
  if (term) {
    logs = searchItems(term, searchLogs, { fields: ["note"], fuzzy: filter.fuzzy });
  }

  // Filter by date if provided
  if (filter.start || filter.end) {
    let start = filter.start?.valueOf();
    let end = filter.end?.valueOf();

    logs = logs.filter((log: NLog) => {
      log = log instanceof NLog ? log : new NLog(log);
      let pass = false;
      if (start && end) {
        pass = log.end >= start && log.end <= end;
      } else if (filter.start) {
        pass = log.end >= start;
      } else if (filter.end) {
        pass = log.end <= end;
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

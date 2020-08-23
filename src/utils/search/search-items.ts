import searchTokenizer from "./search-tokenizer";
import latinize from "./latinize";
import regex from "../../utils/regex";

export interface ISearchOptions {
  fields?: Array<string>;
  fuzzy?: boolean;
}

function indexRow(row: any, options: ISearchOptions) {
  let source: string;

  // Use any specific fields
  if (options && options.fields) {
    source = options.fields
      .map((key) => {
        return row[key];
      })
      .join(" ")
      .toLowerCase();
  } else {
    source = JSON.stringify(row).toLowerCase();
  }
  // Remove tracker values
  source = latinize(source.replace(/\n/g, " ").replace(/(\'|,|\.|\?|\!|\"|\:|\)|\()/gi, " "));
  return source;
}

export default function searchItems(query: string, rows: Array<any>, options?: ISearchOptions) {
  let results: Array<any> = [];
  options = options || { fuzzy: false };
  // For at least 2 characters
  if (query && query.length > 1) {
    // Convert to tokens
    let tokens = searchTokenizer(query);
    // Loop over provided rows
    rows.forEach((row: any) => {
      let source = indexRow(row, options);

      // let sourceSplit: Array<string> = source
      //   .replace(/(\(\d{0,200})\)/, "")
      //   .split(" ")
      //   .filter((obj) => obj);
      // Loop through each search group
      tokens.forEach((toks) => {
        let matches = [];
        // Loop through each word in the group
        toks.forEach((word: string) => {
          let exactLookup = `(${regex.escape(word)})(\\s|$)`;
          // Fuzzy search
          if (options.fuzzy && source.search(word) > -1) {
            matches.push(true);
          } else if (!options.fuzzy && source.match(new RegExp(exactLookup, "gi"))) {
            matches.push(true);
          }
        });
        // If match array and toks match - it covered all required words
        if (matches.length == toks.length && results.indexOf(row) == -1) {
          results.push(row);
        }
      });
    });
  }

  return results;
}

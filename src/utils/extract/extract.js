import extractTrackers from "./extract-trackers"; // extract tracker function
import extractPeople from "./extract-people";
import extractContext from "./extract-context";

import NoteDataType from "../../modules/note-data-type/note-data-type";
import TrackableElement from "../../modules/trackable-element/trackable-element";

export default {
  parse(str) {
    str = str.replace(/(\'|\,|\.|\!|’|\?)/gi, "");
    let arr = str
      .split(" ")
      .map((word) => {
        switch (word.substr(0, 1)) {
          case "#":
            let wordSplit = word.replace("#", "").split("(");
            return new TrackableElement({
              id: wordSplit[0],
              raw: word,
              prefix: "#",
              type: "tracker",
              value: wordSplit.length == 2 ? wordSplit[1].replace(")", "") : 1,
            });
            break;
          case "@":
            return new TrackableElement({
              id: word.replace("@", ""),
              raw: word,
              prefix: "@",
              type: "person",
            });
            break;
          case "+":
            return new TrackableElement({
              id: word.replace("+", ""),
              raw: word,
              prefix: "+",
              type: "context",
            });
            break;
        }
      })
      .filter((word) => word);

    console.log("array", { str, arr });

    return arr;
  },

  all(str) {
    return {
      trackers: extractTrackers(str),
      people: extractPeople(str),
      context: extractContext(str),
    };
  },
  people(str) {
    return extractPeople(str);
  },
  trackers(str) {
    return extractTrackers(str);
  },
  context(str) {
    return extractContext(str);
  },
  asArray(str) {
    let all = this.all(str);
    return [...all.trackers, ...all.people, ...all.context];
  },
  asNote(str) {
    let note = [];
    let all = this.all(str);

    Object.keys(all.trackers || []).forEach((tag) => {
      let tkr = all.trackers[tag];
      if (tkr.value) {
        note.push(`#${tag}(${tkr.value})`);
      } else {
        note.push(`#${tag}`);
      }
    });
    (all.people || []).forEach((person) => {
      note.push(`@${person}`);
    });
    (all.context || []).forEach((context) => {
      note.push(`+${context}`);
    });
    return note.join(" ");
  },
};

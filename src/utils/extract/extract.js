import extractTrackers from "./extract-trackers"; // extract tracker function
import extractPeople from "./extract-people";
import extractContext from "./extract-context";

export default {
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

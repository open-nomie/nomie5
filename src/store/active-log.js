import { writable } from "svelte/store";
import NomieLog from "../modules/nomie-log/nomie-log";
import Logger from "../utils/log/log";
import Hooky from "../modules/hooks/hooks";
import dayjs from "dayjs";
import ScoreNote from "../modules/scoring/score-note";
const console = new Logger("✴️ store/active-log.js");

const activeLogInit = () => {
  let base = new NomieLog();
  // Start with empty time - let ledger set it one.
  base.end = null;
  base.start = null;

  const { subscribe, set, update } = writable(base);

  const hooky = new Hooky();

  const methods = {
    clear() {
      return update((n) => {
        n = new NomieLog();
        n.start = null;
        n.end = null;
        return n;
      });
    },
    hook(hookType, func) {
      // pass to hooky
      hooky.hook(hookType, func);
    },
    updateNote(note) {
      update((b) => {
        b.note = note;
        // this.runHook('onUpdate', b);
        hooky.run("onUpdate", b);
        return b;
      });
    },
    asLog() {
      let log;
      update((b) => {
        log = new NomieLog(b);
        return b;
      });
      return log;
    },
    calculateScore(note) {
      return ScoreNote(note, new Date().getTime());
    },
    removeStr(str) {
      update((b) => {
        b.note = b.note
          .split(" ")
          .filter((word) => {
            return word !== str;
          })
          .join(" ");
        return b;
      });
    },
    addElement(element) {
      update((state) => {
        let note = (state.note || "").trim().split(" ");
        note.push(element);
        state.note = note.join(" ");
        hooky.run("onAddElement", { element });
        return state;
      });
    },
    addTag(tag, value) {
      update((b) => {
        if (!isNaN(parseFloat(value))) {
          b.note = `${b.note} #${tag}(${value}) `;
        } else {
          b.note = `${b.note} #${tag} `;
        }
        hooky.run("onAddTag", { tag, value });
        return b;
      });
    },
  };

  return {
    subscribe,
    update,
    set,
    ...methods,
  };
};

export const ActiveLogStore = activeLogInit();

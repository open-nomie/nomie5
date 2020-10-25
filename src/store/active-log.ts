import { writable } from "svelte/store";
import NomieLog from "../modules/nomie-log/nomie-log";
import Logger from "../utils/log/log";
import Hooky from "../modules/hooks/hooks";
import dayjs from "dayjs";
import ScoreNote from "../modules/scoring/score-note";
const console = new Logger("✴️ store/active-log.js");

const activeLogInit = () => {
  let base = new NomieLog({});
  // Start with empty time - let ledger set it one.
  base.end = null;
  base.start = null;

  const { subscribe, set, update } = writable(base);
  const hooky = new Hooky();

  const methods = {
    clear() {
      console.log("Clearing Active Log");
      return update((state) => {
        state = new NomieLog({});
        state.start = null;
        state.end = null;
        return state;
      });
    },
    hook(hookType, func) {
      // pass to hooky
      hooky.hook(hookType, func);
    },
    updateNote(note) {
      update((state) => {
        state.note = note;
        // this.runHook('onUpdate', b);
        hooky.run("onUpdate", state);
        return state;
      });
    },
    asLog() {
      let log;
      update((state) => {
        log = new NomieLog(state);
        return state;
      });
      return log;
    },
    calculateScore(note: string) {
      return ScoreNote(note, new Date().getTime());
    },
    removeStr(str: string) {
      update((state) => {
        state.note = state.note
          .split(" ")
          .filter((word) => {
            return word !== str;
          })
          .join(" ");
        return state;
      });
    },
    addElement(element) {
      update((state) => {
        let note = (state.note || "").trim().split(" ");
        note.push(element);
        state.note = note.join(" ") + " ";
        // hooky.run("onAddElement", { element });
        return state;
      });
    },
    addTag(tag, value) {
      update((state) => {
        if (!isNaN(parseFloat(value))) {
          state.note = `${state.note} #${tag}(${value}) `;
        } else {
          state.note = `${state.note} #${tag} `;
        }
        hooky.run("onAddTag", { tag, value });
        return state;
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

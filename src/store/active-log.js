import { writable } from "svelte/store";
import NomieLog from "../modules/nomie-log/nomie-log";
import ExtractTrackers from "../utils/extract-trackers/extract-trackers";
import Logger from "../utils/log/log";
import Hooky from "../modules/hooks/hooks";
import dayjs from "dayjs";
import CalculateScore from "../utils/calculate-score/calculate-score";
const console = new Logger("✴️ store/active-log.js");

const activeLogInit = () => {
  let base = new NomieLog().toObject();
  // Start with empty time - let ledger set it one.
  base.end = null;
  base.start = null;

  const { subscribe, set, update } = writable(base);

  const hooky = new Hooky();

  const methods = {
    clear() {
      return update(n => {
        n = new NomieLog().toObject();
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
      update(b => {
        b.note = note;
        // this.runHook('onUpdate', b);
        hooky.run("onUpdate", b);
        return b;
      });
    },
    asLog() {
      let log;
      update(b => {
        log = new NomieLog(b);
        return b;
      });
      return log;
    },
    calculateScore(note) {
      return CalculateScore(note, new Date().getTime());
    },
    removeStr(str) {
      update(b => {
        b.note = b.note
          .split(" ")
          .filter(word => {
            return word !== str;
          })
          .join(" ");
        return b;
      });
    },
    addTag(tag, value) {
      update(b => {
        if (!isNaN(value)) {
          b.note = `${b.note} #${tag}(${value}) `;
        } else {
          b.note = `${b.note} #${tag} `;
        }
        hooky.run("onAddTag", { tag, value });
        return b;
      });
    }
  };

  return {
    subscribe,
    update,
    set,
    ...methods
  };
};

export const ActiveLogStore = activeLogInit();

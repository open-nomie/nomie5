import { ActiveLogStore } from "../../store/active-log";
import { LedgerStore } from "../../store/ledger";
import { Interact } from "../../store/interact";
import extractor from "../../utils/extract/extract-trackers";
import Tracker from "./tracker";
import PromiseStep from "../../utils/promise-step/promise-step";
import NomieLog from "../../modules/nomie-log/nomie-log";

export default class TrackerInputer {
  constructor(tracker, $TrackerStore) {
    this.tracker = tracker;
    this.value = 0;
    this.listeners = {
      cancel: [],
      value: [],
    };
    this.$TrackerStore = $TrackerStore;
  }

  on(type, func) {
    if (this.listeners[type].indexOf(func) == -1) {
      this.listeners[type].push(func);
    }
  }
  fire(type) {
    this.listeners[type].forEach((func) => {
      func(this);
    });
  }

  async getTrackerInputAsString(tracker, value) {
    const response = await Interact.trackerInput(tracker, { value, allowSave: false });
    if (response && response.tracker) {
      return `#${response.tracker.tag}(${response.value}) `;
    } else {
      return ``;
    }
  }

  async getNoteTrackerInputAsString(tracker) {
    // Set up the Note
    let note = [];
    // Get Tracker tags from this trackers note
    const trackerTags = extractor(tracker.note);
    // Add this trackers tag for logging
    note.push(`#${tracker.tag}`);

    // Create array of items to pass to promise step
    let items = Object.keys(trackerTags).map((tag) => {
      return {
        tracker: $TrackerStore.trackers[tag] || new Tracker({ tag: tag }),
        value: trackerTags[tag].value, // not being used
      };
    });

    for (let i = 0; i < items.length; i++) {
      let response = await this.getTrackerInputAsString(items[i].tracker, items[i].value);
      note.push(response);
    }
    return note.join(" ");
  }

  //
  async getNoteString() {
    let note = [];
    if (this.tracker.type === "tick") {
      note.push(`#${this.tracker.tag}`);
    } else if (this.tracker.type === "note") {
      let input = await this.getNoteTrackerInputAsString(this.tracker);
      note.push(input);
    } else {
      let input = await this.getTrackerInputAsString(this.tracker);
      note.push(input);
    }
    return note.join(" ");
  }

  async get(options) {
    options = options || {};

    // If it's a plain old tick tracker
    return new Promise((resolve, reject) => {
      let finished = (payload) => {
        resolve(payload);
      };
      let finishedWithError = (err) => {
        console.error("error", err);
        reject(err);
      };
      if (options.replace) {
        setTimeout(() => {
          ActiveLogStore.removeStr(options.replace);
        }, 120);
      }
      if (this.tracker.type === "tick") {
        // Just add the tag to the note
        ActiveLogStore.addTag(this.tracker.tag);
        let includeStr = tracker.getIncluded(1);
        ActiveLogStore.addElement(includeStr);
        // If it's one_tap - then save it
        finished();
        // If it's a note (combined trackers)
      } else if (this.tracker.type === "note") {
        /**
         * Note Tracker Type
         * This is a note tracker type and will
         * ask the user to provide inputs for
         * each type of note
         **/

        // This way we can look up some stats on it too
        ActiveLogStore.addTag(this.tracker.tag);

        // Setup a temp log with the tracker note
        const tempLog = new NomieLog({ note: this.tracker.note });
        // Extract the meta data from the note
        const meta = tempLog.getMeta();
        // Get tag, context, people
        let tagAndValue = meta.trackers;
        let contexts = meta.context;
        let people = meta.people;
        // Loop over people add to log
        people.forEach((person) => {
          ActiveLogStore.addElement(`@${person}`);
        });
        // Loop over context add to log
        contexts.forEach((context) => {
          ActiveLogStore.addElement(`+${context}`);
        });
        // Add Note Tracker Tag to the note first...

        // Create array of items to pass to promise step

        let items = tagAndValue.map((tv) => {
          let realTracker = this.$TrackerStore.trackers[tv.tag];
          let value = tv.value;
          if (realTracker.type == "timer") {
            value = 0;
          }
          return {
            tracker: realTracker || new Tracker({ tag: tv.tag }),
            value: value, // not being used
          };
        });

        /**
         * Promise Step
         * Loop over each of the items { tracker: [object], value: value }
         * If this is a multiple tracker request we will show each of the
         * tracker inputs one at a time using the promise step function
         */
        PromiseStep(items, (item) => {
          return new Promise((resolve, reject) => {
            // testing if going direct works
            //   $Interact.trackerInput.show = false;
            //   $Interact.trackerInput.tracker = null;
            //   $Interact.trackerInput.onInteract = null;
            // Wait for timeout
            setTimeout(() => {
              // Show Tracker Input for this given tracker
              // then return the promise and move on to the next
              Interact.trackerInput(item.tracker, { value: item.value, allowSave: true }).then(resolve).catch(reject);
            }, 12);
          });
        })
          .then(finished)
          .catch(finishedWithError);
      } else {
        // It's an input of some sort
        Interact.trackerInput(this.tracker, { allowSave: true }).then(finished).catch(finishedWithError);
      } // end if tick or others
    }); // end return promise
  }
}

import { ActiveLogStore } from "../../store/active-log";
import { LedgerStore } from "../../store/ledger";
import { Interact } from "../../store/interact";
import extractor from "../../utils/extract-trackers/extract-trackers";
import Tracker from "./tracker";

export default class TrackerInputer {
  constructor(tracker) {
    this.tracker = tracker;
    this.value = 0;
    this.listeners = {
      cancel: [],
      value: []
    };
  }

  on(type, func) {
    if (this.listeners[type].indexOf(func) == -1) {
      this.listeners[type].push(func);
    }
  }
  fire(type) {
    this.listeners[type].forEach(func => {
      func(this);
    });
  }

  async get() {
    // If it's a plain old tick tracker
    return new Promise((resolve, reject) => {
      if (this.tracker.type === "tick") {
        // Just add the tag to the note
        ActiveLogStore.addTag(this.tracker.tag);

        // If it's one_tap - then save it
        if (this.tracker.one_tap === true) {
          // Make the note
          let note = $ActiveLogStore.note + "";
        }
        resolve();
        // If it's a note (combined trackers)
      } else if (this.tracker.type === "note") {
        /**
         * Note Tracker Type
         * This is a note tracker type and will
         * ask the user to provide inputs for
         * each type of note
         **/

        // Get Trackers from the Note
        let trackerTags = extractor(this.tracker.note);

        // Add Note Tracker Tag to the note first...
        // This way we can look up some stats on it too
        ActiveLogStore.addTag(this.tracker.tag);

        // Create array of items to pass to promise step
        let items = Object.keys(trackerTags).map(tag => {
          return {
            tracker: $TrackerStore[tag] || new Tracker({ tag: tag }),
            value: trackerTags[tag].value // not being used
          };
        });

        /**
         * Promise Step
         * Loop over each of the items { tracker: [object], value: value }
         * If this is a multiple tracker request we will show each of the
         * tracker inputs one at a time using the promise step function
         */
        promiseStep(items, item => {
          return new Promise((resolve, reject) => {
            // testing if going direct works
            //   $Interact.trackerInput.show = false;
            //   $Interact.trackerInput.tracker = null;
            //   $Interact.trackerInput.onInteract = null;
            // Wait for timeout
            setTimeout(() => {
              // Show Tracker Input for this given tracker
              // then return the promise and move on to the next
              Interact.trackerInput(item.tracker, item.value)
                .then(resolve)
                .catch(reject);
            }, 12);
          });
        })
          .then(resolve)
          .catch(reject);
      } else {
        // It's an input of some sort
        Interact.trackerInput(this.tracker)
          .then(resolve)
          .catch(reject);
      } // end if tick or others
    }); // end return promise
  }
}

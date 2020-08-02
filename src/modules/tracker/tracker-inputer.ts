import { ActiveLogStore } from "../../store/active-log";
import { LedgerStore } from "../../store/ledger";
import { Interact } from "../../store/interact";
import extractor from "../../utils/extract/extract";
import Tracker from "./tracker";
import PromiseStep from "../../utils/promise-step/promise-step";
import NomieLog from "../nomie-log/nomie-log";
import { TrackerStore } from "../../store/tracker-store";
import type TrackerConfig from "./tracker";

interface ITrackerInputerGetOptions {
  value?: number;
  allowSave?: boolean;
}
interface ITrackerInputResult {
  suffix?: string;
  tracker: TrackerConfig;
  value: number;
}
/**
 * Tracker Input
 * This is a main method for collecting details on a specific tracker, or group of trackers
 */

export default class TrackerInputer {
  tracker: TrackerConfig;
  value: number;
  listeners: {
    cancel: Array<Function>;
    value: Array<Function>;
  };
  $TrackerStore: any;
  /**
   * Constructor
   * Pass in tracker and the tracker store $ object
   */
  constructor(tracker, $TrackerStore) {
    this.tracker = tracker;
    this.value = 0;
    this.listeners = {
      cancel: [],
      value: [],
    };
    this.$TrackerStore = $TrackerStore;
  }
  // Listeners
  on(type: string, func: Function): void {
    if (this.listeners[type].indexOf(func) == -1) {
      this.listeners[type].push(func);
    }
  }
  // Firing listeners
  fire(type: string): void {
    this.listeners[type].forEach((func) => {
      func(this);
    });
  }

  async getTrackerInputAsString(tracker: TrackerConfig, value?: number, allowSave: boolean = false): Promise<string> {
    const response = await Interact.trackerInput(tracker, { value, allowSave });
    if (response && response.tracker) {
      return `#${response.tracker.tag}(${response.value}) `;
    } else {
      return ``;
    }
  }

  /**
   * Note Tracker Type convert to real note
   * This takes a note value, which can be anything including @ # +
   * and extracts the trackers, people and context.
   * @param {Tracker} tracker
   */
  async getNoteTrackerInputAsString(tracker) {
    // Set up the Note
    let note = [];

    // Get Tracker tags from this trackers note
    const trackerElements = extractor.trackers(tracker.note);

    // Add this trackers tag for logging
    note.push(`#${tracker.tag}`);

    // Create array of items to pass to promise step
    let items = trackerElements.map((trackerElement) => {
      let tag = trackerElement.id;
      return {
        tracker: this.$TrackerStore.trackers[tag] || new Tracker({ tag: tag }),
        value: trackerElement.value, // not being used?
      };
    });

    /**
     * For Loop for await
     * We then loop over any trackers that and get the input
     * this will prompt the inputer to launch and collect user data
     */
    for (let i = 0; i < items.length; i++) {
      let response = await this.getTrackerInputAsString(items[i].tracker, items[i].value, i == items.length - 1);
      note.push(response);
    }
    // Merge all of the note array into a single string.
    return note.join(" ").replace(/  /g, " ");
  }

  /**
   * Get Note as String
   * Used mainly in the auto complete to select a tracker and insert it's value into a note
   */
  async getNoteString() {
    let note = [];
    // Ticks - check for default
    if (this.tracker.type === "tick") {
      let content = `#${this.tracker.tag}`;
      if (this.tracker.default) {
        content = `${content}(${this.tracker.default})`;
      }
      note.push(content);
    } else if (this.tracker.type === "note") {
      let input = await this.getNoteTrackerInputAsString(this.tracker);
      note.push(input);
    } else {
      let input = await this.getTrackerInputAsString(this.tracker);
      note.push(input);
    }
    return note.join(" ");
  }

  async getTrackerInput(tracker: TrackerConfig, options: ITrackerInputerGetOptions): Promise<ITrackerInputResult> {
    let input = await Interact.trackerInput(tracker, options);
    return input;
  }

  // async getNoteElements():any {
  //   const tempLog = new NomieLog({ note: this.tracker.note });
  //       // Extract the meta data from the note
  //       const meta = tempLog.getMeta();
  //       // Get tag, context, people
  //       let trackerElements = meta.trackers;
  //       let context = meta.context;
  //       let people = meta.people;
  //       return { people, context, trackerElements};
  // }

  async getElements(options: ITrackerInputerGetOptions): Promise<Array<string>> {
    const note = [];
    /**
     * Tick Tracker Types
     * Ticks are a simple tracker - just tapp it.
     */
    options = options || { value: null };
    let defaultValue: number = options.value || this.tracker.default;
    if (this.tracker.type == "tick") {
      // Push tag(default) or just tag if no default
      note.push(`#${this.tracker.tag}${defaultValue ? `(${defaultValue})` : ``}`);
      // Check for include
      if (this.tracker.include) {
        note.push(this.tracker.getIncluded(defaultValue || 1));
      }
      /**
       * Note Tracker Types
       * These might require multiple input popups
       * loop through the note, get tracker values, add people and context
       */
    } else if (this.tracker.type == "note") {
      // Get values as a string
      let results = await this.getNoteTrackerInputAsString(this.tracker);
      // If results - push it.
      if (results) {
        note.push(results);
      }
      // If include, push it too
      if (this.tracker.include) {
        note.push(this.tracker.getIncluded(1));
      }
    } else {
      /**
       * All Other Trackers
       * Catch all for other tracker inputs
       */
      let results: ITrackerInputResult = await this.getTrackerInput(this.tracker, { value: defaultValue, allowSave: true });
      if (results) {
        // Push results
        note.push(`#${results.tracker.tag}${results.value ? `(${results.value})` : ``}`);
        // If there's an include
        if (this.tracker.include) {
          note.push(this.tracker.getIncluded(results.value || 1));
        }
        // If there's a suffix
        if (results.suffix) {
          note.push(results.suffix);
        }
      }
    }

    return note;
  }

  /**
   * Get a tracker input
   * THIS IS A GOD DAMN MESS! This should just return an array of elements to be included
   * but not it's adding them to the log store - this is sloppy.
   * @param options
   */
  // async get(options) {
  //   options = options || {};

  //   // If it's a plain old tick tracker
  //   return new Promise((resolve, reject) => {
  //     let finished = (payload) => {
  //       if (payload) {
  //         // ActiveLogStore.addTag(this.tracker.tag);
  //         resolve(payload);
  //       }
  //     };
  //     let finishedWithError = (err) => {
  //       console.error("error", err);
  //       // This way we can look up some stats on it too
  //       ActiveLogStore.addTag(this.tracker.tag);
  //       reject(err);
  //     };
  //     if (options.replace) {
  //       setTimeout(() => {
  //         ActiveLogStore.removeStr(options.replace);
  //       }, 120);
  //     }

  //     if (this.tracker.type === "tick") {
  //       // Just add the tag to the note
  //       // ActiveLogStore.addTag(this.tracker.tag, this.tracker.default);
  //       let includeStr = this.tracker.getIncluded(1);
  //       if (includeStr || "".length) {
  //         ActiveLogStore.addElement(includeStr);
  //       }
  //       // This is getting added in the board.svelte file - refer to sloppy comment at top of function
  //       // ActiveLogStore.addElement(includeStr);
  //       // If it's one_tap - then save it
  //       finished({ tracker: this.tracker, value: null });
  //       // return {
  //       //   tracker: null,
  //       //   value: this.value,
  //       // };
  //       // If it's a note (combined trackers)
  //     } else if (this.tracker.type === "note") {
  //       /**
  //        * Note Tracker Type
  //        * This is a note tracker type and will
  //        * ask the user to provide inputs for
  //        * each type of note
  //        **/

  //       // Setup a temp log with the tracker note
  //       const tempLog = new NomieLog({ note: this.tracker.note });
  //       // Extract the meta data from the note
  //       const meta = tempLog.getMeta();
  //       // Get tag, context, people
  //       let trackerElements = meta.trackers;
  //       let contexts = meta.context;
  //       let people = meta.people;
  //       // Add the Tracker Tag
  //       ActiveLogStore.addTag(this.tracker.tag);
  //       // Loop over people add to log
  //       people.forEach((person) => {
  //         ActiveLogStore.addElement(`@${person}`);
  //       });
  //       // Loop over context add to log
  //       contexts.forEach((context) => {
  //         ActiveLogStore.addElement(`+${context}`);
  //       });
  //       // Add Note Tracker Tag to the note first...

  //       // Create array of items to pass to promise step

  //       let items = trackerElements.map((trackerElement) => {
  //         let realTracker = TrackerStore.getByTag(trackerElement.id);
  //         let value = trackerElement.value;
  //         if (realTracker.type == "timer") {
  //           value = 0;
  //         }
  //         return {
  //           tracker: realTracker || new Tracker({ tag: trackerElement.id }),
  //           value: value, // not being used ??
  //         };
  //       });

  //       /**
  //        * Promise Step
  //        * Loop over each of the items { tracker: [object], value: value }
  //        * If this is a multiple tracker request we will show each of the
  //        * tracker inputs one at a time using the promise step function
  //        *
  //        * TODO : Make this massive ass function into something more maintainable.
  //        */
  //       let itemIndex = 0;
  //       let finishedRes;

  //       const getMany = async () => {
  //         try {
  //           finishedRes = await PromiseStep(items, async (item) => {
  //             itemIndex++;
  //             const allowSave = itemIndex == items.length;
  //             return Interact.trackerInput(item.tracker, { value: item.value, allowSave });
  //           });
  //           finished(finishedRes);
  //         } catch (e) {
  //           console.log("Error Caught Error", e);
  //           finishedWithError(e);
  //         }
  //       };
  //       getMany();
  //     } else {
  //       // It's an input of some sort
  //       Interact.trackerInput(this.tracker, { allowSave: true }).then(finished).catch(finishedWithError);
  //     } // end if tick or others
  //   }); // end return promise
  // }
}

import { ActiveLogStore } from "../../store/active-log";
import { LedgerStore } from "../../store/ledger";
import { Interact } from "../../store/interact";
import extractor from "../../utils/extract/extract";
import Tracker from "./tracker";
import PromiseStep from "../../utils/promise-step/promise-step";
import NomieLog from "../nomie-log/nomie-log";
import { TrackerStore } from "../../store/tracker-store";
import type TrackerConfig from "./tracker";
import { ITrackers } from "../import/import";

export interface ITrackerInputerGetOptions {
  value?: number;
  allowSave?: boolean;
}
export interface ITrackerInputResult {
  suffix?: string;
  tracker: TrackerConfig;
  value: number;
  action?: string;
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
  lastAction: string;
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
    const response: any = await Interact.trackerInput(tracker, { value, allowSave });
    console.log({ response });
    if (response && response.tracker) {
      return `#${response.tracker.tag}(${response.value}) ${response.suffix || ""}`;
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
    let input: ITrackerInputResult = await Interact.trackerInput(tracker, options);
    if (input.action) {
      this.lastAction = input.action;
    }
    console.log("getTrackerInput", { input });
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
    let defaultValue: number = options.value !== undefined ? options.value : this.tracker.default;
    if (this.tracker.type == "tick") {
      // Push tag(default) or just tag if no default
      note.push(`#${this.tracker.tag}${defaultValue ? `(${defaultValue})` : ``}`);
      // Check for include
      if (this.tracker.include) {
        note.push(this.tracker.getIncluded(defaultValue));
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
      console.log("getElements", { results });
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
    console.log("tracker-inputer - Returning note", note);
    return note;
  }
}

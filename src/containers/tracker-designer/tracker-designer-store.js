import { writable } from "svelte/store";
import TrackerConfig from "../../modules/tracker/tracker";

class TrackerStore {
  constructor() {
    const state = {
      tracker: new TrackerConfig({})
    };
    const { update, subscribe, set } = writable(state);
    this.update = update;
    this.subscribe = subscribe;
    this.set = set;
  }
}

export const TrackerDesignerStore = new TrackerStore();

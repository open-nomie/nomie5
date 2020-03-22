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
  clear() {
    this.update(state => {
      state.tracker = new TrackerConfig({});
      return state;
    });
  }
}

export const TrackerDesignerStore = new TrackerStore();

// import nanoid from "nanoid";
import Tracker from "../tracker/tracker";

export default class Board {
  constructor(starter) {
    starter = starter || {};
    this.label = starter.label || "Unknown";
    this.id = starter.id || nanoid();
    this.trackers = (starter.trackers || []).map(tracker => {
      return new Tracker(tracker);
    });
  }
}

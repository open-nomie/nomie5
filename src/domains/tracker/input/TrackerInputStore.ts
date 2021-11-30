import type TrackerConfig from "../../../modules/tracker/tracker"
import { writable } from "svelte/store"
import type { Writable } from "svelte/store"
import type { ITrackerInputResult } from "modules/tracker/tracker-inputer"

// s.trackerInput.show = true;
// s.trackerInput.tracker = tracker;
// s.trackerInput.allowSave = allowSave;
// s.trackerInput.value = value;
// s.trackerInput.onInteract = (payload, action: string = "unknown") => {
//   if (action !== "cancelled") {
//     payload.action = action;
//     resolve(payload);
//   }
// };

type TrackerEditorType = {
  tracker?: TrackerConfig
  onComplete?: Function
  showModal?: boolean
  allowSave?: boolean;
  value?: any;
}

export const TrackerInputStore: Writable<TrackerEditorType> = writable({
  tracker: undefined
})

export const getTrackerInputAsString = async (tracker: TrackerConfig, value?: number, allowSave: boolean = false): Promise<ITrackerInputResult> {

  return {
    // raw: `#${response.tracker.tag}(${response.value}) ${response.suffix || ""}`,
    // action: response.action,
    // tracker: response.tracker,
    // value: response.value,
  };
}

export const closeTrackerInput = () => {
  TrackerInputStore.update(s => {
    s.showModal = false;
    s.tracker = undefined;
    s.onComplete = undefined;
    return s;
  })
}




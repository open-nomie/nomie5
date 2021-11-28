import { Lang } from "../../store/lang";
import type { ITrackerType } from "../tracker/tracker";

export type TrackerTypeConfig = {
  emoji: string;
  label: string;
  description: string;
  id?: ITrackerType;
}

export type TrackerTypesConfig = {
  [type: string]: TrackerTypeConfig;
}

const types: TrackerTypesConfig = {
  tick: {
    emoji: "☝️",
    label: Lang.t("tracker.type.simple", "Tally Tracker"),
    description: Lang.t(
      "tracker.type.simple_description",
      "Keep a tally of each time the tracker is used. E.g. Pooped, gluten, left, entered."
    ),
  },
  value: {
    emoji: "🔢",
    label: Lang.t("tracker.type.value", "Number Input"),
    description: Lang.t("tracker.type.value_description", "Good for tracking fluids, medicines, distance"),
  },
  range: {
    emoji: "🎚",
    label: Lang.t("tracker.type.range", "Range"),
    description: Lang.t("tracker.type.range_description", "Select from a range like 1-10. Good for Mood, Anxiety, Stress"),
  },
  picker: {
    emoji: "✅",
    label: Lang.t("tracker.type.picker", "Pick from a List"),
    description: Lang.t("tracker.type.picker_description", "Create a pick list of anything. Including #trackers, @people and +context"),
  },
  timer: {
    emoji: "⏲",
    label: Lang.t("tracker.type.timer", "Timer"),
    description: Lang.t("tracker.type.timer_description", "Track how long things take."),
  },
  note: {
    emoji: "🎳",
    label: Lang.t("tracker.type.note", "Combine Trackers"),
    description: Lang.t("tracker.type.note_description", "Track multiple trackers in a series"),
  },
};

export function getTypeDetails(type: string): TrackerTypeConfig | undefined {
  if (types[type]) {
    return types[type];
  } else {
    return undefined;
  }
}

export default types;

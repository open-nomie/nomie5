import { Lang } from "../../store/lang";

export default {
  tick: {
    label: Lang.t("tracker.type.simple", "Simple Tracker"),
    description: Lang.t("tracker.type.simple_description", "Good for tracking pooping, gluten, and other one off trackers."),
  },
  value: {
    label: Lang.t("tracker.type.value", "Numeric Input"),
    description: Lang.t("tracker.type.value_description", "Enter a number value. Great for tracking fluids, medicines, distance"),
  },
  range: {
    label: Lang.t("tracker.type.range", "Range"),
    description: Lang.t("tracker.type.range_description", "Select from a range like 1-10. Good for Mood, Anxiety, Stress"),
  },
  picker: {
    label: Lang.t("tracker.type.picker", "Pick from a List"),
    description: Lang.t("tracker.type.picker_description", "Create a list to select from. Can include trackers, people, or any content"),
  },
  timer: {
    label: Lang.t("tracker.type.timer", "Timer"),
    description: Lang.t("tracker.type.timer_description", "Tap to start, tap to stop. The timer is great for tracking durations."),
  },
  note: {
    label: Lang.t("tracker.type.note", "Combine Trackers"),
    description: Lang.t("tracker.type.note_description", "Track multiple trackers in a series"),
  },
};

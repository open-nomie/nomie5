import extractor from "../extract/extract";
import calcTrackerScore from "../../modules/calculate-tracker-score/calculate-tracker-score";
import math from "../math/math";
// Simple isTrue comparison function
const isTrue = (condition, baseValue) => {
  let response = false;
  let value = parseFloat(condition.v);
  if (condition.is == "gt") {
    response = baseValue > value;
  } else if (condition.is == "lt") {
    response = baseValue < value;
  } else if (condition.is == "lte") {
    response = baseValue <= value;
  } else if (condition.is == "gte") {
    response = baseValue >= value;
  } else if (condition.is == "eq") {
    response = baseValue == value;
  }
  return response;
};

export default (note, endTime) => {
  endTime = endTime || new Date().getTime();
  let trackers = (window.$TrackerStore || {}).trackers || {}; // hack - fucking hell
  // Extract Trackers
  let trackerElements = extractor.trackers(note || "");
  // Extract Scores to total for this note
  let scores = trackerElements.map((tElement) => {
    if (trackers[tElement.id]) {
      return calcTrackerScore(tElement.value, trackers[tElement.id], endTime);
    } else {
      return 0;
    }
  });

  return math.sum(scores);
};

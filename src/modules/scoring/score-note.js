import extractor from "../../utils/extract/extract";
import ScoreTracker from "./score-tracker";
import math from "../../utils/math/math";

export default (note, endTime) => {
  endTime = endTime || new Date().getTime();
  let trackers = (window.$TrackerStore || {}).trackers || {}; // hack - fucking hell
  // Extract Trackers
  let trackerElements = extractor.trackers(note || "");
  // Extract Scores to total for this note
  let scores = trackerElements.map((tElement) => {
    if (trackers[tElement.id]) {
      return ScoreTracker(tElement.value, trackers[tElement.id], endTime);
    } else {
      return 0;
    }
  });

  return math.sum(scores);
};

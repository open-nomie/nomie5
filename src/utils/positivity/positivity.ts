import ScoreNote from "../../modules/scoring/score-note";
import type Record from "../../modules/nomie-log/nomie-log";
import TrackableElement from "../../modules/trackable-element/trackable-element";

export interface IPositivityResults {
  positive: number;
  negative: number;
  neutral: number;
}

export function positivityFromLogs(logs: Array<any>, target?: TrackableElement): IPositivityResults {
  let positive = 0;
  let negative = 0;
  let neutral = 0;
  logs.forEach((row: Record) => {
    // TODO make this work with just a tracker target
    let score = 0;
    if (target && target.type == "tracker") {
    } else {
      score = ScoreNote(row.note, row.end);
    }

    if (score == 0) {
      neutral++;
    } else if (score > 0) {
      positive++;
    } else {
      negative++;
    }
  });
  return { positive, negative, neutral };
}

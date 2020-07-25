import ScoreNote from "../../modules/scoring/score-note";
import type Record from "../../modules/nomie-log/nomie-log";

export interface IPositivityResults {
  positive: number;
  negative: number;
  neutral: number;
}

export function positivityFromLogs(logs: Array<any>, target: any): IPositivityResults {
  let positive = 0;
  let negative = 0;
  let neutral = 0;
  logs.forEach((row: Record) => {
    let score = ScoreNote(row.note, row.end);
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

import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import type NLog from "../../modules/nomie-log/nomie-log";
import type TrackableElement from "../../modules/trackable-element/trackable-element";
import type TrackerConfig from "../../modules/tracker/tracker";
import { LedgerStore } from "../ledger/LedgerStore";
import extract from "../../utils/extract/extract";
import NDate from "../../utils/ndate/ndate";

export interface CalendarLog {
  start: Date;
  end: Date;
  repeat: boolean;
}

export type StreakViewTypes = "day" | "week" | "month" | "quarter" | "year";

export interface StreakDateRange {
  start: Dayjs;
  end: Dayjs;
}

function getDateRange(date: Dayjs, view: StreakViewTypes, weekStartsOn: "1" | "2"): StreakDateRange {
  let payload: { start: Dayjs; end: Dayjs };
  if (view === "month") {
    payload = {
      start: date.startOf("month"),
      end: date.endOf("month"),
    };
  } else if (view === "quarter") {
    payload = {
      start: date.subtract(3, "month").startOf("month"),
      end: date.endOf("month"),
    };
  } else if (view === "year") {
    payload = {
      start: date.subtract(1, "year").startOf("month"),
      end: date.endOf("month"),
    };
  } else if (view === "week") {
    payload = {
      start: date.subtract(7, "day"),
      end: date,
    };
  }
  return payload;
}

function getPercentage(rows: Array<NLog>, month: Dayjs) {
  let start = month.startOf("month");
  let end = month.endOf("month");
  // if (state.thisMonth) {
  //   end = dayjs().endOf("day");
  // }
  let diff = end.diff(start, "day") + 1;
  let final = [];
  for (var i = 0; i < diff; i++) {
    let date = dayjs(start).add(i, "day");
    let hasEvent = rows.find((row) => new Date(row.end).toDateString() === date.toDate().toDateString());
    final.push(hasEvent);
  }
  let found: number = final.filter((r) => r).length;
  let total: number = final.length;
  return {
    daysTotal: total,
    daysHit: found,
    percentage: found / total,
  };
}

const logsToCalendar = (logs: Array<NLog>): Array<CalendarLog> => {
  // TODO this is a nasty pattern
  return logs.map((log: any) => {
    log.start = new Date(log.start);
    log.end = new Date(log.end);
    log.repeat = false;
    return log;
  });
};

const getLogs = async (
  element: TrackableElement,
  date: Dayjs,
  view: StreakViewTypes = "month",
  weekStartsOn: "1" | "2" = "1"
): Promise<Array<NLog>> => {
  let payload = getDateRange(date, view, weekStartsOn);

  return await LedgerStore.query({
    search: element.toSearchTerm(),
    start: payload.start,
    end: payload.end,
  });
};

const getStreak = async (element: TrackableElement, date: Dayjs, logs: Array<NLog>) => {
  return {
    logs: logs,
    results: getPercentage(logs, date),
  };
};

export default {
  logsToCalendar,
  getPercentage,
  getStreak,
  getLogs,
};

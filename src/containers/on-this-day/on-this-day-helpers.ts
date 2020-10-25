import type NLog from "../../modules/nomie-log/nomie-log";
import type Person from "../../modules/person/person";
import type TrackableElement from "../../modules/trackable-element/trackable-element";
import TrackerConfig from "../../modules/tracker/tracker";
import { Lang } from "../../store/lang";
import extractor from "../../utils/extract/extract";
import math from "../../utils/math/math";

export type OTDViewOption = "all" | "notes" | "trackers" | "people" | "locations" | "context";

export interface OTDView {
  view: OTDViewOption;
  icon: string;
  label: string;
}

export let OTDViews: Array<OTDView> = [
  { view: "all", icon: "book", label: `${Lang.t("general.all", "All")}` },
  { view: "notes", icon: "annotation", label: `${Lang.t("general.notes", "Notes")}` },
  { view: "trackers", icon: "tracker", label: `${Lang.t("general.trackers", "Trackers")}` },
  { view: "locations", icon: "map", label: `${Lang.t("general.locations", "Locations")}` },
  { view: "people", icon: "people", label: `${Lang.t("general.people", "People")}` },
  { view: "context", icon: "bulb", label: `${Lang.t("general.context", "Context")}` },
];

export function hasNote(str): Boolean {
  let parsed = extractor.parse(str, { includeGeneric: true });
  let generic = parsed.filter((tElement) => {
    return tElement.type == "generic";
  });
  return math.percentage(parsed.length, generic.length) > 70;
}

export function getNotes(day): Array<NLog> {
  let notes = day
    .filter((record) => {
      return hasNote(record.note);
    })
    .sort((a: NLog, b: NLog) => {
      return a.end < b.end ? 1 : -1;
    });
  return notes;
}

export function getContext(day): Array<string> {
  let contexts = [];
  day.forEach((log: NLog) => {
    log.context.forEach((element: TrackableElement) => {
      const context = element.id;
      if (context) {
        if (contexts.indexOf(context) === -1) {
          contexts.push(context);
        }
      }
    });
  });
  return contexts;
}

export function getPeople(day, peopleStorePeople: any = {}): Array<Person> {
  let people = [];
  day.forEach((log: NLog) => {
    log.people.forEach((element: TrackableElement) => {
      let person = peopleStorePeople[element.id];
      if (person) {
        if (people.indexOf(person) === -1) {
          people.push(person);
        }
      }
    });
  });
  return people;
}

export interface TrackerProcessedConfig {
  tag: string;
  tracker: TrackerConfig;
  values: Array<number>;
  count: number;
  value: number;
}

export function processTrackers(trackersUsed, allTrackers = {}): Array<TrackerProcessedConfig> {
  console.log("Process Trackers", trackersUsed, allTrackers);
  let trackers: Array<TrackerProcessedConfig> = Object.keys(trackersUsed)
    .map((tag) => {
      let base = trackersUsed[tag];
      let tracker = allTrackers && allTrackers[tag] ? new TrackerConfig(allTrackers[tag]) : new TrackerConfig({ tag });
      let value = tracker.math == "sum" ? math.sum(base.values) : math.average(base.values);
      return {
        tag,
        tracker,
        values: base.values,
        count: base.values.length,
        value: tracker.displayValue(value),
      };
    })
    .sort((a, b) => {
      return a.tracker.label < b.tracker.label ? 1 : -1;
    });

  return trackers;
}

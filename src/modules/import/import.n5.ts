import type { INormalizedImport, ITrackers, IPeople } from "./import";
import TrackerConfig from "../tracker/tracker";
import Board from "../board/board";
import type { IBoard } from "../board/board";
import NLog from "../nomie-log/nomie-log";

import { Dashboard } from "../dashboard/dashboard";
import Person from "../person/person";
import Location from "../locate/Location";

function getTrackers(fileData: any): ITrackers {
  let trackers: ITrackers = {};
  Object.keys(fileData.trackers).forEach((trackerTag) => {
    trackers[trackerTag] = new TrackerConfig(fileData.trackers[trackerTag]);
  });
  return trackers;
}

function getPeople(fileData: any): IPeople {
  let people: IPeople = {};
  Object.keys(fileData.people || {}).forEach((personId) => {
    people[personId] = new Person(fileData.people[personId]);
  });
  return people;
}

function getBoards(fileData: any): Array<IBoard> {
  return (fileData.boards || []).map((board) => {
    return new Board(board);
  });
}

function getDashboards(fileData: any): Array<Dashboard> {
  let dashboards = [];
  if (fileData.dashboards && fileData.dashboards.dashboards) {
    dashboards = fileData.dashboards.dashboards;
  } else if (fileData.dashboards) {
    dashboards = fileData.dashboards;
  }
  dashboards = dashboards.map((dash) => {
    return new Dashboard(dash);
  });
  return dashboards;
}

function getLogs(fileData: any): Array<NLog> {
  return (fileData.events || []).map((evt) => {
    return new NLog(evt);
  });
}

export function N5ImportNormalizer(importer: any): INormalizedImport {
  console.log("N5 Importer", importer);
  let final: INormalizedImport = {
    trackers: getTrackers(importer),
    boards: getBoards(importer),
    logs: getLogs(importer),
    people: getPeople(importer),
    context: importer.context || [],
    locations: (importer.locations || []).map((loc) => {
      return new Location(loc);
    }),
    dashboards: getDashboards(importer),
  };

  return final;
}

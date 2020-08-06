import { INormalizedImport, dashCase, ITrackers, IPeople } from "./import";
import TrackerConfig, { ITracker } from "../tracker/tracker";
import Board, { IBoard } from "../board/board";
import NLog from "../nomie-log/nomie-log";
import nid from "../nid/nid";
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

function getBoards(fileData: any): Array<IBoard> {
  return (fileData.boards || []).map((board) => {
    return new Board(board);
  });
}

function getLogs(fileData: any): Array<NLog> {
  return (fileData.events || []).map((evt) => {
    evt.note = evt.notes;
    return new NLog(evt);
  });
}

export function N3ImportNormalizer(importer: any): INormalizedImport {
  console.log("N3 Importer", importer);
  let final: INormalizedImport = {
    trackers: getTrackers(importer),
    boards: getBoards(importer),
    logs: getLogs(importer),
    people: {},
    context: [],
    locations: [],
    dashboards: [],
  };

  return final;
}

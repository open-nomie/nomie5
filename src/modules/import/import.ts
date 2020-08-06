import NLog from "../nomie-log/nomie-log";
import { Dashboard } from "../dashboard/dashboard";
import TrackerConfig, { ITracker } from "../tracker/tracker";
import { N1ImportNormalizer } from "./import.n1";
import { N2ImportNormalizer } from "./import.n2";
import { N3ImportNormalizer } from "./import.n3";
import { N5ImportNormalizer } from "./import.n5";
import { IPerson } from "../person/person";
import { ILocation } from "../locate/Location";

export interface ITrackers {
  [key: string]: ITracker;
}

export interface IPeople {
  [key: string]: IPerson;
}

export interface INormalizedImport {
  trackers: ITrackers;
  boards: Array<any>;
  context: Array<string>;
  people: IPeople;
  locations: Array<ILocation>;
  dashboards: Array<Dashboard>;
  logs: Array<NLog>;
}

export function dashCase(str: string): string {
  return (
    str &&
    str
      .match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
      .map((x) => x.toLowerCase())
      .join("_")
  );
}

export default class Importer {
  original: any;
  version: number;
  normalized: INormalizedImport;
  constructor(importPayload: any) {
    this.original = importPayload;
    this.version = parseInt(importPayload?.nomie?.number?.split(".")[0]);
    if (!this.version) {
      throw new Error("Invalid Nomie Backup file");
    } else if (this.version == 2) {
      this.normalized = N2ImportNormalizer(importPayload);
    } else if (this.version >= 4) {
      this.normalized = N5ImportNormalizer(importPayload);
      console.log("This is nomie 4 and above");
    } else if (this.version == 3) {
      console.log("This is nomie 3");
      this.normalized = N3ImportNormalizer(importPayload);
    } else if (this.version == 1) {
      console.log("This is nomie 1");
      this.normalized = N1ImportNormalizer(importPayload);
    }
    console.log("Normalized", this.normalized);
  }
}

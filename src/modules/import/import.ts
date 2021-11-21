import type NLog from "../nomie-log/nomie-log";
import type { Dashboard } from "../dashboard/dashboard";
import type TrackerConfig from "../tracker/tracker";
import { N1ImportNormalizer } from "./import.n1";
import { N2ImportNormalizer } from "./import.n2";
import { N3ImportNormalizer } from "./import.n3";
import { N5ImportNormalizer } from "./import.n5";
import type { IPerson } from "../person/person";
// import type { ILocation } from "../locate/Location";

export type ITrackers = {
  [key: string]: TrackerConfig;
}

export type IPeople = {
  [key: string]: IPerson;
}

export type INormalizedImport = {
  trackers?: ITrackers;
  boards?: Array<any>;
  context?: Array<string>;
  people?: IPeople;
  locations?: Array<Location>;
  dashboards?: Array<Dashboard>;
  logs?: Array<NLog>;
}

// TODO: replace this with the util version
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
    console.log("THE ORIGINAL", this.version);
    if (!this.version) {
      throw new Error("Invalid Nomie Backup file");
    } else if (this.version >= 4) {
      this.normalized = N5ImportNormalizer(importPayload);
    } else if (this.version == 3) {
      this.normalized = N3ImportNormalizer(importPayload);
    } else if (this.version == 2) {
      this.normalized = N2ImportNormalizer(importPayload);
    } else if (this.version == 1) {
      this.normalized = N1ImportNormalizer(importPayload);
    }
  }
}

import Importer from "./import";
import type { IBackupItems } from "../export/export";

import { ContextStore } from "../../store/context-store";
import { PeopleStore } from "../../store/people-store";
import { LedgerStore } from "../../store/ledger";
import { TrackerStore } from "../../store/tracker-store";
import { BoardStore } from "../../store/boards";

import { Locations } from "../../store/locations";

import { DashboardStore } from "../../store/dashboard-store";
import math from "../../utils/math/math";
import type { INormalizedImport } from "./import";

import type NLog from "../nomie-log/nomie-log";

type IImportTypes = "dashboards" | "locations" | "people" | "trackers" | "logs" | "context";
export interface IImportStatus {
  importing: IImportTypes;
  progress?: number;
}

export default class ImportLoader {
  normalized: INormalizedImport;
  raw: any;
  changeListeners: Array<Function>;
  importing: any = {};
  importer: Importer;

  constructor() {
    this.importing = {};
  }

  public onChange(func: Function): void {
    if (this.changeListeners.indexOf(func) == -1) {
      this.changeListeners.push(func);
    }
  }

  public logs(logs: Array<NLog>) {
    this.normalized = {
      logs,
    };
    return this;
  }

  public async openPayload(payload: IBackupItems) {
    this.raw = payload;
    this.importer = new Importer(payload);
    this.normalized = this.importer.normalized;
  }

  public async importAll(func?: Function) {
    func = func || function (status: IImportStatus) {};
    try {
      func({ importing: "boards" });
      await this.importBoards();
      func({ importing: "trackers" });
      await this.importTrackers();
      func({ importing: "dashboards" });
      await this.importDashboards();
      func({ importing: "people" });
      await this.importPeople();
      func({ importing: "context" });
      await this.importContext();
      func({ importing: "locations" });
      await this.importLocations();
      func({ importing: "logs" });
      await this.importLogs(func);
      return true;
    } catch (e) {
      console.error(e);
      throw new Error(e.message);
    }
  }

  public async importTrackers(): Promise<any> {
    await TrackerStore.save({ ...this.normalized.trackers, ...TrackerStore.data() });
    return this;
  }

  public async importDashboards() {
    let existing = await DashboardStore.get();
    DashboardStore.update((state) => {
      this.normalized.dashboards = (this.normalized.dashboards || []).filter((dashboard) => {
        return (existing || []).map((d) => d.id).indexOf(dashboard.id) == -1;
      });
      state.dashboards = [...this.normalized.dashboards, ...existing];
      return state;
    });
    await DashboardStore.save();
    return this;
  }

  public async importBoards() {
    let existingBoards = BoardStore.data().boards || [];
    await BoardStore.save([...this.normalized.boards, ...existingBoards]);
    return this;
  }

  public async importLogs(onProgress?: Function) {
    await LedgerStore.import(this.normalized.logs, (status) => {
      if (status.step) {
        let progress;
        if (status.step < status.total) {
          progress = math.round(100 - ((status.total - status.step) / status.total) * 100);
        } else if (status.step == status.total) {
          progress = 100;
        } else {
          progress = 0;
        }
        if (onProgress) {
          onProgress({ message: `Step ${status.step} of ${status.total}`, progress, step: status.step, total: status.total });
        }
      }
    });
    await LedgerStore.getFirstDate(true);
    return this;
  }

  public async importPeople() {
    let people = await PeopleStore.getPeople();
    people = people || {};
    await PeopleStore.write({
      ...(this.normalized || { people: {} }).people,
      ...people,
    });
    return people;
  }

  public async importContext() {
    let contexts: Array<string> = await ContextStore.get();
    contexts = contexts || [];
    this.normalized.context = this.normalized.context || [];
    this.normalized.context.forEach((context) => {
      if (contexts.indexOf(context) == -1) {
        contexts.push(context);
      }
    });
    await ContextStore.write(contexts);
    return this;
  }

  public async importLocations() {
    let currentLocations = Locations.getAll();
    this.normalized.locations = this.normalized.locations || [];
    this.normalized.locations.forEach((loc: any) => {
      if (!currentLocations.find((l) => l.id == loc.id)) {
        currentLocations.push(loc);
      }
    });
    await Locations.write(currentLocations);
    return this;
  }

  private fireChange(status) {
    this.changeListeners.forEach((func) => {
      func(status);
    });
  }
}

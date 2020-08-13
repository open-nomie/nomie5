import { writable } from "svelte/store";
import config from "../../config/global";
// utils
import NStorage from "../modules/storage/storage";
import type NLog from "../modules/nomie-log/nomie-log";

import dayjs from "dayjs";

import { LedgerStore } from "./ledger";
import { Interact } from "./interact";

/**
 * Last Used Store
 * Used for reading and writing the last time a tracker was used
 * this way we don't have to go through all of the books
 * to find the last instance
 */

type IOfflineSyncStatus = "idle" | "active";

export interface IOfflineQueueState {
  logs: Array<NLog>;
  lastSync?: Date;
  status: IOfflineSyncStatus;
}

const InitOfflineQueueStore = () => {
  const state: IOfflineQueueState = {
    logs: [],
    lastSync: undefined,
    status: "idle",
  };
  const { update, subscribe, set } = writable(state);

  const methods = {
    async init() {
      let fromStore = (await NStorage.engines.local.get(`${config.data_root}/offline-queue`)) || { logs: [], lastSync: undefined };
      update((d) => {
        d = fromStore;
        d.logs = d.logs || [];
        return d;
      });
    },

    sync(): Promise<void> {
      // Promise to handle the callback
      return new Promise(async (resolve, reject) => {
        let state = methods.state({ status: "active" });
        let finished: any = await LedgerStore.import(state.logs, (details) => {
          console.log("sync details", details);
        });
        if (finished) {
          Interact.toast(`${finished.length} log(s) saved`);
          saveState({ status: "idle", logs: [] });
          resolve(this);
        }
      });
    },

    state(fill: any = {}): IOfflineQueueState {
      let state;
      update((s) => {
        state = { ...s, ...fill };
        return state;
      });
      return state;
    },
    /**
     * Save the Last Updated on array of trackers
     * LastUsed.record(['tag1','tag2','tag4']);
     */
    async record(log: NLog): Promise<boolean> {
      let s: IOfflineQueueState;
      update((state: IOfflineQueueState) => {
        state.logs.push(log);
        s = state;
        return state;
      });
      console.log("Offline Log Saved", log, state);
      // Write to storage
      saveState(s);
      return true;
    },
  };

  function saveState(state: IOfflineQueueState) {
    update((s: IOfflineQueueState) => {
      s = { ...s, ...state };
      NStorage.engines.local.put(`${config.data_root}/offline-queue`, s);
      return s;
    });
  }

  return {
    update,
    subscribe,
    set,
    ...methods,
  };
};

export const OfflineQueue = InitOfflineQueueStore();
declare let window: any;
window.OQ = OfflineQueue;

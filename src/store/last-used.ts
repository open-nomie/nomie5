import { writable } from "svelte/store";
import config from "../config/appConfig";
// utils
import NStorage from "../modules/storage/storage";
import type NLog from "../modules/nomie-log/nomie-log";

import dayjs from "dayjs";
const lastUsedKey = "last-usage";

import { LedgerStore } from "./ledger";
import type { ITrackableElement } from "../modules/trackable-element/trackable-element";

/**
 * Last Used Store
 * Used for reading and writing the last time a tracker was used
 * this way we don't have to go through all of the books
 * to find the last instance
 */
const LastUsedStore = () => {
  const { update, subscribe, set } = writable({});

  const methods = {
    async init() {
      let fromStore = (await NStorage.get(`${config.data_root}/${lastUsedKey}`)) || {};
      update((d) => {
        d = fromStore;
        return d;
      });
    },
    async get(tag: string, type?: ITrackableElement) {
      let found;
      // Find if it exists in the last used
      update((state) => {
        if (state.hasOwnProperty(tag)) {
          found = state[tag];
        }
        return state;
      });
      // If found - return the date
      if (found) {
        return new Date(found.date);
      } else {
        // Not found? Lets query the ledger for the last 6 months
        let logs = await LedgerStore.queryTag(tag, dayjs().subtract(6, "month").toDate(), new Date());
        if (logs) {
          await methods.record(logs[0]);
          return new Date(logs[0].end);
        }
        return null;
      }
    },
    data() {
      let data;
      update((d) => {
        data = d;
        return d;
      });
      return data;
    },
    /**
     * Save the Last Updated on array of trackers
     * LastUsed.record(['tag1','tag2','tag4']);
     */
    async record(log: NLog) {
      // Get tracker tags as array
      let trackers = log.getMeta().trackers.map((trackableElement) => trackableElement.id);

      let data;
      let logDate = new Date(log.end);
      // Get from the store
      update((state) => {
        // Loop over tracekrs
        trackers.forEach((tag) => {
          // Push updated info to object
          state[tag] = state[tag] || {};
          let lastDate = state[tag].date ? new Date(state[tag].date) : null;
          if (logDate > lastDate) {
            state[tag] = {
              log: log._id,
              book: dayjs(logDate).format("YYYY-MM"),
              date: logDate,
            };
          }
        });
        data = state;
        return state;
      });
      // Write to storage
      return await NStorage.put(`${config.data_root}/${lastUsedKey}`, data);
    },
  };

  return {
    update,
    subscribe,
    set,
    ...methods,
  };
};

export const LastUsed = LastUsedStore();

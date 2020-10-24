import { writable } from "svelte/store";
import config from "../config/appConfig";
// utils
import NStorage from "../modules/storage/storage";
import type NLog from "../modules/nomie-log/nomie-log";

import dayjs from "dayjs";
const lastUsedKey = "last-usage";

import { LedgerStore } from "./ledger";
import type { ITrackableElement } from "../modules/trackable-element/trackable-element";
import { TrackerStore } from "./tracker-store";
import { Interact } from "./interact";
import { Lang } from "./lang";
import appConfig from "../config/appConfig";

export interface LastUsedItem {
  book?: string;
  date?: Date;
  log?: string;
}

export interface LastUsedItems {
  [key: string]: LastUsedItem;
}

/**
 * Last Used Store
 * Used for reading and writing the last time a tracker was used
 * this way we don't have to go through all of the books
 * to find the last instance
 */
const LastUsedStore = () => {
  const state: LastUsedItems = {};
  const { update, subscribe, set } = writable(state);

  const methods = {
    /**
     * Init the Last Use Store
     */
    async init() {
      // Get from storage
      let fromStore = (await NStorage.get(`${config.data_root}/${lastUsedKey}`)) || {};
      // Update state
      update((state: LastUsedItems) => {
        state = fromStore;
        return state;
      });
    },
    /**
     * Get Last Used for a specific item
     * @param tag Tracker Tag
     * @param type
     */
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
    /**
     * Force Update All Last Used
     * this will look for the last 6 months
     * and then put the most recent items as the last
     * used date
     */
    async updateAll(): Promise<any> {
      // Ate you sure?
      const confirmed = await Interact.confirm(
        `${Lang.t("tracker.update-all-tracker-last-used", "Update last used dates on all trackers?")}`
      );
      if (confirmed) {
        // Block user
        Interact.blocker(`${Lang.t("general.loading", "Loading...")}`);
        // Get all trackers
        const trackers = await TrackerStore.getAll();
        // Get logs for last 1 year
        let logs = await LedgerStore.query({ start: dayjs().subtract(1, "year") });
        // Loop over logs expand and filter
        logs = (logs || [])
          .map((log) => {
            log.expand();
            return log;
          })
          .sort((l1, l2) => {
            // Sort by newest first
            return l2.end > l1.end ? 1 : -1;
          });

        // init final holder
        let final = {};

        // Loop over trackers
        Object.keys(trackers).forEach((tag) => {
          // Find a log that has this tracker
          let log = logs.find((nlog) => {
            return nlog.hasTracker(tag);
          });
          // Found one!
          if (log) {
            // Pass it up to final
            final[tag] = {
              date: new Date(log.end),
              book: dayjs(log.end).format(appConfig.book_time_format),
              log: log._id,
            };
          }
        });

        // Save to storage
        await NStorage.put(`${config.data_root}/${lastUsedKey}`, final);

        // Update Store
        update((state) => {
          state = final;
          return state;
        });

        // Interact with User
        Interact.stopBlocker();
        Interact.toast(`${Lang.t("general.update-complete", "Update complete")}`);
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
      // Load up the Last Records to keep everything up-to-date.
      let fromStore = (await NStorage.get(`${config.data_root}/${lastUsedKey}`)) || {};

      let data;
      let logDate = new Date(log.end);
      // Get from the store
      update((state) => {
        // Merge state with results from the Store
        state = { ...state, ...fromStore };
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

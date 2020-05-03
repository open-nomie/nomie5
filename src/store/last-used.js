import { writable } from "svelte/store";
import config from "../../config/global";
// utils
import Logger from "../utils/log/log";

import NStorage from "../modules/storage/storage";

import dayjs from "dayjs";

const console = new Logger("♹ store/${lastUsedKey}.js");
const lastUsedKey = "last-usage";

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
    async record(log) {
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

  setTimeout(() => {
    methods.init();
  }, 120);

  return {
    update,
    subscribe,
    set,
    ...methods,
  };
};

export const LastUsed = LastUsedStore();

/**
 * Commander
 * Partial port + cleanup from Nomie 2 - currently only supports Notes.  Nomie 2 supported all sorts of wacky shit
 */

// Svelte
import { writable } from "svelte/store";

// utils
import Logger from "../utils/log/log";

// Vendors
import Storage from "../modules/storage/storage";

import config from "../../config/global";
import Location from "../modules/locate/Location";

// Stores

const console = new Logger("🗺 $Locations");

// Nomie API Store

const LocationsInit = () => {
  const { update, subscribe, set } = writable([]);

  const methods = {
    /**
     * Save a single location
     * it will update or insert if ifs new
     * @param {Location} location
     */
    save(location) {
      return new Promise((resolve, reject) => {
        location = new Location(location);
        update((d) => {
          let found = d.find((d) => d.id == location.id);
          if (!found) {
            d.push(location);
          } else {
            d = d.map((row) => {
              return row.id == location.id ? location : row;
            });
          }
          this.write(d)
            .then(() => {
              resolve(location);
            })
            .catch(reject);
          return d;
        });
      });
    },
    getAll() {
      let all = [];
      update((state) => {
        all = state;
        return state;
      });
      return all;
    },
    async write(payload) {
      return Storage.put(`${config.data_root}/locations.json`, payload);
    },
    async loadLocations() {
      let locations = await Storage.get(`${config.data_root}/locations.json`);
      locations = (locations || []).map((loc) => {
        return new Location(loc);
      });
      update((state) => {
        state = locations;
        return state;
      });
      return locations;
    },
    deleteByID(id) {
      update((d) => {
        let data = d.filter((row) => row.id !== id);
        this.write(data);
        return data;
      });
    },
  };

  // Get storage
  Storage.onReady(() => {
    methods.loadLocations();
  });

  return {
    update,
    subscribe,
    set,
    ...methods,
  };
};

export const Locations = LocationsInit();

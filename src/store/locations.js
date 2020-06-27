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
import distance from "../modules/locate/distance";

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
    async save(location) {
      location = location instanceof Location ? location : new Location(location);
      let theLocations;
      update((locations) => {
        locations.push(location);
        theLocations = locations;
        return locations;
      });
      return this.write(theLocations);
    },
    findClosestTo(location) {
      let match = null;
      update((locations) => {
        match = [...locations]
          .map((loc) => {
            return {
              distance: distance.between([location.lat, location.lng], [loc.lat, loc.lng], "m"),
              location: loc,
            };
          })
          .sort((a, b) => {
            return a.distance > b.distance ? 1 : -1;
          })
          .find((loc) => loc.distance < 0.5);

        return locations;
      });
      if (match) {
        return match.location;
      } else {
        return location;
      }
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
    async init() {
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
  // Storage.onReady(() => {
  //   methods.loadLocations();
  // });

  return {
    update,
    subscribe,
    set,
    ...methods,
  };
};

export const Locations = LocationsInit();

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

import config from "../config/appConfig";
import Location from "../modules/locate/Location";
import distance from "../modules/locate/distance";
import { Interact } from "./interact";
import { Lang } from "./lang";

// Stores

const console = new Logger("🗺 $Locations");

// Nomie API Store

const LocationsInit = () => {
  const BaseState: Array<Location> = [];
  const { update, subscribe, set } = writable(BaseState);

  const methods = {
    /**
     * Save a single location
     * it will update or insert if ifs new
     * @param {Location} location
     */
    async save(location: Location) {
      location = location instanceof Location ? location : new Location(location);
      let _locs: Array<Location>;

      update((locations) => {
        let found;
        _locs = locations.map((_loc: Location) => {
          // If found, it's an update
          if (_loc.id == location.id) {
            found = true;
            return location;
          } else {
            return _loc;
          }
        });
        // If not found, it's an insert
        if (!found) {
          _locs.push(location);
        }
        return _locs;
      });
      return this.write(_locs);
    },

    selectLocation(): Promise<Location> {
      return new Promise((resolve, reject) => {
        let locations = methods.getAll();
        let buttons: Array<any> = locations.map((location) => {
          return {
            title: location.name,
            click() {
              resolve(location);
            },
          };
        });
        Interact.popmenu({
          title: Lang.t("locations.select-a-location", "Select a Location"),
          buttons: buttons,
        });
      });
    },

    findClosestTo(location): Location {
      let match = null;
      update((locations) => {
        match = [...locations]
          .map((loc) => {
            return {
              distance: distance.between([location.lat, location.lng], [loc.lat, loc.lng], "nm"),
              location: loc,
            };
          })
          .sort((a, b) => {
            return a.distance > b.distance ? 1 : -1;
          })
          .find((loc) => loc.distance < 0.1);
        return locations;
      });
      if (match) {
        return match.location;
      } else {
        return null;
      }
    },
    getAll(): Array<Location> {
      let all = [];
      update((state) => {
        all = state;
        return state;
      });
      return all;
    },
    async write(payload): Promise<any> {
      return await Storage.put(`${config.data_root}/locations.json`, payload);
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

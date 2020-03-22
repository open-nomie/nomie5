/**
 * People Store
 
 */

// Svelte
import { writable } from "svelte/store";

// utils
import Logger from "../utils/log/log";

// Vendors
import Storage from "../modules/storage/storage";

// Get Config
import config from "../../config/global";

const console = new Logger("🗺 $PeopleStore");

// Nomie API Store

const PeopleInit = () => {
  const PeopleState = {};
  const { update, subscribe, set } = writable(PeopleState);

  const methods = {
    async init() {
      Storage.get(`${config.data_root}/people.json`).then(people => {
        update(d => people || {});
      });
    },
    async save(peopleArray) {
      update(people => {
        let changed = false;
        peopleArray.forEach(username => {
          if (!people.hasOwnProperty(username)) {
            changed = true;
            people[username] = username;
          }
        });
        if (changed) {
          this.write(people);
        }
        return people;
      });
    },
    async write(payload) {
      return Storage.put(`${config.data_root}/people.json`, payload);
    }
  };

  return {
    update,
    subscribe,
    set,
    ...methods
  };
};

export const PeopleStore = PeopleInit();

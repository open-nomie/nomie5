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

// Get Module
import Person from "../modules/person/person";

// Stores

const console = new Logger("🗺 $PeopleStore");

// Nomie API Store

const PeopleInit = () => {
  const PeopleState = {};
  const { update, subscribe, set } = writable(PeopleState);

  const methods = {
    async init() {
      Storage.get(`${config.data_root}/people.json`).then(people => {
        console.log("People", people);
        update(d => people || {});
      });
    },
    /**
     * Save a single location
     * it will update or insert if ifs new
     * @param {Location} location
     */
    async save(peopleArray) {
      console.log("Saving to People", peopleArray);
      update(people => {
        let changed = false;
        peopleArray.forEach(username => {
          if (!people.hasOwnProperty(username)) {
            changed = true;
            people[username] = username;
          }
        });
        if (changed) {
          console.log("Changes", people);
          this.write(people);
        }
        return people;
      });
    },
    async write(payload) {
      return Storage.put(`${config.data_root}/people.json`, payload);
    },
    deleteByTag(tag) {
      update(people => {
        let data = people.filter(row => row.tag !== tag);
        this.write(data);
        return data;
      });
    }
  };

  // Get storage
  //   Storage.onReady(() => {
  //     Storage.get(`${config.data_root}/people.json`).then(people => {
  //       people = (people || []).map(person => {
  //         return new Person(person);
  //       });
  //       update(d => people || []);
  //     });
  //   });

  return {
    update,
    subscribe,
    set,
    ...methods
  };
};

export const PeopleStore = PeopleInit();

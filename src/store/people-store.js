/**
 * People Store
 
 */

// Svelte
import { writable } from "svelte/store";

// utils
import Logger from "../utils/log/log";
import math from "../utils/math/math";
import snakeCase from "../utils/snake-case/snake-case";
import NomieLog from "../modules/nomie-log/nomie-log";

// Vendors
import Storage from "../modules/storage/storage";

// Get Config
import config from "../config/appConfig";

import { LedgerStore } from "./ledger";
import { Interact } from "./interact";
import { Lang } from "./lang";

import dayjs from "dayjs";

import Person from "../modules/person/person";

const console = new Logger("🗺 $PeopleStore");

const toUsername = (username) => {
  username = username.replace("@", "").trim();
  username = snakeCase(username);
  return username.toLowerCase();
};

function getState() {
  let returnState;
  update((state) => {
    returnState = state;
    return state;
  });
  return returnState;
}

const searchForPeople = async () => {
  let loadingFinished = Interact.loading("Finding @usernames...");
  const logs = await LedgerStore.query({ start: dayjs().subtract(3, "month") });

  let people = [];
  logs.forEach((log) => {
    let meta = log.getMeta();
    // Array of usernames.
    meta.people.forEach((personElement) => {
      let username = personElement.id.toLowerCase();
      people.push({ username, last: new Date(log.end) });
    });
    // people = [...people, ...meta.people];
  });

  let map = {};
  people.forEach((person) => {
    map[person.username] = map[person.username] || { username: person.username, dates: [] };
    map[person.username].dates.push(person.last);
  });

  let final = Object.keys(map).map((username) => {
    let dates = map[username].dates.sort((a, b) => {
      a > b ? 1 : -1;
    });
    return {
      username,
      last: dates[0],
    };
  });

  loadingFinished();
  return final;
};

/**
 * PEOPLE STORE
 * Used for global people things!
 * March 8 2020 - the Coronavirus COVID-19 is getting crazy.
 */

const PeopleInit = () => {
  const PeopleState = {
    people: {},
    stats: {},
  };
  const { update, subscribe, set } = writable(PeopleState);

  const methods = {
    async init() {
      await methods.getPeople();
      // Refresh the people every minute
      // This should help with blockstack users
      setInterval(() => {
        methods.getPeople();
      }, 1000 * 60 * 5);
    },
    savePerson(person) {
      update((state) => {
        state.people[person.username] = person;
        this.write(state.people);
        return state;
      });
    },
    async deletePerson(person) {
      update((state) => {
        if (typeof person == "string") {
          delete state.people[person];
        } else {
          delete state.people[person.username];
        }
        return state;
      });
      return methods.writeState();
    },
    get(name) {
      let person;
      update((state) => {
        if (state.people.hasOwnProperty(name)) {
          person = state.people[name];
        } else {
          person = new Person(name);
        }
        return state;
      });
      return person;
    },
    async getPeople() {
      // Get people from storage
      let people = await Storage.get(`${config.data_root}/${config.data_people_key}.json`);
      // Update State
      update((state) => {
        let statePeople = state.people;
        if (people) {
          // Turn it in to a Person Object
          Object.keys(people)
            .filter((row) => row)
            .forEach((personKey) => {
              statePeople[personKey.toLowerCase()] = new Person(people[personKey]);
            });
        }
        state.people = statePeople;
        return state;
      });
      return people;
    },
    async saveFoundPeople(peopleArray) {
      update((state) => {
        state.people = state.people || {};
        let changed = false;

        // Loop over array of people { username: x, last: date }
        peopleArray.forEach((person) => {
          if (typeof person != "string") {
            // If this is a new person
            if (!state.people.hasOwnProperty(person.username)) {
              state.people[person.username] = new Person(person.username);
              state.people[person.username].last = person.last || new Date();
              changed = true;
            } else {
              // If the current LAST date is less than (older) than the one provided
              // use the one provided, otherwise do nothing.
              if (state.people[person.username].last < person.last) {
                state.people[person.username].last = person.last;
                changed = true;
              }
            }
          } else {
            // Should no longer ever happen
            Interact.alert("Error", "Sorry savePeople was called with just a string. Please report this!");
          }
        });

        // Has Changes?
        if (changed) {
          this.write(state.people);
        }
        // Return state to update
        return state;
      });
    },
    async addByName(personName) {
      let person;
      let _state;
      if (personName) {
        let username = toUsername(personName).toLowerCase();
        let added = false;
        update((state) => {
          state.people = state.people || {};
          if (!state.people.hasOwnProperty(username)) {
            person = new Person({ username: username, displayName: personName });
            state.people[username] = person;
            added = true;
          }
          _state = state;
          return state;
        });
        if (added) {
          this.write(_state.people);
          return _state.people[username];
        } else {
          throw new Error("That username is already taken, please try another name.");
        }
      }
      return person;
    },
    async writeState() {
      update((state) => {
        methods.write(state.people);
        return state;
      });
    },
    async write(payload) {
      return Storage.put(`${config.data_root}/${config.data_people_key}.json`, payload);
    },
    // async stats(options = {}) {
    //   return await getRecentPeopleStats();
    // },
    async searchForPeople() {
      let people = await searchForPeople();
      if (people.length) {
        const confirm = await Interact.confirm(`${people.length} @username's found`, "Add them to your People list?");
        if (confirm) {
          await methods.saveFoundPeople(people);
          Interact.alert("👍 People list updated!");
        }
      } else {
        Interact.alert(`Sorry, no @username's found in the last 6 months`);
      }
    },
  };

  return {
    update,
    subscribe,
    set,
    ...methods,
  };
};

export const PeopleStore = PeopleInit();

/**
 * People Store
 
 */

// Svelte
import { writable } from "svelte/store";

// utils
import Logger from "../utils/log/log";
import math from "../utils/math/math";
import snakeCase from "../utils/snake-case/snake-case";

// Vendors
import Storage from "../modules/storage/storage";

// Get Config
import config from "../../config/global";

import { LedgerStore } from "./ledger";
import { Interact } from "./interact";
import { Lang } from "./lang";

import dayjs from "dayjs";

const console = new Logger("🗺 $PeopleStore");

const getLogs = async () => {
  return await LedgerStore.query({
    start: dayjs().subtract(6, "month"),
    end: new Date()
  });
};

const getPeopleLogs = async () => {
  const logs = await getLogs();
  return logs.filter(log => log.note.search("@") > -1);
};

const mapToUser = logs => {
  const users = {};
  logs.forEach(log => {
    const meta = log.getMeta();
    meta.people.forEach(username => {
      users[username] = users[username] || [];
      users[username].push(log);
    });
  });
  return users;
};

const normalizeUserMap = userMap => {
  const final = {};
  Object.keys(userMap).forEach(username => {
    let logs = userMap[username];
    final[username] = final[username] || {};
    final[username].logs = logs;
    final[username].score = 0;
    final[username].last = null;
    if (logs.length) {
      final[username].last = new Date(logs.sort((a, b) => (a.end < b.end ? 1 : -1))[0].end);
      final[username].score = math.sum(logs.map(log => log.score));
    } else {
    }
  });
  return final;
};

let currentStats = {};
const getRecentPeopleStats = async () => {
  let logs = await getPeopleLogs();
  currentStats = normalizeUserMap(mapToUser(logs));
  return currentStats;
};

const toUsername = username => {
  username = username.replace("@", "").trim();
  username = snakeCase(username);
  return username;
};

const searchForPeople = async () => {
  const logs = await getPeopleLogs();
  let people = [];
  logs.forEach(log => {
    let meta = log.getMeta();
    people = [...people, ...meta.people];
  });
  return people;
};

/**
 * PEOPLE STORE
 * Used for global people things!
 * March 8 2020 - the Coronavirus COVID-19 is getting crazy.
 */

const PeopleInit = () => {
  const PeopleState = {
    people: {},
    stats: {}
  };
  const { update, subscribe, set } = writable(PeopleState);

  const methods = {
    async init() {
      await methods.getPeople();
      await methods.getStats();
    },
    async getPeople() {
      let people = await Storage.get(`${config.data_root}/people.json`);
      return update(state => {
        state.people = people;
        return state;
      });
    },
    async getStats() {
      let stats = await getRecentPeopleStats();
      return update(state => {
        state.stats = stats;
        return state;
      });
    },
    currentStats() {
      return currentStats;
    },
    async save(peopleArray) {
      update(state => {
        let changed = false;
        peopleArray.forEach(username => {
          if (!state.people.hasOwnProperty(username)) {
            changed = true;
            state.people[username] = username;
          }
        });
        if (changed) {
          this.write(state.people);
        }
        return state;
      });
    },
    async add(username) {
      let _state;
      if (username) {
        username = toUsername(username);
        update(state => {
          if (!state.people.hasOwnProperty(username)) {
            state.people[username] = username;
          }
          _state = state;
          return state;
        });
        await this.write(_state.people);
        console.log("Did you add them", _state.people);
        return username;
      }
    },
    async write(payload) {
      return Storage.put(`${config.data_root}/people.json`, payload);
    },
    async stats(options = {}) {
      return await getRecentPeopleStats();
    },
    async searchForPeople() {
      let people = await searchForPeople();
      if (people.length) {
        const confirm = await Interact.confirm(`${people.length} @username's found`, "Add them to your People list?");
        if (confirm) {
          await methods.save(people);
          Interact.confirm(Lang.t("general.saved"), "People list updated");
        }
      } else {
        Interact.alert(`Sorry, no @username's found in the last 6 months`);
      }
      console.log("People!", people);
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

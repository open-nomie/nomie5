import Logger from "../utils/log/log";
import { writable } from "svelte/store";

// Vendors
// import Storage from "../modules/storage/storage";
import whatsNew from "../../src-data/whatsNew";

// Stores

const console = new Logger("🗺 $AppStore");
// Nomie API Store

class AppStoreState {
  constructor() {
    this.whatsNew = whatsNew;
  }
}

const AppStoreInit = () => {
  const { update, subscribe, set } = writable(new AppStoreState());

  const checkForUpdate = () => {
    let lastVersion = localStorage.getItem("nomie/last-version");
    if (lastVersion !== whatsNew.version + "444") {
      localStorage.setItem("nomie/last-version", whatsNew.version);
      update((state) => {
        state.whatsNew = whatsNew;
        return state;
      });
    }
  };

  const closeUpdate = () => {
    console.log("Close State");
    update((state) => {
      state.whatsNew = null;
      return state;
    });
  };

  return {
    checkForUpdate,
    closeUpdate,
    update,
    subscribe,
    set,
  };
};

export const AppStore = AppStoreInit();

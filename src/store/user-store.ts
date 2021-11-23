/**
 * User Store
 *
 * TODO: Look at push notifications in the browser
 */

// Utils
import Logger from "../utils/log/log";
import { writable } from "svelte/store";

// Modules
import Storage, { getStorageType, setStorage } from "../modules/storage/storage";

// Stores
import { TrackerStore } from "./tracker-store";
import { BoardStore } from "./boards";

import config from "../config/appConfig";

import { Interact } from "./interact";
import { LedgerStore } from "./ledger";

import { Lang } from "./lang";

import is from "../utils/is/is";
import Timer from "../utils/timer/timer";
import tick from "../utils/tick/tick";

// Consts
const console = new Logger("🤠 userStore");
const timer = new Timer("UserStore", false);

// declare let blockstack: any;
// const UserSession = new blockstack.UserSession();

/**
 * Define User Store Interfaces
 */
export interface IUserMetaStore {
  [key: string]: any;
}
export interface IUserMeta {
  lock: boolean;
  access_pin?: string;
  is24Hour?: boolean;
  firstDayOfWeek: "1" | "2"; // 1: Sunday, 2: Monday, etc.
  lastBackup?: Date;
  boardsEnabled?: boolean;
  canEditFiles?: boolean;
  hideLabels?: boolean;
  store?: IUserMetaStore;
  hideBackup?: boolean;
  hiddenFeatures?: boolean;
}
export interface IUserLocalSettings {
  compactButtons: boolean;
}

export interface IUserState {
  storageType: string;
  ready: boolean;
  signedIn?: boolean;
  launchCount: number;
  profile: {
    username?: string;
  };
  alwaysLocate: boolean;
  theme: string;
  theme_accent: string;
  location?: any;
  autoImportApi: boolean;
  needsOnboarding: boolean;
  meta: IUserMeta;
  locked: boolean;
  localSettings: IUserLocalSettings;
  pinUnlocked: boolean;
}

// Store Initlization
const userInit = () => {
  let listeners = [];
  // Using local storage because we need this before Storage can be initialized...
  // But this is pretty hacky and should be improved
  let useCompactButtons = JSON.parse(localStorage.getItem(`${config.data_root}/settings/compactButtons`) || "false");
  // User State
  let state: IUserState = {
    // SEt the storage type
    storageType: getStorageType(),
    // Is User Ready
    ready: false,
    // Is the user signedin
    signedIn: undefined,
    // Number of times app launched
    launchCount: JSON.parse(localStorage.getItem(`n4/storage/root/launch_count`) || "0"),
    // Locate when tracking?
    alwaysLocate: JSON.parse(localStorage.getItem(config.always_locate_key) || "false"),
    // App Theme
    theme: localStorage.getItem(config.theme_key) || "auto",
    theme_accent: localStorage.getItem(`${config.theme_key}-accent`) || "default",
    // location: undefined,
    autoImportApi: JSON.parse(localStorage.getItem("napi-auto") || "false"),
    // Should user be redirected to /setup
    needsOnboarding: false,
    locked: false,
    // Meta options are synced with blockstack
    // so its available on all devices
    meta: {
      lock: false,
      access_pin: undefined,
      is24Hour: false,
      firstDayOfWeek: "1", // 1: Sunday, 2: Monday, etc.
      lastBackup: undefined,
      hideLabels: false,
      hideBackup: false,
      store: {},
      hiddenFeatures: false,
    },
    // Local settings are only for a specific device
    localSettings: {
      compactButtons: useCompactButtons,
    },
    // Blockstack profile holder - not active used
    profile: {
      username: null,
    },
    pinUnlocked: false,
  };

  const { subscribe, set, update } = writable(state);

  const methods = {
    getStorageEngine() {
      return Storage._storageType();
    },
    async saveLastBackupDate() {
      update((state: IUserState) => {
        state.meta.lastBackup = new Date();
        return state;
      });
      return methods.saveMeta();
    },
    unlockHiddenFeatures() {
      update((state: IUserState) => {
        state.meta.hiddenFeatures = true;
        return state;
      });
      return methods.saveMeta();
    },
    getTimeFormat() {
      let format;
      update((state) => {
        if (state.meta.is24Hour) {
          format = "HH:mm";
        } else {
          format = "h:mm A";
        }
        return state;
      });
      return format;
    },
    getDateTimeFormat() {
      let format;
      update((state) => {
        if (state.meta.is24Hour) {
          format = { time: "HH:mm", date: "Do MMM YYYY" };
        } else {
          format = { time: "h:mm A", date: "MMM Do YYYY" };
        }
        return state;
      });
      return format;
    },
    initialize() {
      timer.start();
      timer.check("initialize()");
      // Set Dark or Light Mode
      // Lets get dark Mode

      // Count launch
      if (!state.storageType) {
        // If no storage type - let's on board the user.
        update((_state) => {
          _state.signedIn = false;
          _state.launchCount = 0;

          return _state;
        });
      } else {
        // Storage is set - wait for it to be ready
        Storage.onReady(async () => {
          // initialize the User store now that
          // storage is ready
          timer.check("Storage Ready");
          LedgerStore.init();
          try {
            await methods.bootstrap();
            timer.check("Bootstrap() complete");
            update((_state) => {
              _state.ready = true;
              _state.signedIn = true;
              _state.profile = Storage.getProfile();
              return _state;
            });
          } catch (e) {
            Interact.error(e.message);
          }
        }); // end storage on Ready
        timer.check("Storage Init Fired");
        Storage.init();
      }
    },
    setStorage(type) {
      type = ["blockstack", "local", "pouchdb"].indexOf(type) > -1 ? type : "local";
      update((d) => {
        d.storageType = type;
        setStorage(type);
        return d;
      });
      return type;
    },
    resetLaunchCount() {
      if (confirm("Reset Launch Count to zero?") === true) {
        Storage.local.put("root/launch_count", 0);
        update((d) => {
          d.launchCount = 0;
          return d;
        });
      }
    },
    signout() {
      localStorage.clear();
      // Storage.clear(); // no we shouldn't clear all storage.
      // try {
      //   blockstack.signUserOut(window.location.origin);
      // } catch (e) { }
      window.location.href = window.location.href;
    },
    /**
     * Set Profile and Signin
     */
    setProfile(profile) { },
    async bootstrap() {
      // First lets get the TrackerStore loaded
      state.launchCount++;
      Storage.local.put("root/launch_count", state.launchCount);
      // Load up the first date found.
      // LedgerStore.getFirstDate();
      // Prepare prmpses
      let promises = [methods.loadMeta(), TrackerStore.initialize(this), BoardStore.initialize()];
      try {
        await Promise.all(promises);
        return methods.fireReady(state);
      } catch (e) {
        Interact.error(e.message);
      }
    },

    reset() {
      update((u) => state);
    },
    redirectToSignIn() {
      // UserSession.redirectToSignIn();
    },
    setAlwaysLocate(bool) {
      localStorage.setItem(config.always_locate_key, JSON.stringify(bool));
      update((u) => {
        u.alwaysLocate = bool;
        return u;
      });
    },

    async mstore(key?: string, value?: any, remove?: boolean): Promise<any> {
      let response: any;
      update((state) => {
        try {
          if (key && !value) {
            // Get
            response = Promise.resolve(state.meta.store[key]);
          } else if (key && is.truthy(value)) {
            // Put
            state.meta.store[key] = value;
            response = Storage.put(config.user_meta_path, state.meta);
          } else if (!key && !value && !remove) {
            // Get all Stored items
            response = Promise.resolve(state.meta.store);
          } else if (key && remove) {
            // Remove
            delete state.meta.store[key];
            response = Storage.put(config.user_meta_path, state.meta);
          }
        } catch (e) {
          console.error(`meta error ${e.message}`);
        }
        return state;
      });

      return await response;
    },

    meta(): IUserMeta {
      return methods.data().meta;
    },
    /**
     * Meta Data
     * Meta is unclassified data that is needed to make the app work
     * it's usually just user preferences but  can be used for other things
     *
     */

    /**
     * Load Meta for this user
     */
    async loadMeta() {
      let value;
      try {
        value = await Storage.get(config.user_meta_path);
      } catch (e) { }
      update((usr) => {
        if (value) {
          usr.meta = value;
        }
        return usr;
      });
      // Does the user have an access_pin?
      // If so, let's require a pin
      if (value && value.access_pin) {
        methods.getRequiredPin();
      }
      return value;
    },
    async getRequiredPin() {
      // Give the UI time to catch up
      await tick(200);
      // Get the pin from the user
      let pin = await Interact.inputPin(Lang.t("settings.pin-required", "Pin Required"));
      // Default to locked
      let isUnlocked: boolean = false;
      // If we have a pin
      if (pin) {
        // Get the state and update accordingly
        update((state) => {
          // Does the user provided pin match whats in meta.access_pin
          if (pin === state.meta.access_pin) {
            state.pinUnlocked = true;
            isUnlocked = true;
          } else {
            state.pinUnlocked = false;
          }
          return state;
        });
        // If it's still unlocked - it failed.
        if (!isUnlocked) {
          Interact.alert(Lang.t("settings.pin-invalid", "Invalid Pin, try again"));
          // Call this again
          return methods.getRequiredPin();
        }
      } else {
        // No pin - call this again.
        return methods.getRequiredPin();
      }
    },
    /**
     * Save the Meta object for this user
     */
    saveMeta(payload: any = {}) {
      let meta;
      update((state) => {
        meta = { ...(state.meta || {}), ...payload };
        state.meta = meta;
        return state;
      });
      return Storage.put(config.user_meta_path, meta);
    },
    // Get the current state
    data() {
      let d;
      update((usr) => {
        d = usr;
        return usr;
      });
      return d;
    },
    getTheme() {
      return localStorage.getItem(config.theme_key) || "auto";
    },
    // Set Dark Mode for User
    setTheme(theme, accent: string = "default") {
      theme = ["auto", "light", "dark"].indexOf(theme) > -1 ? theme : "auto";
      document.documentElement.className = "";
      localStorage.setItem(config.theme_key, theme);
      localStorage.setItem(`${config.theme_key}-accent`, accent);
      document.documentElement.classList.add(`mode-${theme}`);
      document.documentElement.classList.add(`${accent}`);
      document.documentElement.classList.add(`font-size-${localStorage.getItem("font-size") || "md"}`);
      update((u) => {
        u.theme = theme;
        u.theme_accent = accent;
        return u;
      });
    },

    // Pass the Session
    session() {
      return null;
    },
    // On Ready Event
    onReady(func) {
      let st = methods.data() || {};
      if (st.ready === true) {
        func(st);
      } else {
        listeners.push(func);
      }
    },
    // Fire when Ready!
    fireReady(payload) {
      update((b) => {
        b.ready = true;
        return b;
      });
      listeners.forEach((func) => {
        func(payload);
      });
      listeners = [];
    },
    storage() {
      return Storage;
    },
    listFiles() {
      return Storage.list();
    },
  };

  return {
    subscribe,
    set,
    update,
    ...methods,
  };
};

export const UserStore = userInit();

/**
 * User Store
 *
 * TODO: Look at push notifications in the browser
 */

// Utils
import Logger from "../utils/log/log";
import { writable } from "svelte/store";

// Modules
import Storage from "../modules/storage/storage";
import locate from "../modules/locate/locate";

// Stores
import { TrackerStore } from "./trackers";
import { BoardStore } from "./boards";

import config from "../../config/global";

// Consts
const console = new Logger("🤠 userStore");
const UserSession = new blockstack.UserSession();

// Store Initlization
const userInit = () => {
  let listeners = [];
  // User State
  let state = {
    storageType: Storage.local.get("root/storage_type"),
    ready: false,
    signedIn: undefined,
    launchCount: Storage.local.get("root/launch_count") || 0,
    profile: {
      username: null
    },
    alwaysLocate: JSON.parse(
      localStorage.getItem(config.always_locate_key) || "false"
    ),
    theme: localStorage.getItem(config.theme_key) || "auto",
    location: null,
    autoImportApi: false,
    meta: {
      lock: false,
      pin: null,
      aggressiveSync: false,
      is24Hour: false
    },
    locked: true
  };

  const { subscribe, set, update } = writable(state);

  const methods = {
    getStorageEngine() {
      return Storage._storageType();
    },
    initialize() {
      // Set Dark or Light Mode
      // Lets get dark Mode

      // Count launch
      state.launchCount++;
      Storage.local.put("root/launch_count", state.launchCount);

      if (!Storage._storageType()) {
        // If no storage type selected
        // they're not signed in - this should trigger onboarding
        // in App.svelte
        update(p => {
          p.signedIn = false;
          p.launchCount = 0;
          return p;
        });
      } else {
        // Storage is set - wait for it to be ready
        Storage.onReady(() => {
          methods
            .bootstrap()
            .then(() => {
              update(d => {
                d.ready = true;
                d.signedIn = true;
                d.profile = Storage.getProfile();

                return d;
              });
            })
            .catch(e => {
              console.error(e.message);
            });
        }); // end storage on Ready

        /**
         * Initiate the Storage Engine
         * This will do the work depending on if its
         * blockstack (requiring a login) or localForage
         */
        Storage.init();
      }

      // set highlevel initialize marker

      // TODO: Add 10 minute interval to check for day change - if change, fire a new user.ready
    },
    setStorage(type) {
      type =
        ["blockstack", "local", "pouchdb"].indexOf(type) > -1 ? type : "local";
      update(d => {
        d.storageType = type;
        Storage.local.put("root/storage_type", type);
        d.launchCount = state.launchCount;
        return d;
      });
      return type;
    },
    resetLaunchCount() {
      if (confirm("Reset Launch Count to zero?") === true) {
        Storage.local.put("root/launch_count", 0);
        update(d => {
          d.launchCount = 0;
          return d;
        });
      }
    },
    signout() {
      localStorage.clear();
      // Storage.clear(); // no we shouldn't clear all storage.
      try {
        blockstack.signUserOut(window.location.origin);
      } catch (e) {}
      window.location.href = window.location.href;
    },
    /**
     * Set Profile and Signin
     */
    setProfile(profile) {
      console.log("user.setProfile()", profile);

      // Fire off the remaining bootstrap items.

      // Update store with new profile.
    },
    bootstrap() {
      // First lets get the TrackerStore loaded
      let promises = [];
      promises.push(methods.loadMeta());
      promises.push(methods.loadTrackersAndBoards());
      return Promise.all(promises)
        .then(() => {
          return methods.fireReady(state);
        })
        .catch(e => {
          console.error("bootstrap", e.message);
          alert(e.message);
        });
    },
    loadTrackersAndBoards() {
      return TrackerStore.initialize(this).then(trackers => {
        // Now lets load the BoardStore and pass these trackers
        return BoardStore.initialize(this, trackers).then(() => {
          // Now let's fire off that we're ready
          if (state.alwaysLocate) {
            locate();
          }
          return { trackers };
        });
      });
    },
    reset() {
      update(u => state);
    },
    redirectToSignIn() {
      UserSession.redirectToSignIn();
    },
    setAlwaysLocate(bool) {
      localStorage.setItem(config.always_locate_key, JSON.stringify(bool));
      update(u => {
        u.alwaysLocate = bool;
        return u;
      });
    },
    unlock() {
      update(usr => {
        usr.locked = false;
        return usr;
      });
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
    loadMeta() {
      return Storage.get(config.user_meta_path).then(value => {
        if (value) {
          update(usr => {
            usr.meta = value;
            return usr;
          });
        }
        return value;
      });
    },
    /**
     * Save the Meta object for this user
     */
    saveMeta() {
      let usr = methods.data();
      if (Object.keys(usr.meta).length) {
        return Storage.put(config.user_meta_path, usr.meta);
      }
    },
    // Get the current state
    data() {
      let d;
      update(usr => {
        d = usr;
        return usr;
      });
      return d;
    },
    // Set Dark Mode for User
    setTheme(theme) {
      theme = ["auto", "light", "dark"].indexOf(theme) > -1 ? theme : "auto";
      localStorage.setItem(config.theme_key, theme);
      document.body.classList.remove(`theme-light`);
      document.body.classList.remove(`theme-dark`);
      document.body.classList.remove(`theme-auto`);
      document.body.classList.add(`theme-${theme}`);

      update(u => {
        u.theme = theme;
        return u;
      });
    },

    // Pass the Session
    session() {
      return UserSession;
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
      update(b => {
        b.ready = true;
        return b;
      });
      listeners.forEach(func => {
        func(payload);
      });
      listeners = [];
    },
    storage() {
      return Storage;
    },
    /**
     * ListFiles()
     * List all files for a user
     * TODO: move this to modules/storage
     */
    listFiles() {
      // let data = methods.data();
      // let storageType = Storage.local.get('root/storage_type');
      return Storage.list();
      // return new Promise((resolve, reject) => {
      // 	let files = [];
      // 	if (data.storageType === 'blockstack') {
      // 		blockstack
      // 			.listFiles(file => {
      // 				if (files.indexOf(file) == -1) {
      // 					files.push(file);
      // 				}
      // 				return true;
      // 			})
      // 			.then(() => {
      // 				resolve(files);
      // 			});
      // 	} else if (data.storageType === 'local') {
      // 		localforage.keys().then(keys => {
      // 			files = keys;
      // 			resolve(files);
      // 		});
      // 	} else {
      // 		alert('No storage type found for ' + data.storageType);
      // 	}
      // });
    }
  };

  return {
    subscribe,
    set,
    update,
    ...methods,
    boards: BoardStore,
    trackers: TrackerStore
  };
};

export const UserStore = userInit();

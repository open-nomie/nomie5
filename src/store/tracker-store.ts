// Svelte
import { writable } from "svelte/store";

// Modules
import Storage from "../modules/storage/storage";
import Tracker from "../modules/tracker/tracker";
import StarterPack from "../modules/packs/default-trackers";

// Config
import config from "../config/appConfig";

import snakeCase from "../utils/snake-case/snake-case";
import tick from "../utils/tick/tick";
import downloader from "../modules/download/download";
import extractor from "../utils/extract/extract";

// Stores
import { Interact } from "./interact";
import { BoardStore } from "./boards";
import { TrackerLibrary } from "./tracker-library";
import { Lang } from "./lang";

// Utils
import Logger from "../utils/log/log";
import type { ITrackers } from "../modules/import/import";
import NPaths from "../paths";

const console = new Logger("🌟 TrackerStore 🌟");

class TrackerStoreState {
  trackers: ITrackers;
  showTimers: boolean;
  timers: Array<any>;

  constructor() {
    this.trackers = {};
    this.showTimers = false;
    this.timers = [];
  }
  tagExists(tag) {
    return this.trackers.hasOwnProperty(tag.toLowerCase);
  }
  byTag(tag) {
    if (this.tagExists(tag)) {
      return this.trackers[tag];
    } else {
      return new Tracker({ tag });
    }
  }
  asArray() {
    return Object.keys(this.trackers).map((tag) => {
      return this.trackers[tag];
    });
  }
  runningTimers() {
    return this.asArray().filter((tracker) => {
      return tracker.started;
    });
  }
}

const trackerStoreState = new TrackerStoreState();

const trackerStoreInit = () => {
  const { update, subscribe, set } = writable(trackerStoreState);
  const methods = {
    /**
     * Initialization
     *
     * This takes place in the user store. Once the user is loaded, it will
     * initialize trackers and the boards. Then fire off the user ready command
     */
    async initialize(UserStore) {
      // Create standalone function to update the tracker data
      let updateTrackers = (trackers) => {
        update((state) => {
          // Clean the trackers
          state.trackers = methods.scrub(trackers);
          // Get Running Timers
          state.timers = Object.keys(trackers)
            .map((tag) => {
              return state.trackers[tag];
            })
            .filter((tracker) => tracker.started);
          // Push up the cleaned tracker
          return state;
        });
      };
      // Create a listener for if the data change remotely (pouchdb)
      let onTrackersUpdated = (data) => {
        updateTrackers(data);
      };
      // Get Trackers from Storage - pass Updated function if it updates later on.
      let trackers = await Storage.get(NPaths.storage.trackers(), onTrackersUpdated);
      // If don't have trackers - show the selector
      if (!trackers) {
        /// It's their first time
        setTimeout(() => {
          TrackerLibrary.showFirst();
        }, 10);
      } else {
        // We have trackers - so update them.
        updateTrackers(trackers);
      }
    },
    toggleTimers() {
      update((state) => {
        state.showTimers = !state.showTimers;
        return state;
      });
    },
    showTimers() {
      update((state) => {
        state.showTimers = true;
        return state;
      });
    },
    hideTimers() {
      update((state) => {
        state.showTimers = false;
        return state;
      });
    },
    startTimer(tracker) {
      update((state) => {
        if (state.trackers[tracker.tag]) {
          state.trackers[tracker.tag].started = new Date().getTime();
          if (state.timers.indexOf(tracker) == -1) {
            state.timers.push(tracker);
          }
        }
        return state;
      });
      return methods.put();
    },
    stopTimer(tracker) {
      update((state) => {
        if (state.trackers[tracker.tag]) {
          state.trackers[tracker.tag].started = null;
          state.timers = state.timers.filter((tkr) => {
            return tkr.tag != tracker.tag;
          });
        }
        return state;
      });
      return methods.put();
    },
    getAll() {
      let data = {};
      update((state) => {
        data = state.trackers;
        return state;
      });
      return data || {};
    },
    tagExists(tag) {
      let trackers = methods.getAll();
      return trackers[tag] !== undefined;
    },
    getById(id) {
      let trackers = methods.getAll();
      let tracker = Object.keys(trackers)
        .map((tag) => trackers[tag])
        .find((tracker) => {
          return tracker.id === id;
        });
      return new Tracker(tracker);
    },
    getRunning() {
      //TODO :: Get this working so you can see all timers on a single dynamic board
      let allTrackers = methods.getAll() || {};
      return [];
      // return Object.keys(allTrackers || {})
      // 	.map(tag => {
      // 		return allTrackers[tag];
      // 	})
      // 	.filter(tracker => {
      // 		return tracker.started || false;
      // 	});
    },
    // Clean up any messy trackers
    scrub(trackers) {
      Object.keys(trackers).forEach((key) => {
        if (!trackers[key].tag) {
          delete trackers[key];
        } else {
          trackers[key] = new Tracker(trackers[key]);
        }
      });
      return trackers;
    },
    /**
     * Get Active Store Data
     */
    data() {
      let d = null;
      update((trks) => {
        d = trks;
        return trks;
      });
      return d;
    },
    /**
     * Get Trackers as Array
     */
    getAsArray() {
      let all = this.getAll();
      return Object.keys(all)
        .map((tag) => {
          return all[tag];
        })
        .sort((a, b) => {
          return a.label < b.label ? -1 : 1;
        });
    },
    // Get Tracker by Tag
    getByTag(tag) {
      let trackers = this.getAll();
      return trackers.hasOwnProperty(tag) ? trackers[tag] : new Tracker({ tag: tag });
    },

    byTag(tag) {
      return methods.getByTag(tag);
    },

    /**
     *  Populate Nomie with a starter Pack
     *
     * TODO: Move this to BoardStore
     *
     * This will take the default-trackers.js StarterPack and fill it in
     * Automatically creating boards and adding trackers
     */

    populate(pack) {
      return new Promise((resolve, reject) => {
        // Set a map to layout board trackers
        let boards = {};
        // Loop over each of the tracker object keys
        Object.keys(pack.trackers).forEach((tag) => {
          // if the tracker has a board attribute
          if (pack.trackers[tag].board) {
            let boardName = pack.trackers[tag].board;
            boards[boardName] = boards[boardName] || [];
            boards[boardName].push(tag);
          }
        });
        // Holder of promises
        let promises = [];

        // Save trackers from pack
        methods.save(pack.trackers).then(() => {
          // Loop over the boards Map
          Object.keys(boards).forEach((boardName) => {
            // Add the board to BoardStore
            promises.push(BoardStore.addBoard(boardName, boards[boardName]));
          });
        });
        // Wait for boards to be saved
        Promise.all(promises)
          .then((res) => {
            // Reinitalize the board with the new trackers
            BoardStore.initialize();
            resolve(res);
          })
          .catch(reject);
      });
    },
    put() {
      let data = methods.data();
      return Storage.put(NPaths.storage.trackers(), data.trackers);
    },
    /**
     * Save The Tracker Store
     *
     * Optionally provide an object of trackers.
     * This will merge with existing.
     */
    save(trackers: ITrackers = {}) {
      let mergedTrackers;
      update((state) => {
        mergedTrackers = { ...state.trackers, ...trackers };
        Object.keys(mergedTrackers).forEach((tag) => {
          mergedTrackers[tag] = new Tracker(mergedTrackers[tag]);
        });
        state.trackers = mergedTrackers;
        return state;
      });
      return Storage.put(NPaths.storage.trackers(), mergedTrackers);
      // if (trackers) {
      //   let mergedTrackers;
      //   update((state) => {
      //     mergedTrackers = { ...state.trackers, ...trackers };
      //     Object.keys(mergedTrackers).forEach((tag) => {
      //       mergedTrackers[tag] = new Tracker(mergedTrackers[tag]);
      //     });
      //     state.trackers = mergedTrackers;
      //     return state;
      //   });
      //   return Storage.put(`${config.data_root}/trackers.json`, mergedTrackers);
      // } else {
      //   return new Promise((resolve, reject) => {
      //     update((state) => {
      //       // Save
      //       methods.save(state.trackers).then(resolve).catch(reject);
      //       return state;
      //     });
      //   });
      // }
    },
    async duplicateTracker(tracker) {
      const label: any = await Interact.prompt(
        "New Label",
        `This will create a duplicate tracker with ${tracker.label}'s settings, but a new tag and label`
      );
      if (label) {
        let newTag = snakeCase(label).toLowerCase();
        let existing = methods.tagExists(newTag);
        if (existing) {
          Interact.alert(Lang.t("general.error"), `#${newTag} already exists.`);
        } else {
          // Create new one
          let newTracker: Tracker = new Tracker(tracker);
          newTracker.tag = newTag;
          newTracker.label = label;
          // Save the Tracker
          let saved = await methods.saveTracker(newTracker);
          if (saved) {
            // Edit it?
            let editConfirm = await Interact.confirm(
              Lang.t("tracker.duplication-complete", "Duplication Complete"),
              Lang.t("tracker.edit-tracker-now", "Would you like to edit the new tracker?")
            );
            if (editConfirm) {
              Interact.dismissEditTracker();
              await tick(300);
              Interact.editTracker(newTracker);
            }
          } else {
            Interact.alert(Lang.t("general.error"), "Sorry, duplication failed");
          }
        }
      }
    },
    deleteTracker(tracker) {
      let response;
      update((state) => {
        state.trackers = state.trackers || {};
        delete state.trackers[tracker.tag];
        try {
          response = methods.save(state.trackers);
        } catch (e) {
          alert(e.message);
        }
        return state;
      });
      return response;
    },
    /**
     * Import a Tracker from a .nomie.json file
     */
    importFromFile() {
      // Create an input and listen for a change
      let inputFile = document.createElement("input");
      inputFile.type = "file";
      inputFile.click();
      // Input change
      inputFile.onchange = (event: any) => {
        let reader = new FileReader();
        let file: any = event.target.files[0];
        // file on loaded
        reader.onload = async (theFile: any) => {
          try {
            // get data
            let fileData = JSON.parse(theFile.target.result);
            // if it
            if (fileData.type === "tracker") {
              // Create the tracker
              let tracker = new Tracker(fileData.tracker);
              // Confirm the user wants to install it.
              let confirmed = await Interact.confirm(`Install ${tracker.emoji} ${tracker.label}?`, `Type: ${tracker.type}`);
              if (confirmed) {
                await methods.saveTracker(tracker);
                Interact.toast(`${tracker.emoji} ${tracker.label} added`);
              }
            } else {
              Interact.alert("Error", "This isn't a valid tracker");
            }
          } catch (e) {
            Interact.alert("Error", e.message);
          }
        };
        // Read the file
        reader.readAsText(file);
      };
    },
    download(tracker) {
      let pkg = {
        type: "tracker",
        tracker,
        created: new Date(),
        version: `APP_VERSION`,
      };
      downloader.text(`${snakeCase(tracker.label).toLowerCase()}.nomie.tkr`, JSON.stringify(pkg));
    },
    async saveTracker(tracker) {
      let response;
      let board = BoardStore.data();
      let trackers;
      update((state) => {
        trackers = state.trackers;
        state.trackers[tracker.tag] = tracker;
        return state;
      });
      response = await methods.save(trackers);

      if (board.id !== "all") {
        BoardStore.addTrackersToActiveBoard([tracker]);
      }
      return response;
    },
  };
  return {
    state: trackerStoreState,
    update,
    subscribe,
    set,
    ...methods,
  };
};

export const TrackerStore = trackerStoreInit();

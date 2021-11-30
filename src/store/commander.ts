/**
 * Commander
 * Partial port + cleanup from Nomie 2 - currently only supports Notes.  Nomie 2 supported all sorts of wacky shit
 */

// Svelte
import { writable } from "svelte/store";

// utils
import Logger from "../utils/log/log";

// Modules
import Storage from "../modules/storage/storage";
import NomieLog from "../modules/nomie-log/nomie-log";

// Stores
import { LedgerStore } from "../domains/ledger/LedgerStore";
import { Interact } from "./interact";
import { TrackerStore } from "./tracker-store";
import { ActiveLogStore } from "./active-log";
import TrackerInputer from "../modules/tracker/tracker-inputer";

const console = new Logger("🚦 Commander");

const commanderInit = () => {
  const { update, subscribe, set } = writable({
    running: false,
    commands: [],
    finished: [],
  });

  const methods = {
    /**
     * Load from local storage if it exists.
     * If a user passes a command in the url, and the user isn't logged in
     * we will save the command to local storage and execute when a user
     * is ready
     */
    load() {
      let storage = Storage.local.get("commander") || null;
      if (storage) {
        update((bs) => {
          bs = storage;
          return bs;
        });
      }
    },
    /**
     * Add Command
     * for example add('note', { note: 'This is the note' })
     */
    add(command, payload) {
      update((bs) => {
        bs.commands.push({ command, payload });
        Storage.local.put("commander", bs);
        return bs;
      });
    },
    /**
     * Save commander to local storage
     */
    save() {
      update((bs) => {
        Storage.local.put("commander", bs);
        return bs;
      });
    },
    /**
     * Access the current writeable data
     */
    data() {
      let data = {};
      update((bs) => {
        data = bs;
        return bs;
      });
      return data;
    },
    /**
     * Run the Commands
     *
     * Single function to execute any outstanding commands.
     */
    run() {
      // Pull latest data
      let data = this.data();
      try {
        if (data.commands.length) {
          // Set a holder for finished results
          let finished = [];
          // Set recursive function for running one at a time.
          let runner = () => {
            // Return promise
            return new Promise((resolve, reject) => {
              // Is finished full?
              if (finished.length < data.commands.length) {
                // Time to do some command running
                // Run command using finished count as the index
                this.runCommand(data.commands[finished.length])
                  .then((res) => {
                    // Push to finished
                    finished.push(res);
                    // Return another runner.
                    return runner();
                  })
                  .catch((e) => {
                    // Shit, error - still push it to finished so it gets counted.
                    finished.push(e.message);
                    // Return rnner
                    return runner();
                  });
              } else {
                // Resolve it man!
                update((bs) => {
                  bs.commands = [];
                  bs.finished = finished;
                  Storage.local.put("commander", bs);
                  return bs;
                });
                // Toast!
                if (finished.filter((r) => r).length) {
                  Interact.toast(`${finished.length} command${finished.length === 1 ? "" : "s"} executed`);
                }
                resolve(finished);
              }
            });
          };
          // Start off the initial runner.
          return runner();
        }
      } catch (e) {
        console.error(e);
      }
    },
    /**
     * Run Command
     * runCommand({
     *  command: 'note',
     *  payload: {
     *      note: 'this is my note'
     *  }
     * })
     */
    async runCommand(command) {
      switch ((command || {}).command) {
        case "note":
          let maxLength = 500;
          // Create a Log
          let note = decodeURIComponent(command.payload.note);
          let log = new NomieLog({
            note: note.substr(0, maxLength),
            lat: command.payload.lat ? parseFloat(command.payload.lat) : null,
            lng: command.payload.lng ? parseFloat(command.payload.lng) : null,
          });
          if (note && note.length < maxLength) {
            // Save the log to the ledger
            let confirm = await Interact.confirm("Add Note?", note.substr(0, maxLength));
            if (confirm === true) {
              let saving = await LedgerStore.saveLog(log);
              return saving;
            } else {
              return false;
            }
          } else if (note.length >= maxLength) {
            Interact.alert("Error", `Note exceeds ${maxLength} characters`);
          } else {
            return false;
          }

          break;
        default:
          return "unknown command";
          break;
      }
    },
    /**
     * Process the URL for any params that we can use.
     */
    async processURL() {
      let urlParams: any = {};
      // Get URL params - split em up - loop over them - fill urlParams object
      let base = window.location.search.replace("?", "").substr(0, 1000);

      base.split("&").forEach((chunks) => {
        let kv = chunks.split("=");
        urlParams[kv[0]] = kv[1];
      });
      // If a command URL is present.
      if (urlParams.hasOwnProperty("note")) {
        methods.add("note", urlParams);
        // Clear the state.
        window.history.pushState({}, document.title, "/");
      } else if (urlParams.hasOwnProperty("tracker")) {
        let tracker = TrackerStore.getByTag(urlParams.tracker);
        let value = urlParams.value ? parseFloat(urlParams.value) : undefined;
        let inputer = new TrackerInputer(tracker, TrackerStore.data().trackers);
        let note = await inputer.getElements({ value });
        ActiveLogStore.addElement(note.join(" "));
        window.history.pushState({}, document.title, "/");
      }
    },
  };

  // Check for any URL Params ... Do this even if the user is logged out.
  // That way when they log in we can still access the request
  // that will have been blown away by the auth process.
  methods.load();
  setTimeout(() => {
    methods.processURL();
  }, 300);

  return {
    update,
    subscribe,
    set,
    ...methods,
  };
};

export const CommanderStore = commanderInit();

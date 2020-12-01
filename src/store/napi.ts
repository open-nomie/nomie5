/**
 * Commander
 * Partial port + cleanup from Nomie 2 - currently only supports Notes.  Nomie 2 supported all sorts of wacky shit
 */

// Svelte
import { writable } from "svelte/store";

// utils
import Logger from "../utils/log/log";
// import PromiseStep from "../utils/promise-step/promise-step";
// import ScoreNote from "../modules/scoring/score-note";

// Modules
// import Storage from "../modules/storage/storage";
import NomieLog from "../modules/nomie-log/nomie-log";
// Modules
import NomieAPICli from "../modules/nomie-api-cli/nomie-api-cli";

// Stores
import { LedgerStore } from "./ledger";
import { Interact } from "./interact";
// import { TrackerStore } from "./tracker-store";
import tick from "../utils/tick/tick";
import appConfig from "../config/appConfig";
import dayjs from "dayjs";

const console = new Logger("🚦 Nomie API");
// Todo consider making this configurable
const NAPI = new NomieAPICli({ domain: appConfig.api.split("//")[1] });

// Nomie API Store
let autoImporterInterval;
const nomieApiInit = () => {
  // const listeners = [];

  interface ApiStateConfig {
    registered: boolean;
    apiKey: string | undefined;
    privateKey: string | undefined;
    autoImport: boolean;
    ready: boolean;
  }

  let _state: ApiStateConfig = {
    registered: false,
    apiKey: null,
    privateKey: null,
    autoImport: JSON.parse(localStorage.getItem("napi-auto") || "false"),
    ready: false,
  };
  const { update, subscribe, set } = writable(_state);

  const methods = {
    // Load the Napi - and fire things when ready
    load() {
      NAPI.onReady(() => {
        update((base) => {
          if (NAPI.isRegistered()) {
            base.registered = true;
            base.ready = true;
            base.apiKey = NAPI.apiKey;
            base.privateKey = NAPI.privateKey;
            if (methods.shouldAutoImport()) {
              methods.startAutoImporting();
            }
          } else {
            base.registered = false;
            base.ready = true;
          }
          return base;
        });
      });
    },
    getLogs() {
      return NAPI.logs();
    },
    shouldAutoImport() {
      return JSON.parse(localStorage.getItem("napi-auto") || "false");
    },
    async autoImport() {
      // Get all the logs
      let logs = await methods.getLogs();
      // If we have logs lets import them
      if (logs.length) {
        // Do the import
        let results = await methods.import(logs);
        // If no errors - show a toast notification
        if (results.errors.length == 0) {
          Interact.toast(`${logs.length} ${logs.length > 1 ? "notes" : "note"} imported`);
          await NAPI.clear();
        } else {
          Interact.alert(
            "Import incomplete",
            `Imported ${results.success.length} of ${logs.length}. Please go to settings / data / nomie api / captured to see all notes current available.`
          );
        }
      }
    },
    async import(logs: Array<any>) {
      Interact.blocker(`Importing ${logs.length}  ${logs.length > 1 ? "notes" : "note"} from the API...`);
      // Wait a second
      await tick(500);
      // loop over each log
      let results = {
        errors: [],
        success: [],
      };
      // For loop (for async) over logs
      for (let i = 0; i < logs.length; i++) {
        // Get log
        let log = logs[i];
        try {
          // Add the Date
          // Convert it into an official Nomie Log
          let nLog = new NomieLog(log);
          // nLog.end = dayjs(log.date).toDate().getTime();
          nLog.end = new Date(log.date).getTime();
          // Save the Log
          await LedgerStore.saveLog(nLog);
          // Push success
          results.success.push(nLog);
        } catch (e) {
          // An error has happened
          results.errors.push({
            error: e.message,
            log,
          });
          // Show error to console
          console.error(e.message);
        }
      }
      // Stop the blocker
      Interact.stopBlocker();
      // return the error, success arrays
      return results;
    },
    enableAutoImport() {
      update((base) => {
        base.autoImport = true;
        localStorage.setItem("napi-auto", JSON.stringify(true));
        return base;
      });
      methods.startAutoImporting();
    },
    startAutoImporting() {
      setTimeout(() => {
        if (!autoImporterInterval) {
          autoImporterInterval = setInterval(() => {
            methods.autoImport();
          }, 1000 * 60 * 4);
          methods.autoImport();
        }
      }, 1000);
    },
    stopAutoImporting() {
      clearInterval(autoImporterInterval);
    },
    disableAutoImport() {
      update((base) => {
        base.autoImport = false;
        localStorage.setItem("napi-auto", JSON.stringify(false));
        return base;
      });
      methods.stopAutoImporting();
    },
  };

  return {
    update,
    subscribe,
    set,
    ...methods,
  };
};

export const NomieAPI = nomieApiInit();

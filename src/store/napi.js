/**
 * Commander
 * Partial port + cleanup from Nomie 2 - currently only supports Notes.  Nomie 2 supported all sorts of wacky shit
 */

// Svelte
import { writable } from "svelte/store";

// utils
import Logger from "../utils/log/log";
import PromiseStep from "../utils/promise-step/promise-step";
import calculateScore from "../utils/calculate-score/calculate-score";

// Modules
import Storage from "../modules/storage/storage";
import NomieLog from "../modules/nomie-log/nomie-log";
// Modules
import NomieAPICli from "../modules/nomie-api-cli/nomie-api-cli";

// Stores
import { LedgerStore } from "./ledger";
import { Interact } from "./interact";
import { TrackerStore } from "./tracker-store";

const console = new Logger("🚦 Nomie API");
const NAPI = new NomieAPICli({ domain: "nomieapi.com" });

// Nomie API Store
let autoImporterInterval;
const nomieApiInit = () => {
  const listeners = [];
  let _stub = {
    registered: false,
    apiKey: null,
    privateKey: null,
    autoImport: JSON.parse(localStorage.getItem("napi-auto") || "false"),
    ready: false,
  };
  const { update, subscribe, set } = writable(_stub);

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
      let logs = await methods.getLogs();
      if (logs.length) {
        await methods.import(logs);
        await NAPI.clear();
      }
    },
    async import(logs) {
      Interact.blocker(`Importing ${logs.length} notes from the API...`);
      let finished = await PromiseStep(
        logs,
        (log) => {
          log.end = new Date(log.date);
          let nLog = new NomieLog(log);
          nLog.score = calculateScore(nLog.note, TrackerStore.state.trackers);
          return LedgerStore.saveLog(nLog);
        },
        (status) => {
          console.log("Status", status);
        }
      );
      Interact.stopBlocker();
      return finished;
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
      if (!autoImporterInterval) {
        autoImporterInterval = setInterval(() => {
          methods.autoImport();
        }, 1000 * 60 * 4);
        methods.autoImport();
      }
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

  if (_stub.autoImport) {
  }

  return {
    update,
    subscribe,
    set,
    ...methods,
  };
};

export const NomieAPI = nomieApiInit();

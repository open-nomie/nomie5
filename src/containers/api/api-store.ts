/**
 * API Store
 * Svelte Store that interfaces with the Nomie API Client
 * */

// Svelte
import { writable } from "svelte/store";

import APIClient from "./api-cli";
import Storage from "../../modules/storage/storage";
// import Hyperstorage from "../../modules/hyperstorage/hyperstorage";

// import Note, { NoteGeo } from "../notes/note.class";

// import { ToastStore } from "../../components/toast/toast.store";
// import { AlertStore } from "../../components/alert/alert.store";
// import { NoteStore } from "../notes/note.store";
import _ from "lodash";
import NLog from "../../modules/nomie-log/nomie-log";
import { Interact } from "../../store/interact";
import tick from "../../utils/tick/tick";
import dayjs from "dayjs";
import { LedgerStore } from "../../store/ledger";
import { Lang } from "../../store/lang";

// import wait from "../../modules/utils/wait";
// import { DeviceStore } from "../device/device.store";

// const console = new Logger("🚦 Nomie API");
// Todo consider making this configurable
const NAPI = new APIClient({ domain: "nomieapi.com/.netlify/functions" });

export interface MassNapiLogImport {
  // success:Array<{nLog:any, log:NapiLog}>;
  success: Array<{ nlog: NLog; log: NapiLog }>;
  errors: Array<{ error: Error; log: NapiLog }>;
}

// From the Nomie API Service
export interface NapiLog {
  date: Date;
  id: string;
  lat?: number;
  lng?: number;
  note: string;
  source: string;
  saved?: boolean;
  discarded?: boolean;
}

// Store State Type
interface ApiStateConfig {
  registered?: boolean;
  apiKey?: string | undefined;
  privateKey?: string | undefined;
  autoImport?: boolean;
  ready?: boolean;
  items?: Array<NapiLog>;
  inArchive?: Array<NapiLog>;
  inAPI?: Array<NapiLog>;
  generating?: boolean;
  deviceDisabled?: boolean;
}

const API_PING_TIME = 1000 * 60; // check every 4 minutes
const API_DEVICE_DISABLED = 'napi-device-disabled';

// Nomie API Store
const createApiStore = () => {
  // Setup non syncing storage
  // const ApiLogStore = new Hyperstorage("api-logs");
  const ApiLogStore = new Storage.SideStore('napi/saved.json');
  // holder for the Auto Import Time Check
  let monitorInterval: any;
  // Create the State
  const _state: ApiStateConfig = {
    deviceDisabled: !canApiRunOnDevice(),
    registered: undefined,
    apiKey: null,
    privateKey: null,
    autoImport: false,
    ready: false,
    items: [],
    inArchive: [],
    inAPI: [],
    generating: false,
  };
  // Get Store Items
  const { update, subscribe, set } = writable(_state);

  function canApiRunOnDevice():boolean {
    return localStorage.getItem(API_DEVICE_DISABLED) ? false : true;
  }

  /**
   * Get Store Logs from the Archives
   */
  function getArchives():Array<NapiLog> {
    return ApiLogStore.get("napi/saved.json") || [];
  }
  /**
   * Set Stored Logs to the Archive
   * @param stored
   */

  // function clearArchives() {
  //   return ApiLogStore.put("napi/saved.json", []);
  // }

  async function setArchives(stored: Array<NapiLog> = []) {
    ApiLogStore.put("napi/saved.json", stored);
    fuse({inArchive: stored.sort((a,b)=>{ return a.date < b.date ? 1 : -1})});
    return true;
  }

 
  /**
   * Fuse State
   * Getter and Updater for the Svelte Store State
   **/
  function fuse(_state: ApiStateConfig = {}): ApiStateConfig {
    let updatedState: ApiStateConfig;
    update((state) => {
      updatedState = { ...state, ..._state };
      return updatedState;
    });
    return updatedState;
  }


  const methods = {
    // Load the Napi - and fire things when ready
    async init() {
      // Auto clear sicne we can toggle now 
      methods.stopMonitoring();
      // Can it run on this device? 
      const canRun:boolean = canApiRunOnDevice();
      // Initialize the Client
      if(canRun === true) {
        await NAPI.init();
      }
      // When Ready
      NAPI.onReady(async () => {
        console.log("✅ Nomie API Client Ready");
        // Are they registered
        const isRegistered: boolean = NAPI.isRegistered();
        // Update State Accordingly
        const state = fuse(
          isRegistered
            ? {
                registered: true,
                apiKey: NAPI.keyLocker.apiKey,
                privateKey: NAPI.keyLocker.privateKey,
                autoImport: ApiLogStore.get("auto-import") ? true : false,
              }
            : {
                registered: false,
                apiKey: undefined,
                privateKey: undefined,
                autoImport: false,
              }
        );
        // Get the Logs if we're registered
        if (isRegistered && canRun) {
          await tick(200);
          methods.startMonitoringAPI(state.autoImport);
        }
      });
      console.log("✅ Nomie API Store initialized");
    },
    clearArchives() {
      console.log("Clear?");
      ApiLogStore.put("napi/saved.json", []);
      methods.init();
    },
    toggleDeviceDisabled() {
      console.log("Toggling device disabled");
      if(canApiRunOnDevice()) {
        console.log("Currently Enabled switching to disabled");
        localStorage.setItem(API_DEVICE_DISABLED, '1');
        fuse({ deviceDisabled: true})
      } else {
        console.log("Currently DIsabled switching to ENABLED");
        localStorage.removeItem(API_DEVICE_DISABLED);
        fuse({ deviceDisabled: false})
      }
      methods.init();
    },
    async toggleAutoImport() {
      update((state) => {
        console.log("Current Toggle state", state.autoImport);
        state.autoImport = !state.autoImport;
        console.log("After Toggle Toggle state", state.autoImport);
        ApiLogStore.put("auto-import", state.autoImport);
        
        return state;
      });
      await tick(200);
      window.location.reload();
    },
    /**
     * 
     * Discard a Log
     * This will remove a log from the archive
     * 
     * @param napiLog 
     */
    discard(napiLog: NapiLog) {
      let stored: Array<NapiLog> = getArchives() || [];
      setArchives(
        stored.map((log) => {
          if (log.id == napiLog.id) {
            log.discarded = true;
          }
          return log;
        })
      );
      update((state) => {
        state.items = stored.filter((l) => !l.discarded && !l.saved).sort((a,b)=>a.date > b.date ? 1 : -1);
        return state;
      });
    },
    /**
     * Get Archive Log
     * These are just stored in lcoal storage 
     */
    getArchivesLogs(): Array<NapiLog> {
      return getArchives() || [];
    },
    /**
     * Set Archives
     * Save them all in one big chunkt.
     * @param logs 
     */
    setArchivesLogs(logs: Array<NapiLog>) {
      return setArchives(logs);
      // ApiLogStore.put('napi/stored', logs);
    },
    /**
     * 
     * Destory the API 
     * 
     * This is to absolutely destory the API from the Device and the Server
     * 
     */
    async destroy(): Promise<boolean> {
      // Ask user for confirmation 
      const ask = await Interact.confirm(
        "Destroy this API Key on the device and server?",
        `It will no longer work, ever. This will make the API completely unusable to external systems`
      );
      if (ask) {
        try {
          // Call Destory 
          await NAPI.destory();
          // Clear local config
          methods.clearConfig();
          return true;
        } catch (e) {
          // Clear config event if we get an error 
          methods.clearConfig();
          Interact.error(e.message);
        }
      }
    },
    clearConfig() {
      NAPI.clearConfig();
      fuse({
        registered: false,
        apiKey: undefined,
        privateKey: undefined,
      });
    },
    async forget(): Promise<boolean> {
      const ask = await Interact.confirm(
        "Forget the API Key and Private Key?",
        `The API key will still remain valid on the server, and you can use it later. But you'll need to restore using the api/private key.`
      );
      if (ask) {
        // const cleared = await clearArchives();
        // console.log("Cleared?", cleared);
        methods.clearConfig();
        Interact.toast(`API config forgotten`);
      } else {
        return false;
      }
    },
    async getLogs(): Promise<Array<NapiLog>> {
      // Get logs from API
      let logs: Array<NapiLog> = await NAPI.logs();
      // Get Saved / Cached Logs from Side Storage
      const stored: Array<NapiLog> = methods.getArchivesLogs();
      // Loop over logs from API
      logs.forEach((log: NapiLog) => {
        // Does it exist in Stored array?
        const fromStorage = stored.find((l) => l.id == log.id);
        // If not, it's new - lets add it
        if (!fromStorage) {
          // Mar it as not saved
          log.saved = false;
          // Pushed to Stored
          stored.push(log);
        }
      });

      // Save to Storage
      setArchives(stored);
      // Update State so UI can react
      const state = fuse({
        items : stored.filter((l) => !l.saved && !l.discarded),
        inArchive : stored,
        inAPI : stored.filter(l=>!l.saved && !l.discarded),
      })
      if(state.inAPI.length == 0 && logs.length > 0) {
        console.log("🔥 we have a pointless logs in the API. DELETE THEM!");
        await NAPI.clear();
      }
      // Return Array of Items stored;
      return stored;
    },
    toLog(apiLog:NapiLog): NLog {
      let log: NLog = new NLog(apiLog);
      log.end = apiLog.date ? new Date(apiLog.date).getTime() : new Date().getTime();
      return log;
    },
    async restoreKeys() {
      // Prepare user for needed info
      const ask = await Interact.confirm(
        `Restore your API Key`,
        `To restore, you'll be asked to provide your API Key and Private Key. Continue?`
      );
      if (ask) {
        try {
          // Ask for API KEY
          const apiKey = prompt(`API Key`);
          // Ask for Private key
          const privateKey = prompt("Private Key");
          // If we are missing either - rerun this method again
          if (!privateKey || !apiKey) {
            methods.restoreKeys();
          } else {
            // Test if the combo is valid 
            const test = await NAPI.testAndSave(apiKey, privateKey);
            if (test === true) {
              methods.init();
              Interact.alert(Lang.t('general.success','Success!'), `👍  API Successfully Restored`);
            } else {
              Interact.error("Unable to verify that API Key and Private Key combination");
            }
          }
        } catch (e) {
          Interact.error(e.message);
        }
      }
    },
    /**
     * Restore a Discarded Log
     * @param log 
     */
    restoreLog(log:NapiLog) {
      // Remove saved and discarded
      log.saved = false;
      log.discarded = false;
      // Get the latest archives
      const archives = getArchives();
      // SEt the archives with an updated log
      setArchives(archives.map((loopLog:NapiLog)=>{
        if(loopLog.id == log.id) {
          return log;
        } else {
          return loopLog
        }
      }))
    },
    async autoImport() {
      // Get all the logs from the API and Stored Locally
      // Filter out Saved and Discarded
      let allLogs: Array<NapiLog> = (await methods.getLogs()) || [];
      let logs: Array<NapiLog> = allLogs.filter((l) => !l.saved && !l.discarded);
      
      // If we have logs lets import them
      if (logs.length) {
        // Save the Logs
        let results: MassNapiLogImport = await methods.import(logs);
        // If no errors - show a toast notification
        if (results.errors.length == 0 && results.success.length == logs.length) {
          // Interact.toast(`${logs.length} ${logs.length > 1 ? "notes" : "note"} imported`);
          Interact.toast(`${logs.length} ${logs.length > 1 ? "notes" : "note"} imported`);
          // Clear the Nomie API
          await NAPI.clear();
        } else {
          await Interact.alert( "Import incomplete",`Imported ${results.success.length} of ${logs.length}. Please go to settings / data / nomie api / captured to see all notes current available.`);
        }
        // Refresh
        methods.getLogs();
      }
    },
    async import(logs: Array<NapiLog>): Promise<MassNapiLogImport> {
      let archives:Array<NapiLog> = getArchives();
      // Block the UI
      Interact.blocker(`Importing ${logs.length}  ${logs.length > 1 ? "notes" : "note"} from the API...`);
      await tick(500);
      // loop over each log
      let results: MassNapiLogImport = {
        errors: [],
        success: [],
      };
      // For loop (for async) over logs
      for (let i = 0; i < logs.length; i++) {
        // Get log
        let log: NapiLog = logs[i];
        try {
          // Add the Date
          // Convert it into an official Nomie Log
          // let nLog = methods.toLog(log);
          const nlog = methods.toLog(log);
          // Add a millsecond at the end to avoid duplicate IDs
          // await NoteStore.save(note);
          // Save the Log
          const saved = await LedgerStore.saveLog(nlog);
          log.saved = saved ? true : false;
          // Update the Archives for this Note / Log
          let foundInArchive:boolean = false;
          // Map map saved log in archive.
          archives = archives.map((loopLog:NapiLog)=>{
            if(loopLog.id == log.id) {
              foundInArchive = true;
              loopLog.saved = true;
            }
            return loopLog;
          });

          if(!foundInArchive) {
            log.saved = true;
            archives.push(log);
          }

          // Update the Archive 
          setArchives(archives);
          // Push successful save to results 
          results.success.push({ nlog, log });
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
      methods.getLogs();
      // return the error, success arrays
      return results;
    },
    /**
     * Register for a New API Key
     */
    async register() {
      // Notify user we're generating
      fuse({ generating: true });
      try {
        // Get new API key and private key
        const registered = await NAPI.register();
        // If we're good 
        if (registered) {
          fuse({
            generating: false,
            registered: true,
            privateKey: NAPI.keyLocker.privateKey,
            apiKey: NAPI.keyLocker.apiKey,
          });
        } else {
          // Something bad happened
          Interact.error("An unknown error occured while registering.");
          console.error(registered);
        }
      } catch (e) {
        // Something really bad happened
        Interact.error(e.message);
        fuse({ generating: false });
        console.error(e);
      }
    },
    /**
     * 
     * Monitor API
     * 
     * We will monitor the API from here - passing in the AutoImport is a way 
     * to avoid having to bring the UserStore into here causing a circular
     * dependency - which outputs a console warning and is annoying. 
     * But having to pass it in here is fucking annoying too. 
     * 
     * @param autoImport: boolean 
     */
    startMonitoringAPI(autoImport: boolean = false) {
      // Begin Monitoring 
      console.log("🟢🟢🟢 Starting to Monitor the API");
      // Clear the last Interval
      methods.stopMonitoring();
      // Function to call each interval 
      const monitor = () => {
        // If we're auto import or not 
        if (autoImport) {
          // Get and Import
          methods.autoImport();
        } else {
          // get logs only
          methods.getLogs();
        }
      };
      // Every N minutes 
      monitorInterval = setInterval(monitor, API_PING_TIME);
      // Immediate 
      monitor();
    },
    stopMonitoring() {
      clearInterval(monitorInterval);
    },
  };

  return {
    update,
    subscribe,
    set,
    ...methods,
  };
};

export const ApiStore = createApiStore();

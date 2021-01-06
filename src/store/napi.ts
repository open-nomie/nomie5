/**
 * Commander
 * Partial port + cleanup from Nomie 2 - currently only supports Notes.  Nomie 2 supported all sorts of wacky shit
 */

// Svelte
import { writable } from "svelte/store";

// utils
import Logger from "../utils/log/log";
import Storage  from "../modules/storage/storage";

// Modules
import NomieLog from "../modules/nomie-log/nomie-log";
// Modules
import NomieAPICli from "../modules/nomie-api-cli/nomie-api-cli";
// Stores
import { LedgerStore } from "./ledger";
import { Interact } from "./interact";
import tick from "../utils/tick/tick";
import appConfig from "../config/appConfig";
import dayjs from "dayjs";
import  NLog from "../modules/nomie-log/nomie-log";

const console = new Logger("🚦 Nomie API");
// Todo consider making this configurable
const NAPI = new NomieAPICli({ domain: appConfig.api.split("//")[1] });

export interface MassNapiLogImport {
  success:Array<{nLog:NLog, log:NapiLog}>;
  errors:Array<{error:Error, log:NapiLog}>;
}
export interface NapiLog {
  date: Date;
  id: string;
  lat?:number;
  lng?:number;
  note:string;   
  source:string;
  saved?: boolean;
  discarded?: boolean;
}

interface ApiStateConfig {
  registered: boolean;
  apiKey: string | undefined;
  privateKey: string | undefined;
  autoImport: boolean;
  ready: boolean;
  items: Array<NapiLog>;
  inArchive:Array<NapiLog>;
  inAPI: Array<NapiLog>
}
// Nomie API Store
let autoImporterInterval:any;
const nomieApiInit = () => {
  // const listeners = [];
  
  let _state: ApiStateConfig = {
    registered: false,
    apiKey: null,
    privateKey: null,
    autoImport: JSON.parse(localStorage.getItem("napi-auto") || "false"),
    ready: false,
    items: [],
    inArchive: [],
    inAPI: []
  };
  const { update, subscribe, set } = writable(_state);
  
  const ApiLogStore = new Storage.SideStore('napi/saved.json');
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
            
            if(base.apiKey && base.privateKey) {
              // methods.startMonitoring();
              methods.startMonitoringAPI();
            }

          } else {
            base.registered = false;
            base.ready = true;
          }
          return base;
        });

        // Check for Logs 
        methods.getLogsSafe();

      });
    },
    getLogs() {
      return NAPI.logs();
    },
    shouldAutoImport() {
      return JSON.parse(localStorage.getItem("napi-auto") || "false");
    },
    discard(napiLog:NapiLog) {
      let stored:Array<NapiLog> = ApiLogStore.get('napi/stored') || [];
      ApiLogStore.put('napi/stored', stored.map((log)=>{
        if(log.id == napiLog.id) {
          log.discarded = true;
        }
        return log;
      }));
      update((state)=>{
        state.items = stored.filter(l=>!l.discarded && !l.saved);
        return state;
      })
    },
    getStoredLogs():Array<NapiLog> {
      return  ApiLogStore.get('napi/stored') || [];
    },
    setStoredLogs(logs:Array<NapiLog>) {
      ApiLogStore.put('napi/stored', logs);
    },
    async getLogsSafe():Promise<Array<NapiLog>> {
      // Get logs from API
      const logs:Array<NapiLog> = await methods.getLogs();
      // Get Saved / Cached Logs from Side Storage 
      const stored:Array<NapiLog> = methods.getStoredLogs();
      // Loop over logs from API
      logs.forEach((log:NapiLog)=>{
        // Does it exist in Stored array?
        const fromStorage = stored.find(l=>l.id == log.id);
        // If not, it's new - lets add it 
        if(!fromStorage) {
          // Mar it as not saved 
          log.saved = false;
          // Pushed to Stored 
          stored.push(log);
          return true;
        }
      })
      // Save to Storage 
      ApiLogStore.put('napi/stored', stored);
      // Update State so UI can react
      update(state=>{
        state.items = stored.filter(l=>!l.saved && !l.discarded);
        state.inArchive = stored;
        state.inAPI = logs
        return state;
      })
      // Return Array of Items stored;
      return stored;
    },
    toLog(apiLog:NapiLog): NLog {
      let log: NLog = new NLog(apiLog);
      log.end = dayjs(apiLog.date).valueOf();
      return log;
    },
    async autoImport() {
      // Get all the logs from the API and Stored Locally
      // Filter out Saved and Discarded 
      let logs:Array<NapiLog> = (await methods.getLogsSafe() || []).filter(l=>!l.saved && !l.discarded);
      // If we have logs lets import them
      if (logs.length) {
        
        // Save the Logs 
        let results:MassNapiLogImport = (await methods.import(logs));
        
        // Get Stored Logs
        // Pulls from local Storage - so we can make sure to not 
        // miss any API posts.
        const stored:Array<NapiLog> = methods.getStoredLogs();
        
        // Update Stored items if saved
        // Map over saved state if found in the results.success array
        stored.map((napiLog)=>{
          // Ignore Discarded and Saved Logs 
          if(!napiLog.discarded && !napiLog.saved) {
            // Mark as saved if found in the success array
            napiLog.saved = results.success.find(l=>l.log.id == napiLog.id) ? true : false
          }
          return napiLog
        })
        // Write the Stored Logs to Storage 
        ApiLogStore.put('napi/stored', stored);
        
        // If no errors - show a toast notification
        if (results.errors.length == 0 && results.success.length == logs.length) {
          Interact.toast(`${logs.length} ${logs.length > 1 ? "notes" : "note"} imported`);
          // Clear the Nomie API
          await NAPI.clear();
        } else {
          await Interact.alert(
            "Import incomplete",
            `Imported ${results.success.length} of ${logs.length}. Please go to settings / data / nomie api / captured to see all notes current available.`
          );
        }

        methods.getLogsSafe();
      }
      
    },
    async import(logs: Array<NapiLog>):Promise<MassNapiLogImport> {
      Interact.blocker(`Importing ${logs.length}  ${logs.length > 1 ? "notes" : "note"} from the API...`);
      // Wait a second
      await tick(500);
      // loop over each log
      let results:MassNapiLogImport = {
        errors: [],
        success: [],
      };
      // For loop (for async) over logs
      for (let i = 0; i < logs.length; i++) {
        // Get log
        let log:NapiLog = logs[i];
        try {
          // Add the Date
          // Convert it into an official Nomie Log
          let nLog = methods.toLog(log);
          // Add a millsecond at the end to avoid duplicate IDs
          nLog.end = new Date(log.date).getTime();
          // Save the Log
          const saved = await LedgerStore.saveLog(nLog);
          log.saved = saved ? true : false;
          // Push success
          results.success.push({nLog, log});
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
      methods.startMonitoringAPI();
    },
    startMonitoringAPI() {
      if (!autoImporterInterval) {
        autoImporterInterval = setInterval(async () => {
          // If auto import is enabled
          if (methods.shouldAutoImport()) {
            methods.autoImport();   
          } else {
            // otherwise just check for any new 
            methods.getLogsSafe();
          }
        }, 1000 * 60 * 4);
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

  return {
    update,
    subscribe,
    set,
    ...methods,
  };
};

export const NomieAPI = nomieApiInit();

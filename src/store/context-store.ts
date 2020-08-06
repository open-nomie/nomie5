/**
 * Context Store
  Context are like categories, or "soft tags", things that help you group
  posts and content. 
 */

// Svelte
import { writable } from "svelte/store";

// utils
import Logger from "../utils/log/log";

// Vendors
import Storage from "../modules/storage/storage";

// Get Config
import config from "../../config/global";
import dayjs from "dayjs";

// Stores
import { Interact } from "./interact";
import { LedgerStore } from "./ledger";
import array_utils from "../utils/array/array_utils";
import type TrackableElement from "../modules/trackable-element/trackable-element";

const console = new Logger("🗺 $ContextStore");

const searchForContext = async () => {
  let contexts = [];
  Interact.blocker("Finding context...");
  try {
    const logs = await LedgerStore.query({ start: dayjs().subtract(6, "month") });
    logs.forEach((log) => {
      log.getMeta().context.forEach((context) => {
        contexts.push(context.id);
      });
    });
  } catch (e) {
    console.error(e);
    Interact.alert("Error", e.message);
  }
  Interact.stopBlocker();
  return array_utils.unique(contexts);
};

// Nomie API Store

const ContextInit = () => {
  const ContextState = {};
  const { update, subscribe, set } = writable(ContextState);

  const methods = {
    async init() {
      let context = await methods.get();
      update((d) => context || []);
      return context;
    },
    async get() {
      let context = Storage.get(`${config.data_root}/context.json`);
      return context || [];
    },
    // Search for Context
    async searchForContext() {
      // Get Context from search function
      let contexts = await searchForContext();
      // If we have results
      if (contexts.length) {
        // Confirm the user wants to import them
        const confirmed = await Interact.confirm(`${contexts.length} context found`, "Add them to your list?");
        if (confirmed) {
          // We have confirmed.
          try {
            // Get Existing
            let existing = await methods.get();
            // Create final array - make it unique
            let final = array_utils.unique([...existing, ...contexts]);
            // Write this to storage
            update((state) => {
              state = final;
              return state;
            });
            await methods.write(final);
            Interact.alert("👍 Context list updated!");
          } catch (e) {
            console.error(e);
            Interact.alert("Error", e.message);
          }
        }
      } else {
        Interact.alert(`Sorry, no context found in the last 6 months`);
      }
    },

    async save(contextArray: Array<TrackableElement>) {
      update((context: Array<string>) => {
        let changed = false;
        contextArray.forEach((contextElement) => {
          if (context.indexOf(`${contextElement.id}`) == -1) {
            changed = true;
            context.push(`${contextElement.id}`);
          }
        });
        if (changed) {
          this.write(context);
        }
        return context;
      });
    },
    async write(payload: Array<string>) {
      return Storage.put(`${config.data_root}/context.json`, payload);
    },
  };

  return {
    update,
    subscribe,
    set,
    ...methods,
  };
};

export const ContextStore = ContextInit();

/**
 * Commander
 * Partial port + cleanup from Nomie 2 - currently only supports Notes.  Nomie 2 supported all sorts of wacky shit
 */

// Svelte
import { writable } from "svelte/store";

// utils
import Logger from "../utils/log/log";

// Vendors

import StartPack from "../modules/packs/default-trackers";
import { TrackerStore } from "../store/tracker-store";
import { Interact } from "../store/interact";
import { Lang } from "../store/lang";

// Stores

const console = new Logger("📚 Nomie Library");

// Nomie API Store

const TrackerLibInit = () => {
  const { update, subscribe, set } = writable({
    trackers: Object.keys(StartPack.trackers).map((key) => StartPack.trackers[key]),
    show: false,
    first: false,
    activeBundle: null,
  });

  console.log("INITIALIZING");

  const methods = {
    toggle() {
      update((p) => {
        p.show = !p.show;
        p.first = false;
        return p;
      });
    },
    presentBundle(bundle) {
      update((state) => {
        state.activeBundle = bundle;
        return state;
      });
    },
    installBundle(bundle) {
      console.log("install this bundle", bundle);
    },
    showFirst() {
      update((p) => {
        p.show = true;
        p.first = true;
        return p;
      });
    },
  };

  return {
    update,
    subscribe,
    set,
    ...methods,
  };
};

export const TrackerLibrary = TrackerLibInit();

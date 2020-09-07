import { writable } from "svelte/store";
import Storage from "../modules/storage/storage";

/**
 * Feature Store is fast way to store a feature setting locally
 * it will not be pushed up to the cloud if they're using blockstack
 * good for things like device specific settings
 */

const FeatureStoreInit = () => {
  const state = Storage.local.get("features") || {};
  let { update, set, subscribe } = writable(state);
  const methods = {
    toggle(feature: string, def?: boolean) {
      update((state) => {
        if (state[feature] && def !== undefined) {
          state[feature] = def;
        } else {
          state[feature] = state[feature] || true;
        }
        Storage.local.put("features", state);
        return state;
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

export const FeatureStore = FeatureStoreInit();

/**
 * Commander
 * Partial port + cleanup from Nomie 2 - currently only supports Notes.  Nomie 2 supported all sorts of wacky shit
 */

// Svelte
import { writable } from "svelte/store";

// utils
import Logger from "../utils/log/log";

// Vendors
const console = new Logger("📲 Device Store");

declare let window: any;

// Nomie API Store

const DeviceStoreInit = () => {
  let deviceMatches = navigator.userAgent.toLowerCase().match(/android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i);
  let device = deviceMatches ? deviceMatches[0] : "browser";

  const { update, subscribe, set } = writable({
    width: window.innerWidth,
    height: window.innerHeight,
    platform: navigator.platform,
    device: device,
    offline: false,
    pwa: window.matchMedia("(display-mode: standalone)").matches,
  });

  function state(s: any) {
    let _state;
    update((state) => {
      _state = { ...state, ...s };
      return _state;
    });
    return _state;
  }

  const methods = {
    iOS() {
      return (navigator.platform || "").toLowerCase().match(/iphone|ipad|ipod/gi) ? true : false;
    },
    init() {
      const fireChange = () => {
        if (navigator.onLine) {
          document.body.classList.remove("is-offline");
          window.offline = false;
          state({ offline: false });
        } else {
          document.body.classList.add("is-offline");
          window.offline = true;
          state({ offline: true });
        }
      };
      window.addEventListener("online", fireChange);
      window.addEventListener("offline", fireChange);
      fireChange();
    },
  };

  return {
    subscribe,
    update,
    set,
    ...methods,
  };
};

export const Device = DeviceStoreInit();

/**
 * Commander
 * Partial port + cleanup from Nomie 2 - currently only supports Notes.
 * Nomie 2 supported all sorts of wacky shit
 */

// Svelte
import { writable } from "svelte/store";

// utils
import Logger from "../utils/log/log";

// Vendors
const console = new Logger("📲 Device Store");

declare let window: any;

// Nomie API Store

const DeviceInfo = {
  appName: navigator.appName,
  appCodeName: navigator.appCodeName,
  appVersion: navigator.appVersion,
  userAgent: navigator.userAgent,
  product: navigator.product,
};
const DeviceInfoString = JSON.stringify(DeviceInfo).toLowerCase();

const DeviceStoreInit = () => {
  let deviceMatches = DeviceInfoString.match(/android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i);
  let device = deviceMatches ? deviceMatches[0] : "browser";

  const { update, subscribe, set } = writable({
    width: window.innerWidth,
    height: window.innerHeight,
    platform: navigator.platform,
    device: device,
    offline: false,
    pwa: window.matchMedia("(display-mode: standalone)").matches,
    info: DeviceInfo,
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
    scrollToTop() {
      document.getElementById("nomie-main").scrollTo(0, 0);
      document.body.classList.remove("scrolled");
    },
    open(url) {
      window.open(url, "_system");
    },
    is(regex: string | RegExp) {
      if (typeof regex === "string") {
        regex = new RegExp(regex, "gi");
      }
      return DeviceInfoString.match(regex);
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
    info: DeviceInfo,
  };
};

export const Device = DeviceStoreInit();

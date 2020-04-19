/**
 * Commander
 * Partial port + cleanup from Nomie 2 - currently only supports Notes.  Nomie 2 supported all sorts of wacky shit
 */

// Svelte
import { writable } from "svelte/store";

// utils
import Logger from "../utils/log/log";

// Vendors
const console = new Logger("🚦 Browser Store");

// Nomie API Store

const BrowserStoreInit = () => {
  let deviceMatches = navigator.userAgent.toLowerCase().match(/android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i);
  let device = deviceMatches ? deviceMatches[0] : "browser";

  const { update, subscribe, set } = writable({
    width: window.innerWidth,
    height: window.innerHeight,
    platform: navigator.platform,
    device: device,
    pwa: window.matchMedia("(display-mode: standalone)").matches,
  });

  const methods = {
    iOS() {
      return (navigator.platform || "").toLowerCase().match(/iphone|ipad|ipod/gi) ? true : false;
    },
  };

  //   window.onresize = (evt) => {
  //     update((state) => {
  //       state.width = window.innerWidth;
  //       state.height = window.innerHeight;
  //       return state;
  //     });
  //   };

  return {
    subscribe,
    update,
    set,
    ...methods,
  };
};

export const Browser = BrowserStoreInit();

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

export type DeviceSizeType = "xs" | "sm" | "md" | "lg" | "xl";

const sizes = {
  xs: 0,
  sm: 350,
  md: 600,
  lg: 980,
  xl: 1280,
};

// Nomie API Store

const DeviceInfo = {
  appName: navigator.appName,
  appCodeName: navigator.appCodeName,
  appVersion: navigator.appVersion,
  userAgent: navigator.userAgent,
  product: navigator.product,
};
const DeviceInfoString = JSON.stringify(DeviceInfo).toLowerCase();

const getDeviceSize = function (width: number) {
  if (width > sizes.xs && width < sizes.sm) {
    return "xs";
  } else if (width > sizes.sm && width < sizes.md) {
    return "sm";
  } else if (width > sizes.md && width < sizes.lg) {
    return "md";
  } else if (width > sizes.lg && width < sizes.xl) {
    return "lg";
  } else if (width > sizes.xl) {
    return "xl";
  }
};

const DeviceStoreInit = () => {
  let deviceMatches = DeviceInfoString.match(/android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i);
  let device = deviceMatches ? deviceMatches[0] : "browser";

  const { update, subscribe, set } = writable({
    width: window.innerWidth,
    height: window.innerHeight,
    platform: navigator.platform,
    device: device,
    offline: !navigator.onLine,
    pwa: window.matchMedia("(display-mode: standalone)").matches,
    info: DeviceInfo,
    size: getDeviceSize(window.innerWidth),
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
      window.open(`${url}`, "_blank");
    },
    isSmallerThan(size: DeviceSizeType) {
      return window.innerWidth < sizes[size];
    },
    isLargerThan(size: DeviceSizeType) {
      return window.innerWidth > sizes[size];
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
          state({ offline: false, width: window.innerWidth, size: getDeviceSize(window.innerWidth), height: window.innerHeight });
        } else {
          document.body.classList.add("is-offline");
          window.offline = true;
          state({ offline: true, width: window.innerWidth, size: getDeviceSize(window.innerWidth), height: window.innerHeight });
        }
      };
      window.addEventListener("online", fireChange);
      window.addEventListener("offline", fireChange);
      window.addEventListener("resize", fireChange);
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

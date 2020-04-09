/**
 * Interact Store
 * This is used to fire off global interactions with the user.
 * Anything thing that requires the users input that is used across
 * multiple pages, containers or components.
 *
 * For example: Alerts, Confirms, Prompts, Location Lookup, Location Showing, Editing Trackers
 */

// Svelte
import { writable } from "svelte/store";
import { navigate } from "svelte-routing";

// vendors
import dayjs from "dayjs";
import md5 from "md5";

// utils
import Logger from "../utils/log/log";
import time from "../utils/time/time";

// modules
import NomieLog from "../modules/nomie-log/nomie-log";

// Stores
import { LedgerStore } from "../store/ledger";

const console = new Logger("✋ Interact");

const interactInit = () => {
  let getBaseState = () => {
    return {
      stats: {
        activeTag: null,
      },
      alert: {
        show: false,
        title: null,
        message: null,
        ok: "Ok",
        cancel: null,
        onInteract: null,
      },
      blocker: {
        show: false,
        message: null,
      },
      shareImage: {
        log: null,
        color: null,
      },
      boardSorter: {
        show: false,
      },
      people: {
        active: null,
      },
      trackerSelector: {
        show: false,
        multiple: false,
        onInteract: null,
      },
      selector: {
        show: false,
        multiple: false,
        onInteract: null,
        type: "tracker",
      },
      trackerEditor: {
        show: false,
        tracker: null,
        onInteract: null,
      },
      trackerInput: {
        show: false,
        tracker: null,
        onInteract: null,
        value: null,
        allowSave: true,
      },
      logEditor: {
        show: false,
        log: null,
        onInteract: null,
        tag: null,
        value: null,
      },
      toast: {
        show: false,
        message: null,
      },
      popmenu: {
        show: false,
        title: null,
        description: null,
        buttons: [],
      },
      locationFinder: {
        show: false,
        onInteract: null,
        location: null,
      },
      locationViewer: {
        show: false,
        locations: null,
      },
      prompt: {
        show: false,
        placeholder: null,
        message: null,
        title: null,
      },
      trackerInput: {
        show: false,
        tracker: null,
        onInteract: null,
      },
      camera: {
        show: false,
        onInteract: null,
      },
    };
  };

  let state = getBaseState();

  const { update, subscribe, set } = writable(state);

  const methods = {
    alert(title, message, ok) {
      return new Promise((resolve) => {
        update((s) => {
          s.alert.show = true;
          s.alert.title = title;
          s.alert.message = message;
          s.alert.cancel = null;
          s.alert.ok = ok || "Ok";
          s.alert.onInteract = resolve;
          return s;
        });
      });
    },
    blocker(message) {
      update((state) => {
        state.blocker.show = true;
        state.blocker.message = message;
        return state;
      });
    },
    stopBlocker() {
      update((state) => {
        state.blocker.show = false;
        state.blocker.message = null;
        return state;
      });
    },
    loading(message) {
      let cancel = () => {
        update((state) => {
          state.toast.show = false;
          state.toast.message = null;
          return state;
        });
      };
      update((state) => {
        state.toast.show = true;
        state.toast.message = message;
        return state;
      });
      return cancel;
    },
    vibrate(ms) {
      // ms = ms || 90;
      // if (navigator.vibrate) {
      //   navigator.vibrate(ms);
      // }
    },
    editTracker(tracker) {
      return new Promise((resolve, reject) => {
        update((s) => {
          s.trackerEditor.show = true;
          s.trackerEditor.tracker = tracker;
          s.trackerEditor.onInteract = (event) => {
            resolve(event.detail);
          };
          return s;
        });
      });
    },
    dismissEditTracker() {
      update((s) => {
        s.trackerEditor.show = false;
        s.trackerEditor.tracker = null;
        s.trackerEditor.onInteract = null;
        return s;
      });
    },
    async trackerInput(tracker, options = {}) {
      let value = options.value || null;
      let allowSave = options.allowSave === false ? false : true;
      return new Promise((resolve, reject) => {
        return update((s) => {
          s.trackerInput.show = true;
          s.trackerInput.tracker = tracker;
          s.trackerInput.allowSave = allowSave;
          s.trackerInput.value = value;
          s.trackerInput.onInteract = (tracker) => {
            resolve(tracker);
          };
          return s;
        });
      });
    },
    dismissTrackerInput() {
      update((d) => {
        d.trackerInput.show = false;
        d.trackerInput.tracker = null;
        d.trackerInput.onInteract = null;
        return d;
      });
    },
    openShareImage(log) {
      update((d) => {
        d.shareImage.log = log;
        return d;
      });
    },
    closeShareImage() {
      update((d) => {
        d.shareImage.color = null;
        d.shareImage.log = null;
        return d;
      });
    },
    openStats(tag, type = "tracker") {
      update((d) => {
        d.stats.activeTag = tag;
        d.stats.activeType = type;
        return d;
      });
    },
    person(username) {
      update((d) => {
        d.people.active = username;
        return d;
      });
    },
    closeStats() {
      update((d) => {
        d.stats.activeTag = null;
        return d;
      });
    },
    toggleBoardSorter() {
      update((s) => {
        s.boardSorter.show = !s.boardSorter.show;
        return s;
      });
    },
    openCamera(onSave) {
      update((s) => {
        s.camera.show = true;
        s.camera.onInteract = onSave;
        return s;
      });
    },
    closeCamera() {
      update((s) => {
        s.camera.show = false;
        s.camera.onInteract = null;
        return s;
      });
    },
    shareLog(log) {
      Interact.openShareImage(log);
    },

    select(type = "tracker") {
      return new Promise((resolve, reject) => {
        update((state) => {
          state.selector.multiple = false;
          state.selector.show = true;
          state.selector.type = type;
          state.selector.onInteract = (itemArray) => {
            resolve(itemArray.length ? itemArray[0] : null);
          };
          return state;
        });
      });
    },
    /**
     * Select a Single Tracker
     */
    selectTracker() {
      return new Promise((resolve, reject) => {
        update((s) => {
          s.trackerSelector.show = true;
          s.trackerSelector.multiple = false;
          s.trackerSelector.onInteract = (trackerArray) => {
            resolve(trackerArray.length ? trackerArray[0] : null);
          };
          return s;
        });
      });
    },
    /**
     * Select a Multiple Tracker
     */
    selectTrackers() {
      return new Promise((resolve, reject) => {
        update((s) => {
          s.trackerSelector.show = true;
          s.trackerSelector.multiple = true;
          s.trackerSelector.onInteract = (trackerArray) => {
            resolve(trackerArray);
          };
          return s;
        });
      });
    },
    dismissTrackerSelector() {
      update((s) => {
        s.trackerSelector.show = false;
        s.trackerSelector.multiple = false;
        s.trackerSelector.onInteract = null;
        return s;
      });
    },
    dismissSelector() {
      update((s) => {
        s.selector.show = false;
        s.selector.multiple = false;
        s.selector.onInteract = null;
        return s;
      });
    },
    async selectDate(date = new Date()) {
      let selectedDate = await Interact.prompt("Date / Time", null, {
        valueType: "datetime",
        value: dayjs(new Date(date)).format("YYYY-MM-DDTHH:mm"),
      });
      let localizedDate = time.datetimeLocal(selectedDate);
      return localizedDate.getTime();
    },
    editLog(log) {
      log = new NomieLog(log);
      log.expanded();
      return new Promise((resolve, reject) => {
        update((s) => {
          s.logEditor.show = true;
          s.logEditor.log = log;
          s.logEditor.onInteract = resolve;
          return s;
        });
      });
    },
    dismissEditLog() {
      update((s) => {
        s.logEditor.show = false;
        s.logEditor.log = null;
        s.logEditor.onInteract = null;
        return s;
      });
    },
    logOptions(log) {
      log = new NomieLog(log);
      if (!log.trackers) {
        log.expanded();
      }
      return new Promise((resolve, reject) => {
        let actions = {
          updateContent() {
            methods
              .prompt("Update Content", null, {
                value: log.note,
                valueType: "textarea",
              })
              .then((content) => {
                log.note = content;
                LedgerStore.updateLog(log).then((res) => {
                  resolve({ action: "updated" });
                });
              });
          },
          updateData() {
            Interact.editLog(log).then((log) => {
              setTimeout(() => {
                resolve({ action: "data-updated" });
              }, 10);
            });
          },
          editLog() {
            Interact.editLog(log).then((log) => {
              setTimeout(() => {
                resolve({ action: "data-updated" });
              }, 10);
            });
          },
          shareLog() {
            Interact.openShareImage(log);
          },

          updateDate() {
            Interact.prompt("New Date / Time", null, {
              valueType: "datetime",
              value: dayjs(new Date(log.end)).format("YYYY-MM-DDTHH:mm"),
            }).then((date) => {
              let localizedDate = time.datetimeLocal(date);
              log.start = localizedDate.getTime();
              log.end = localizedDate.getTime();
              setTimeout(() => {
                LedgerStore.updateLog(log).then((res) => {
                  resolve({ action: "date-updated" });
                });
              }, 10);
            });
          },
          updateLocation() {
            methods.pickLocation().then((location) => {
              if (location) {
                log.lat = location.lat;
                log.lng = location.lng;
                setTimeout(() => {
                  LedgerStore.updateLog(log).then((res) => {
                    resolve({ action: "updated" });
                  });
                }, 10);
              }
            });
          },
          async delete() {
            let confirmed = await methods.confirm("Are you sure?", "Deleting a log cannot be undone.");
            if (confirmed) {
              await LedgerStore.deleteLogs([log]);
              return { action: "deleted" };
            } else {
              return null;
            }
          },
        };
        // let initial = [
        // 	{
        // 		title: 'Note',
        // 		click: actions.updateContent,
        // 	},
        // 	{
        // 		title: 'Location',
        // 		click: actions.updateLocation,
        // 	},
        // 	{
        // 		title: 'Date & Time',
        // 		click: actions.updateDate,
        // 	},
        // ];

        // if (Object.keys(log.trackers).length) {
        // 	initial.push({
        // 		title: 'Tracker Data',
        // 		click: actions.updateData,
        // 	});
        // }

        let initial = [
          {
            title: "Share...",
            click: actions.shareLog,
          },
          {
            title: "Edit...",
            click: actions.editLog,
          },
          {
            title: "Delete...",
            click: actions.delete,
          },
        ];

        methods.popmenu({ title: "Log Options", buttons: initial });
      }); // end return promise
    },
    showLocations(locations) {
      update((s) => {
        s.locationViewer.locations = locations;
        s.locationViewer.show = true;
        return s;
      });
    },
    dismissLocations() {
      update((s) => {
        s.locationViewer.locations = null;
        s.locationViewer.show = false;
        return s;
      });
    },
    dismissToast() {
      update((s) => {
        s.toast.message = null;
        s.toast.show = false;
        return s;
      });
    },
    toast(message, perm) {
      perm = perm === true ? true : false;
      update((s) => {
        s.toast.message = message;
        s.toast.show = true;
        return s;
      });
      if (!perm) {
        setTimeout(() => {
          update((s) => {
            s.toast.message = null;
            s.toast.show = false;
            return s;
          });
        }, 1300);
      }
    },
    confirm(title, message, ok, cancel) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          update((s) => {
            s.alert.show = true;
            s.alert.title = title;
            s.alert.message = message;
            s.alert.cancel = null;
            s.alert.ok = ok || "Ok";
            s.alert.cancel = cancel || "Cancel";
            s.alert.onInteract = resolve;
            return s;
          });
        }, 1);
      });
    },
    reload() {
      // console.log("Going to reload the app");
      document.location.reload(true);
    },
    popmenu(options) {
      // console.log("Popmenu", options);
      setTimeout(() => {
        update((s) => {
          s.popmenu.show = true;
          s.popmenu.buttons = options.buttons;
          s.popmenu.title = options.title;
          s.popmenu.description = options.description;
          // console.log("Description", s.popmenu.description);
          return s;
        });
      }, 1);
    },
    pickLocation() {
      return new Promise((resolve, reject) => {
        update((s) => {
          s.locationFinder.show = true;
          s.locationFinder.onInteract = (event) => {
            resolve(event);
          };
          return s;
        });
      });
    },
    dismissPickLocation() {
      update((s) => {
        s.locationFinder.show = false;
        s.locationFinder.onInteract = null;
        return s;
      });
    },
    clearPrompt() {
      update((s) => {
        s.prompt.show = false;
        s.prompt.onInteract = null;
        return s;
      });
    },
    prompt(title, message, options = {}) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          update((s) => {
            s.prompt.show = true;
            s.prompt.message = message;
            s.prompt.title = title;
            s.prompt.value = options.value || null;
            s.prompt.valueType = options.valueType || "text";
            s.prompt.cancel = "Cancel";
            s.prompt.placeholder = options.placeholder || "";
            s.prompt.onInteract = (res) => {
              resolve(s.prompt.value);
            };
            return s;
          });
        }, 10);
      });
    },
    dismiss() {
      update((s) => {
        s.alert.show = false;
        s.popmenu.show = false;
        s.prompt.show = false;
        return s;
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

export const Interact = interactInit();

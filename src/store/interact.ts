/**
 * Interact Store
 * This is used to fire off global interactions with the user.
 * Anything thing that requires the users input that is used across
 * multiple pages, containers or components.
 *
 * For example: Alerts, Confirms, Prompts, Location Lookup, Location Showing, Editing Trackers
 *
 * Also - this thing has gotten completely out of control.
 * Going back, I don't think I'd do it this way again. Or at least
 * only for the general app interactions.. Not things like editing trackers
 * but maybe someday.
 *
 *
 */

// Todo make this more type complete

// Svelte
import { writable } from "svelte/store";
import { navigate } from "svelte-routing";
// vendors
import dayjs, { Dayjs } from "dayjs";

// utils
import Logger from "../utils/log/log";
import time from "../utils/time/time";

// modules
import NomieLog from "../modules/nomie-log/nomie-log";
import clipboard from "../utils/clipboard/clipboard";
// import Hooky from "../modules/hooks/hooks";
// const hooks = new Hooky();

// Stores
import { LedgerStore } from "./ledger";
import { TrackerStore } from "./tracker-store";
import { Lang } from "./lang";
import type { ILocation } from "../modules/locate/Location";
import type { ITrackerInputResult } from "../modules/tracker/tracker-inputer";
import TrackableElement from "../modules/trackable-element/trackable-element";
import TrackerInputer from "../modules/tracker/tracker-inputer";
import NPaths from "../paths";
import { SearchStore } from "./search-store";
import { SearchTerm } from "./search-store";
import { ActiveLogStore } from "./active-log";
import { init } from "i18next";
import type TrackerConfig from "../modules/tracker/tracker";
import type { ITrackers } from "../modules/import/import";
import Timer from "../utils/timer/timer";

const console = new Logger("✋ Interact");

export interface IToastOptions {
  timeout?: number;
  show?: boolean;
  description?: string;
  buttonLabel?: string;
  click?: Function;
  perm?: boolean;
}

export interface IPopMenuOptions {
  show?: boolean;
  buttons: Array<any>;
  title?: string;
  description?: string;
}

const interactInit = () => {
  const { update, subscribe, set } = writable({
    stats: {
      activeTag: null,
      terms: [],
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
    pin: {
      title: "Enter Pin",
      canClose: false,
      show: false,
      onPin: (v: string) => {},
    },
    streak: {
      show: null,
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
    onThisDay: null,
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
      detail: null,
      buttonLabel: undefined,
      click: undefined,
      description: undefined,
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
      placeholder: undefined,
      message: undefined,
      title: undefined,
      value: undefined,
      valueType: undefined,
      cancel: undefined,
      onInteract: undefined,
    },
  });

  const methods = {
    alert(title: string, message?: string, ok?: string) {
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

    onThisDay(date) {
      update((state) => {
        state.onThisDay = date;
        return state;
      });
    },
    closeOnThisDay() {
      update((state) => {
        state.onThisDay = null;
        return state;
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
    openStreak(term) {
      update((state) => {
        state.streak.show = term;
        return state;
      });
    },
    closeStreak(term) {
      update((state) => {
        state.streak.show = false;
        return state;
      });
    },
    loading(message) {
      let cancel = () => {
        update((state) => {
          state.toast.show = false;
          state.toast.message = null;
          state.toast.detail = null;
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
    /**
     * Tracker Input Action
     * This is an important Interaction - used to get values
     * from a specfic tracker
     * @param tracker
     * @param options
     */
    async trackerInput(tracker, options: any = {}): Promise<ITrackerInputResult> {
      let value = options.value || null;
      let allowSave = options.allowSave === false ? false : true;
      return new Promise((resolve, reject) => {
        return update((s) => {
          s.trackerInput.show = true;
          s.trackerInput.tracker = tracker;
          s.trackerInput.allowSave = allowSave;
          s.trackerInput.value = value;
          s.trackerInput.onInteract = (payload, action: string = "unknown") => {
            if (action !== "cancelled") {
              payload.action = action;
              resolve(payload);
            }
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
    openStats(term) {
      update((d) => {
        d.stats.terms = d.stats.terms || [];
        // if the term isn't the last one - then allow it.
        // otherwise don't - this will allow them to add it later in the stack
        if (d.stats.terms[d.stats.terms.length] !== term) {
          d.stats.terms.push(term);
        }
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
        d.stats.terms = [];
        return d;
      });
    },
    toggleBoardSorter() {
      update((s) => {
        s.boardSorter.show = !s.boardSorter.show;
        return s;
      });
    },
    shareLog(log) {
      Interact.openShareImage(log);
    },

    async trackerTap(tracker: TrackerConfig, trackers: ITrackers): Promise<any> {
      // let timer = new Timer("saving", true).start();
      // timer.check("Tracker Tap Complete");
      let inputer = new TrackerInputer(tracker, trackers);
      let note = await inputer.getElements();
      // timer.check(`Awaited inputer.getElements()`);
      if (note.length) {
        ActiveLogStore.addElement(note.join(" "));
        if (inputer.lastAction == "save" || tracker.one_tap) {
          // timer.check("🎟 Start the saving of note = call ledger save log");
          await LedgerStore.saveLog(ActiveLogStore.asLog());
          // timer.check("🎟 Save log is good. call ca");
          await ActiveLogStore.clear();
          // timer.check("🎟  Done waiting");
          return note;
        }
      }
      // timer.done();
      return note;
    },

    elementOptions(element: TrackableElement, callback?: Function) {
      let trackableElement = element instanceof TrackableElement ? element : new TrackableElement(element);
      let tracker = trackableElement.type == "tracker" ? TrackerStore.getByTag(trackableElement.id) : null;

      const buttons = [
        {
          title: `View stats`,
          click: () => {
            if (tracker) {
              Interact.openStats(`#${trackableElement.id}`);
            } else {
              Interact.openStats(trackableElement.raw);
            }
            if (callback) {
              callback();
            }
          },
        },
        {
          title: `Search for ${tracker ? tracker.label : trackableElement.raw}`,
          click: () => {
            SearchStore.search(trackableElement.prefix + trackableElement.id, "history");
          },
        },
      ];
      if (trackableElement.type == "person") {
        buttons.push({
          title: `Check-In`,
          click: () => {
            Interact.person(trackableElement.id);
            if (callback) {
              callback();
            }
          },
        });
      }
      methods.popmenu({
        title: `${tracker ? tracker.label : trackableElement.raw} options`,
        buttons: buttons,
      });
    },
    select(type = "tracker", multiple = false, options: any = {}) {
      return new Promise((resolve, reject) => {
        update((state) => {
          state.selector.multiple = multiple;
          state.selector.show = true;
          state.selector.type = type;
          state.selector.onInteract = (itemArray) => {
            if (options.filter) {
              itemArray = itemArray.filter(options.filter);
            }
            resolve(itemArray);
          };
          return state;
        });
      });
    },
    /**
     * Select a Single Tracker
     */
    async selectTracker() {
      return methods.select("tracker");
    },
    /**
     * Select a Multiple Tracker
     */
    selectTrackers(options: any = {}) {
      return methods.select("tracker", true, options);
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
    cancelPin() {
      setTimeout(() => {
        update((state) => {
          state.pin.show = false;
          state.pin.onPin = (v: string) => {};
          state.pin.canClose = false;
          state.pin.title = "Enter Pin";
          return state;
        });
      }, 200);
    },
    inputPin(title?: string, canClose: boolean = false): Promise<string> {
      return new Promise((resolve) => {
        update((state) => {
          state.pin.show = true;
          state.pin.title = title || state.pin.title;
          state.pin.canClose = canClose;
          state.pin.onPin = (value: string) => {
            resolve(value);
            methods.cancelPin();
          };
          return state;
        });
      });
    },
    async selectDate(starterDate: Date = new Date()) {
      let selectedDate: any = await Interact.prompt("Date / Time", null, {
        valueType: "datetime",
        value: starterDate,
      });
      return selectedDate.getTime();
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
    logOptions(log, options: any = {}) {
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
          async updateData() {
            const updatedLog = await Interact.editLog(log);
            setTimeout(() => {
              LedgerStore.hooks.run("onLogUpdate", updatedLog);
            }, 10);
            return { action: "data-updated" };
          },
          async editLog() {
            const updatedLog = await Interact.editLog(log);
            setTimeout(() => {
              LedgerStore.hooks.run("onLogUpdate", updatedLog);
            }, 10);
            return { action: "data-updated" };
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
            methods.pickLocation().then((location: ILocation) => {
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
            let confirmed = await methods.confirm("Delete this log?", "Are you sure? Deleting a log cannot be undone.");
            if (confirmed) {
              try {
                await LedgerStore.deleteLogs([log]);
                methods.toast(`Log deleted`);
              } catch (e) {
                methods.error(e.message);
              }
              return { action: "deleted" };
            } else {
              return null;
            }
          },
        };

        let initial = [
          {
            title: `${Lang.t("general.edit", "Edit")}...`,
            click: actions.editLog,
          },
          {
            title: `${Lang.t("general.on-this-day", "On this Day")}...`,
            click: () => {
              Interact.onThisDay(new Date(log.end));
            },
          },
          {
            title: `${Lang.t("general.copy-to-clipboard", "Copy to Clipboard")}...`,
            click: () => {
              clipboard(log.note);
              Interact.toast("📋  Note text copied");
            },
          },
          {
            title: `${Lang.t("general.share-as-image", "Share as Image")}...`,
            click: actions.shareLog,
          },
        ];
        if (!options.hideDelete) {
          initial.push({
            title: `${Lang.t("general.delete", "Delete")}...`,
            click: actions.delete,
          });
        }
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
        s.toast.description = null;
        return s;
      });
    },
    toast(message, options?: IToastOptions) {
      options = options || {};

      options.timeout = options.timeout || 1500;
      let perm = options.perm === true ? true : false;

      update((s) => {
        s.toast.message = message;
        s.toast.show = true;
        s.toast.description = options.description;
        if (options.buttonLabel && options.click) {
          s.toast.buttonLabel = options.buttonLabel;
          s.toast.click = options.click;
        }
        return s;
      });
      if (!perm) {
        setTimeout(() => {
          update((s) => {
            s.toast.message = null;
            s.toast.show = false;
            s.toast.buttonLabel = undefined;
            s.toast.description = undefined;
            s.toast.click = undefined;
            return s;
          });
        }, options.timeout);
      }
    },
    async error(message) {
      return methods.alert(Lang.t("general.error", "Error"), message);
    },
    confirm(title: string, message?: string, ok?: string, cancel?: string): Promise<boolean> {
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
      document.location.reload(true);
    },
    popmenu(options: IPopMenuOptions) {
      setTimeout(() => {
        update((s) => {
          s.popmenu.show = true;
          s.popmenu.buttons = options.buttons;
          s.popmenu.title = options.title;
          s.popmenu.description = options.description;
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
    prompt(title, message, options: any = {}) {
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

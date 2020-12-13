/**
 * The Ledger!
 *
 * This is the core module for storing Nomie Logs.
 * Ledgers store logs in a month file. /MM-YYYY.json for example
 * this might change in the future, as it makes it
 * easier to accidentally lose a month worth of data.
 *
 * TODO: Move a lot of this to modules that can be easily tested
 *
 */

// Modules

// Nomie log is the base Log item that is saved in a ledger
import logFilter from "../modules/log-filter/log-filter.js";
// Storage for generic access to local,blockstack,pouch
import Storage from "../modules/storage/storage";
// Hooks for firing off hooks
import Hooky from "../modules/hooks/hooks";
// Get the Geo Location module
// Utils
import Logger from "../utils/log/log";
import dayjs from "dayjs";
import { writable } from "svelte/store";
import tick from "../utils/tick/tick";
import textUtils from "../utils/text/text";

// Config
import config from "../config/appConfig";

// Stores
import { Interact } from "./interact";
import { LastUsed } from "./last-used";
import { PeopleStore } from "./people-store";
import { ContextStore } from "./context-store";
import { OfflineQueue } from "./offline-queue-store";
import { ActiveLogStore } from "./active-log";

import NPaths from "../paths";
import NLog from "../modules/nomie-log/nomie-log";

// Ledger specific
import LedgerTools from "./ledger/ledger-tools";
import { LedgerImporter } from "./ledger/ledger-importer";
import { logAppendLocationIfNeeded } from "./ledger/ledger-add-location";

import type { IQueryOptions } from "./ledger/ledger-tools";
import type { ITrackersSummary } from "./ledger/ledger-tools";
import type { ITracker, ITrackerMath } from "../modules/tracker/tracker.js";
import math from "../utils/math/math.js";
import NomieUOM from "../utils/nomie-uom/nomie-uom.js";

const console = new Logger("🧺 store/ledger.js", true);
// Hooky is for firing off generic events

export interface IToday {
  [key: string]: {
    hours: Array<number>;
    logs: Array<NLog>;
    tag: string;
    values: Array<number>;
  };
}

export type IBooks = Array<ILedgerBook>;
export type ILedgerBook = Array<NLog>;

export interface ILedgerState {
  books: IBooks;
  booksLastUpdate: any;
  today: IToday;
  count: number;
  saving: boolean;
  hash?: string;
  memories: Array<NLog>;
}

let ledgerTools: LedgerTools;

// initialize the Store
const ledgerInit = () => {
  /**
   * Set base object for store
   */
  let base = {
    books: {}, // holder of books - YYYY-MM
    booksLastUpdate: {},
    today: {}, // hold todays logs
    count: 0, //
    saving: false, // are we saving?
    hash: null, // hash for svelte auto reloading
    memories: [],
  };

  function state(s: any = {}) {
    let _state;
    update((state) => {
      _state = { ...state, ...s };
      return _state;
    });
    return _state;
  }

  const methods = {
    hooks: new Hooky(),
    async init() {
      ledgerTools = new LedgerTools(Storage);
      return true;
    },
    /**
     * Filter Logs by start and end dates
     * @param {Array} logs
     * @param {Object} filter
     */
    filterLogs(logs, filter) {
      return logFilter(logs, filter || {});
    },
    // Connect to hooks
    hook(type, func) {
      return methods.hooks.hook(type, func);
    },

    /**
     * getBook
     * Get a Book for a given unit-year (month-year)
     * It will save the book to the ledger so future requests
     *
     * @param {String} bookDateString
     */

    async getBook(dateString: string, allowUndefined: boolean = false): Promise<any> {
      return await ledgerTools.getBook(dateString, allowUndefined);
    },
    /**
     * Put a Book
     *
     * @param {String} bookDateString 2012-12-31
     * @param {Array} rows
     */
    async putBook(bookDateString: string, rows: ILedgerBook): Promise<any> {
      return await ledgerTools.saveBook(bookDateString, rows);
    },
    /**
     * Get the First Book
     * Returns the name of the first book
     * the user has. Good for figuring out
     * first track
     */
    async getFirstDate(fresh = false) {
      return ledgerTools.getFirstDate(fresh);
    },
    async listBooks() {
      return ledgerTools.listBooks();
    },
    getLastUsed() {
      return LastUsed;
    },
    extractTrackerTagAndValues(logs): ITrackersSummary {
      return ledgerTools.getTrackersAndValuesFromLogs(logs);
    },

    /**
     * Get Today
     * Returns today's book
     */
    async getToday() {
      let _state: ILedgerState = methods.getState();
      let todayKey = dayjs().format(config.book_time_format);
      if (_state.books[todayKey]) {
        _state = methods.todayReady(_state);
      } else {
        let book = await methods.getBook(todayKey);
        _state.books[todayKey] = book || [];
        _state.booksLastUpdate[todayKey] = await methods.getLastUpdate(todayKey);
        _state = methods.todayReady(_state);
      }
      update((state: any) => {
        return { ...state, ..._state };
      });
    },
    /**
     * todayReady
     * Update Today
     */
    todayReady(state: ILedgerState): ILedgerState {
      let start = dayjs().startOf("day"); // Get the start of the day
      let end = dayjs().endOf("day"); // Get end of day
      let todayKey = dayjs().format(config.book_time_format); // Get the book key for today
      // Get all logs for the key
      let allLogs = state.books[todayKey];
      // Extract just today's logs from the book
      let todaysLogs = methods.filterLogs(allLogs, {
        start: start.toDate(),
        end: end.toDate(),
      });

      // Extract Trackers
      let trackersUsed = ledgerTools.getTrackersAndValuesFromLogs(todaysLogs);
      // Setup data for update
      state.today = trackersUsed;
      state.hash = ledgerTools.hashTrackersSummary(trackersUsed);
      return state;
    },

    /**
     * Get the Users location if it's needed
     */
    async locateIfNeeded(log: NLog): Promise<NLog> {
      return await logAppendLocationIfNeeded(log);
    },
    /**
     * UpdateLog
     *
     * Updates a log - you must provide both the updated log, and the previous date it was saved on.
     *
     * @param {NLog} log
     * @param {Date} previousEndDate
     */
    async updateLog(log: NLog, previousEndDate?) {
      // Fire hooks
      methods.hooks.run("onBeforeUpdate", log);
      // Set saving
      update((bs) => {
        bs.saving = true;
        return bs;
      });

      // Add modified flag - in case we want to use it later
      log.modified = new Date().getTime();

      // Get Date for Book ID
      let bookDate = dayjs(new Date(log.end)).format(config.book_time_format);
      let previousBookDate = dayjs(new Date(previousEndDate)).format(config.book_time_format);
      let isSameBook = bookDate === previousBookDate;

      // Get books
      let book: ILedgerBook = await methods.getBook(bookDate);

      let previousBook; // incase we're moving a log from one book to another
      // Set empty foundIndex
      const foundIndex: number = book.findIndex((r) => r._id == log._id);
      // Did we find anything?
      if (foundIndex > -1) {
        // Update the row
        book[foundIndex] = log;
      } else {
        // We didn't find it in the first book - so it must be a different book
        book.push(log);
      }
      // Remove it from the prvious if we're in a different book
      if (!isSameBook) {
        previousBook = await methods.getBook(previousBookDate);
        previousBook = previousBook.filter((row) => {
          return row._id !== log._id;
        });
      }

      // Update base again
      update((bs) => {
        bs.saving = false;
        bs.books[bookDate] = book;
        if (!isSameBook) {
          bs.books[previousBookDate] = previousBook;
        }
        return bs;
      });

      let promises = [methods.putBook(bookDate, book)];
      if (!isSameBook) {
        promises.push(methods.putBook(previousBookDate, previousBook));
      }

      return Promise.all(promises).then((res) => {
        return res[0];
      });
    },
    /**
     * Prepare a log
     */
    async prepareLog(log) {
      log = await methods.locateIfNeeded(log);
      methods.hooks.run("onBeforeSave", log);
      log = ledgerTools.prepareLogForSave(log);
      return log;
    },
    /**
     * Get the Last Updataed File Path
     * Used to help make sure we don't overwrite any data
     * @param {String} date YYYY-MM
     */
    getLastUpdatePath(date) {
      return NPaths.storage.book(`${date}_last`);
    },
    /**
     * Get the Last Updataed Time for a book
     * Used to help make sure we don't overwrite any data
     * @param {String} date YYYY-MM
     */
    async getLastUpdate(date) {
      return await Storage.get(methods.getLastUpdatePath(date));
    },
    /**
     * Get a Book - with syncing
     * @param {String} date
     */

    async getBookWithSync(date: string) {
      try {
        // The sync part - get book first
        const book = await Storage.get(NPaths.storage.book(date));
        // If no book and on blockstack
        if (!book && Storage.storageType() == "blockstack") {
          // Its blockstack, let's how this is for a new week.
          Interact.toast(`Creating ${dayjs().format(config.book_time_format)} in Blockstack`);
          return [];
        } else if (!book) {
          // It's local - so we will assume they're creating a new book
          return [];
        } else {
          // Else just return the book already
          return book;
        }
      } catch (e) {
        // Interact.alert("Error", e);
        throw e;
      }
    }, // end update if out of sync

    async getLog(id, book) {
      let bookData = await Storage.get(NPaths.storage.book(book));
      let logRaw = bookData.find((row) => row._id == id);
      return logRaw ? new NLog(logRaw) : null;
    },

    async fastLog(note) {
      let log = new NLog({ note });
      return methods.saveLog(log);
    },

    /**
     * Save A Log!
     *
     * This is the main function to save a new log
     * It should not be used for updating
     * @param {NLog} log
     */
    async saveLog(log): Promise<void> {
      log = await methods.prepareLog(log);
      try {
        let saved = await this._saveLog(log);
        return saved;
      } catch (e) {
        console.error("error Saving log", e);
        /**
         * Check if Offline or GaiaHub Error
         */
        if (Storage.storageType() == "blockstack") {
          // Save this to the Offline Queue
          let saved = await OfflineQueue.record(log);
          if (saved) {
            Interact.toast("😐 Saving to blockstack failed", {
              description: `Log has been saved to the Offline Queue`,
              timeout: 3000,
            });
            ActiveLogStore.clear();
            update((state) => {
              state.saving = false;
              return state;
            });
            methods.hooks.run("onLogSaved", log);
          } else {
            throw new Error("save failed to queue");
          }
        } else {
          throw new Error("save failed");
        }
      }
    },
    /**
     * Real Save Log function - used only in saveLog method.
     * @param log
     * TODO make this dry enough to put in its own ledgerTools function
     */
    async _saveLog(log: NLog) {
      // Set up a holder for current state
      let currentState = state({
        saving: true,
      });

      try {
        // Set the date for the book
        let date = dayjs(new Date(log.end)).format(config.book_time_format);
        // Set Path
        let bookPath = NPaths.storage.book(date);
        // Get the Book - if its blockstack then make sure it exists
        let book = await methods.getBookWithSync(date);
        // Push the log
        book.push(log);
        // Save Book.
        await Storage.put(bookPath, book);
        // Set the current state book to this one
        currentState.books[date] = book;
        // Save Last Update to server
        let timeString = new Date().toJSON();
        // get the Last Updated
        let lastDatePath = methods.getLastUpdatePath(date);
        //await - removing to see if that speeds things up
        // Split this off, so it doesn't slow down the rest
        setTimeout(() => {
          // Put the last Used
          Storage.put(lastDatePath, timeString);
          // Add lastUpdated to state
          currentState.booksLastUpdate[date] = timeString;
          // Set the Last Used for Trackers in this log
          LastUsed.record(log);
          // Get Log Meta information - context and people references
          const meta = log.getMeta();
          // Save any new people to the People Store
          // Passing an Array of USERNAMES - people store should convert it to the right thing
          PeopleStore.saveFoundPeople(
            meta.people.map((peopleElement) => {
              return {
                username: peopleElement.id,
                last: log.end,
              };
            })
          );
          // Save any new Context to the Context Store
          ContextStore.save(meta.context);
        }, 1);

        // Update Store
        update((s) => {
          s.saving = false;
          s.books = currentState.books;
          return s;
        });

        /** Fire off Notifications and hooks Save */
        Interact.toast(`Saved ${textUtils.truncate(log.note, 100)}`); // show Alert
        // Fire off the onLogSaved
        methods.hooks.run("onLogSaved", log);
        tick(100, methods.getToday);
        // methods.getToday(); // Get Today
        return { log, date };
      } catch (e) {
        console.error("_saveLog error", e.message);
        throw new Error(e.message);
      }
    },

    /**
     * Delete an Array of Logs
     *
     * This will determine which books to use, and which rows to delete.
     * It will then save the books back to blockstack
     * @param {Array} logs
     */
    async deleteLogs(logs) {
      // Set up target books
      let targets = {};
      // Loop over the Logs
      logs.forEach((log) => {
        // Determin the book it's from by the date
        let book = dayjs(log.end).format(config.book_time_format);
        // Set book if not set
        targets[book] = targets[book] || [];
        // Push Log ID to book
        targets[book].push(log._id);
      });
      // Holder of Promises - kinda of like me as a dad - it's empty by default.
      let promises = [];
      // Loop over targe books
      update((_state) => {
        Object.keys(targets).forEach(async (date) => {
          // Use date to get the book
          let book = await methods.getBook(date);
          // Get LogIds to delete for this book.
          let logIds = targets[date];
          // Create a new book - by filtering logs that don't match the id.
          let newBook = book.filter((log) => {
            return logIds.indexOf(log._id) == -1;
          });
          // Update the store to use the new book
          // TODO: this doesn't seem to be trigger a change in History.svetle
          _state.books[date] = newBook;

          // Add to promise the saving of the book
          promises.push(methods.putBook(date, newBook));
        });

        return _state;
      });
      // Wait for all promises to be finished, then resolve
      let results = await Promise.all(promises);
      methods.hooks.run("onLogsDeleted", results);
      return results;
    },

    /***
     * Import Function
     */
    async import(rows: Array<NLog>, statusFunc: Function) {
      let importer = new LedgerImporter(Storage, rows, statusFunc, ledgerTools.getBook, ledgerTools.saveBook);
      return await importer.import();
    },
    // /**
    //  * Search for a Given term in a users nomie dataset
    //  * @param {String} term
    //  * @param {Number} year
    //  */
    // async search(term, year) {
    //   year = year || dayjs().format("YYYY");
    //   let start = dayjs().year(year).startOf("year").toDate();

    //   let end = dayjs(start).endOf("year").toDate();

    //   let rows = await methods.query({ start, end, search: term });
    //   return rows
    //     .filter((row) => {
    //       return JSON.stringify(row).toLowerCase().indexOf(term.toLowerCase()) > -1;
    //     })
    //     .sort((a, b) => {
    //       return a.end > b.end ? -1 : 1;
    //     });
    // },

    async queryPerson(username, start, end) {
      let logs = await methods.query({ start, end, search: `@${username}` });
      return logs.sort((a, b) => {
        return a.end < b.end ? 1 : -1;
      });
    },

    async queryAll(term, start, end) {
      let logs = await methods.query({ start, end, search: term });
      return logs.sort((a, b) => {
        return a.end < b.end ? 1 : -1;
      });
    },

    async queryTag(tag, start, end) {
      let logs = await methods.query({ start, end, search: `#${tag}` });
      return logs.sort((a, b) => {
        return a.end < b.end ? 1 : -1;
      });
    },

    async queryContext(context, start, end) {
      let logs = await methods.query({ start, end, search: `+${context}` });
      return logs.sort((a, b) => {
        return a.end < b.end ? 1 : -1;
      });
    },
    async getDay(date) {
      return methods.query({
        start: dayjs(date).startOf("day"),
        end: dayjs(date).endOf("day"),
      });
    },
    async getMemories() {
      let memories = await ledgerTools.getMemories(methods.getDay);
      update((state) => {
        state.memories = memories;
        return state;
      });
    },

    getState() {
      let state;
      update((s) => {
        state = s;
        return s;
      });
      return state;
    },

    /**
     * Main Ledger Query Function
     * This is used for almost everything that needs logs.. Stats, History, Today, etc.
     * @param {Object} options
     */
    async query(options: IQueryOptions) {
      let state = methods.getState();
      let ledgerResults = await ledgerTools.query(options, state.books);

      /**
       * If this is a fresh call (default)
       * then let's take the book results and
       * save them to the ledger for faster
       * lookups
       */
      if (options.fresh !== false) {
        update((state) => {
          state.books = { ...state.books, ...ledgerResults.books };
          return state;
        });
      }
      // return ledgerTools.query(options, state.books);
      return ledgerResults.logs;
    },
  };

  const { subscribe, set, update } = writable(base);

  return {
    methods,
    subscribe,
    ...methods,
    reset() {
      return set(base);
    },
  };
};

export const LedgerStore = ledgerInit();

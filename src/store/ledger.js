/**
 * The Ledger!
 *
 * This is the core module for storing Nomie Logs.
 * Ledgers store logs in a month file. /MM-YYYY.json for example
 * this might change in the future, as it makes it
 * easier to accidentally lose a month worth of data.
 *
 *
 */

// Modules

// Nomie log is the base Log item that is saved in a ledger
import NomieLog from "../modules/nomie-log/nomie-log";
// Storage for generic access to local,blockstack,pouch
import Storage from "../modules/storage/storage";
// Hooks for firing off hooks
import Hooky from "../modules/hooks/hooks";
// Get the Geo Location module
import locate from "../modules/locate/locate";

// Utils
import Logger from "../utils/log/log";
import dayjs from "dayjs";
import { writable } from "svelte/store";
import PromiseStep from "../utils/promise-step/promise-step";
import md5 from "md5";
import tick from "../utils/tick/tick";

// Config
import config from "../../config/global";

// Stores
import { Interact } from "./interact";
import { LastUsed } from "./last-used";
import { PeopleStore } from "./people-store";
import { ContextStore } from "./context-store";

const console = new Logger("🧺 store/ledger.js");
const hooks = new Hooky(); // Hooky is for firing off generic events

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
    hash: null // hash for svelte auto reloading
  };

  const methods = {
    /**
     * Filter Logs by start and end dates
     * @param {Array} logs
     * @param {Object} filter
     */
    filterLogs(logs, filter) {
      filter = filter || {};
      return logs.filter(log => {
        let pass = false;
        if (filter.start && filter.end) {
          pass = log.start >= filter.start && log.end <= filter.end;
        } else if (filter.start) {
          pass = log.start >= filter.start;
        } else if (filter.end) {
          pass = log.end <= filter.end;
        }
        return pass;
      });
    },
    // Connect to hooks
    hook(type, func) {
      hooks.hook(type, func);
      return this;
    },

    /**
     * getBook
     * Get a Book for a given month-year (2019-09)
     *
     * @param {String} bookDateString
     */
    async getBook(bookDateString) {
      // call any hooks
      hooks.run("onBeforeGetBook", bookDateString);
      // Get the book from storage
      let book = await Storage.get(`${config.book_root}/${bookDateString}`);
      // Return book with Nomie Logs
      return (book || [])
        .map(log => {
          return new NomieLog(log);
        })
        .filter(log => {
          // Remove invalid Logs
          return log.isValid();
        });
    },
    /**
     * Put a Book
     *
     * @param {String} bookDateString 2012-12-31
     * @param {Array} rows
     */
    async putBook(bookDateString, rows) {
      return Storage.put(`${config.data_root}/books/${bookDateString}`, rows);
    },
    /**
     * Get the First Book
     * Returns the name of the first book
     * the user has. Good for figuring out
     * first track
     */
    async firstBook() {
      const books = await methods.listBooks();
      if (books.length) {
        return books[0].replace(config.book_root + "/", "");
      } else {
        return "Unknown";
      }
    },
    /**
     * Filter Documents - Get the Books
     * this will only find documents with the data/v01/book prefix
     */
    listBooks() {
      return Storage.list().then(files => {
        return files.filter(f => {
          return f.search(`${config.book_root}/`) > -1;
        });
      });
    },
    getLastUsed() {
      return LastUsed;
    },
    extractTrackerTagAndValues(logs) {
      logs = logs || [];
      let trackers = {};
      logs.forEach(log => {
        if (!log.trackers) {
          log = new NomieLog(log);
          log.expanded();
        }
        Object.keys(log.trackers || {}).forEach(tag => {
          trackers[tag] = trackers[tag] || {
            values: [],
            tag: tag,
            hours: [],
            logs: []
          };
          // Push the value to values array
          trackers[tag].values.push(log.trackers[tag].value);
          // Add the Logs for Today - so we can calcuate the score
          if (trackers[tag].logs.indexOf(log) == -1) {
            trackers[tag].logs.push(log);
          }
          // Get and set hour for the tracker time ball
          let hour = parseInt(dayjs(log.end).format("H"));
          if (trackers[tag].hours.indexOf(hour) == -1) {
            trackers[tag].hours.push(hour);
          }
        });
      });
      return trackers;
    },

    /**
     * Create a hash for Today
     * This helps us monitor any changes on state.hash
     * @param {Object} today
     */
    hashTodayPayload(today) {
      let nodes = Object.keys(today).map(tag => {
        return `${tag}-${today[tag].values.join(",")}`;
      });
      return md5(nodes.join(","));
    },
    /**
     * Get Today
     * Returns today's book
     */
    async getToday() {
      let todayKey = dayjs().format(config.book_time_format);
      if (base.books[todayKey]) {
        return methods.todayReady();
      } else {
        let book = await methods.getBook(todayKey);
        base.books[todayKey] = book || [];
        base.booksLastUpdate[todayKey] = await methods.getLastUpdate(todayKey);
        return methods.todayReady();
      }
    },
    /**
     * Update Today
     */
    async todayReady() {
      let start = dayjs().startOf("day");
      let end = dayjs().endOf("day");
      let todayKey = dayjs().format(config.book_time_format);
      let allLogs = base.books[todayKey];
      // Extract just today's logs from the book
      let todaysLogs = methods.filterLogs(allLogs, {
        start: start.toDate(),
        end: end.toDate()
      });
      // Extract Trackers
      let trackersUsed = methods.extractTrackerTagAndValues(todaysLogs);
      // Setup data for update
      let data;
      update(d => {
        data = d;
        d.today = trackersUsed;
        d.hash = methods.hashTodayPayload(trackersUsed);
        return d;
      });
      return data;
    },
    /**
     * Get the Users location if it's needed
     */
    locateIfNeeded() {
      let shouldLocate = JSON.parse(localStorage.getItem(config.always_locate_key) || "false");

      return new Promise((resolve, reject) => {
        if (shouldLocate) {
          locate()
            .then(resolve)
            .catch(e => {
              console.error("Location e", e);
              Interact.alert(e.message);
              resolve(null);
            });
        } else {
          resolve(null);
        }
      });
    },
    /**
     * Update a Log
     *
     * This method will accept a single log, and save it to the correct book.
     * This is a heavy function with the get and put of the book, so only use it when needed
     */
    getIndex(array, func) {
      let index = undefined;
      array.forEach((item, i) => {
        if (func(item)) {
          index = i;
        }
      });
      return index;
    },
    /**
     * UpdateLog
     *
     * Updates a log - you must provide both the updated log, and the previous date it was saved on.
     *
     * @param {NomieLog} log
     * @param {Date} previousEndDate
     */
    async updateLog(log, previousEndDate) {
      // Fire hooks
      hooks.run("onBeforeUpdate", log);
      // Set saving
      update(bs => {
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
      let book = await methods.getBook(bookDate);
      let previousBook; // incase we're moving a log from one book to another

      // Set empty foundIndex
      let foundIndex = methods.getIndex(book, row => {
        return row._id == log._id;
      });

      // Did we find anything?
      if (typeof foundIndex === "number") {
        // Update the row
        book[foundIndex] = log;
      } else {
        // We didn't find it in the first book - so it must be a different book
        book.push(log);
      }
      // Remove it from the prvious if we're in a different book
      if (!isSameBook) {
        previousBook = await methods.getBook(previousBookDate);
        previousBook = previousBook.filter(row => {
          return row._id !== log._id;
        });
      }

      // Update base again
      update(bs => {
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

      return Promise.all(promises).then(res => {
        return res[0];
      });
    },
    /**
     * Prepare a log
     */
    async prepareLog(log) {
      // Make sure start and end are setup
      log.end = log.end || new Date().getTime();
      log.start = log.start || new Date().getTime();
      // If it's not a NomieLog - make it one.
      log = log instanceof NomieLog ? log : new NomieLog(log);
      // Log is being prepared to save - on Before Save
      hooks.run("onBeforeSave", log);
      // Clean the dirty dirty
      delete log._dirty;
      // Trim any white space from note
      log.note = log.note.trim();
      // Get location if it's needed
      let location = await methods.locateIfNeeded();
      // If we have a location add to log
      if (location && !log.lat) {
        // Add location Data
        log.lat = location.latitude;
        log.lng = location.longitude;
      }
      return log;
    },
    /**
     * Get the Last Updataed File Path
     * Used to help make sure we don't overwrite any data
     * @param {String} date YYYY-MM
     */
    getLastUpdatePath(date) {
      return `${config.data_root}/books/${date}_last`;
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

    async getBookWithSync(date) {
      const book = await Storage.get(`${config.data_root}/books/${date}`);
      // If no book and on blockstack
      if (!book && Storage.storageType() == "blockstack") {
        let bookMonth = dayjs(date).format("MMMM YYYY");
        let confirm = await Interact.confirm(
          `First Log of ${bookMonth}!`,
          `Logs are stored in monthly files, and a ${bookMonth} was not found. Would you like to create it?`
        );
        if (confirm) {
          // User confirms to create a new blank book - godspeed
          return [];
        } else {
          throw new Error("User stopped creation of book");
        }
      } else if (!book) {
        // It's local - so we will assume they're creating a new book
        return [];
      } else {
        // Else just return the book already
        return book;
      }
    }, // end update if out of sync

    async getLog(id, book) {
      let bookData = await Storage.get(`${config.data_root}/books/${book}`);
      let logRaw = bookData.find(row => row._id == id);
      return logRaw ? new NomieLog(logRaw) : null;
    },

    /**
     * Save A Log!
     *
     * This is the main function to save a new log
     * It should not be used for updating
     * @param {NomieLog} log
     */
    async saveLog(log) {
      // Set up a holder for current state
      let currentState;

      // extract current state
      update(s => {
        s.saving = true;
        currentState = s;
        return s;
      });

      // Set the time
      log = await methods.prepareLog(log);

      // Set the date for the book
      let date = dayjs(new Date(log.end)).format(config.book_time_format);

      // Set Path
      let bookPath = `${config.data_root}/books/${date}`; // path to book
      // Update if out of sync with Server

      try {
        // Get the Book - if its blockstack then make sure it exists
        let book = await methods.getBookWithSync(date);
        book.push(log); // push log
        // Save Book.
        await Storage.put(bookPath, book); // put the content
        currentState.books[date] = book; // update state
        // Save Last Update to server
        let timeString = new Date().toJSON();
        let lastDatePath = methods.getLastUpdatePath(date);
        //await - removing to see if that speeds things up
        // Split this off, so it doesn't slow down the rest
        setTimeout(() => {
          Storage.put(lastDatePath, timeString);
          currentState.booksLastUpdate[date] = timeString;
          // Set the Last Used for Trackers in this log
          LastUsed.record(log);
          // Get Log Meta information - context and people references
          const meta = log.getMeta();
          // Save any new people to the People Store
          PeopleStore.save(meta.people);
          // Save any new Context to the Context Store
          ContextStore.save(meta.context);
        }, 1);

        // Update Store
        update(s => {
          s.saving = false;
          s.books = currentState.books;
          return s;
        });

        /** Fire off Notifications and hooks Save */
        Interact.toast(`Saved ${log.note}`); // show Alert
        hooks.run("onLogSaved", log);
        await tick(120);
        methods.getToday(); // Get Today
        return { log, date };
      } catch (e) {
        Interact.alert("Error", e.message);
        update(s => {
          s.saving = false;
          return s;
        });
      } // end try catch
    },

    /**
     * Delete an Array of Logs
     *
     * This will determine which books to use, and which rows to delete.
     * It will then save the books back to blockstack
     * @param {Array} logs
     */
    async deleteLogs(logs) {
      return new Promise((resolve, reject) => {
        // Set up target books
        let targets = {};
        // Loop over the Logs
        logs.forEach(log => {
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
        Object.keys(targets).forEach(async date => {
          // Use date to get the book
          let book = await methods.getBook(date);
          // Get LogIds to delete for this book.
          let logIds = targets[date];
          // Create a new book - by filtering logs that don't match the id.
          let newBook = book.filter(log => {
            return logIds.indexOf(log._id) == -1;
          });
          // Update the store to use the new book
          // TODO: this doesn't seem to be trigger a change in History.svetle
          update(b => {
            b.books[date] = newBook;
            return b;
          });
          // Add to promise the saving of the book
          promises.push(methods.putBook(date, newBook));
        });
        // Wait for all promises to be finished, then resolve
        Promise.all(promises).then(resolve);
      });
    },
    import(rows, statusFunc) {
      statusFunc = statusFunc || function() {};
      return new Promise((resolve, reject) => {
        base.books = {};
        rows.forEach(rawLog => {
          let log = rawLog instanceof NomieLog ? rawLog : new NomieLog(rawLog);
          let bookKey = dayjs(new Date(log.end)).format(config.book_time_format);
          base.books[bookKey] = base.books[bookKey] || [];
          base.books[bookKey].push(log);
        });

        let bookDates = Object.keys(base.books).map(date => {
          return {
            date: date,
            records: base.books[date]
          };
        });

        PromiseStep(
          bookDates,
          row =>
            methods.putBook(row.date, row.records).then(() => {
              statusFunc({});
            }),
          statusFunc
        )
          .then(finished => {
            resolve(finished);
          })
          .catch(reject);
      });
    },
    /**
     * Import Nomie 3 Backup
     * This will take a nomie 3 backup file and import it to Nomie 4
     */
    import_3_old(payload) {
      return new Promise((resolve, reject) => {
        payload = payload || {};
        payload.nomie = payload.nomie || {};
        payload.nomie.number = payload.nomie.number || "";
        if (parseInt(payload.nomie.number.substr(0, 1)) >= 3) {
          base.books = {};
          payload.events.forEach(rawLog => {
            let log = new NomieLog(rawLog);
            let bookKey = dayjs(new Date(log.end)).format(config.book_time_format);
            base.books[bookKey] = base.books[bookKey] || [];
            base.books[bookKey].push(log);
          });

          let promises = [];
          Object.keys(base.books).forEach(date => {
            let rows = base.books[date];
            promises.push(methods.putBook(date, rows));
          });

          Promise.all(promises)
            .then(resolve)
            .catch(reject);
        } else {
          alert("Currently Nomie DAP only supports importing Nomie 3 data");
          reject({ message: "Only nomie 3 is supported" });
        }
      });
    },
    /**
     * Search for a Given term in a users nomie dataset
     * @param {String} term
     * @param {Number} year
     */
    search(term, year) {
      year = year || dayjs().format("YYYY");
      let start = dayjs()
        .year(year)
        .startOf("year")
        .toDate();

      let end = dayjs(start)
        .endOf("year")
        .toDate();

      return methods
        .query({
          start,
          end
        })
        .then(rows => {
          return rows
            .filter(row => {
              return (
                JSON.stringify(row)
                  .toLowerCase()
                  .indexOf(term.toLowerCase()) > -1
              );
            })
            .sort((a, b) => {
              return a.end > b.end ? -1 : 1;
            });
        });
    },
    /**
     * Main Ledger Query Function
     * @param {Object} options
     */
    async query(options) {
      options = options || {};
      options.fresh = options.fresh ? options.fresh : false;
      let startMonth = dayjs(options.start || new Date()).startOf("month");
      let endMonth = dayjs(options.end || new Date()).endOf("month");
      let diff = endMonth.diff(startMonth, "month");

      let books_to_get = [];

      // TODO: Make this use listBooks() array to only look for books that exist
      // this will kill the annoying 404 console

      if (diff === 0) {
        books_to_get.push(endMonth.format(config.book_time_format));
      } else {
        books_to_get.push(startMonth.format(config.book_time_format));
        for (let i = 0; i < diff; i++) {
          books_to_get.push(
            dayjs(startMonth)
              .add(i + 1, "month")
              .format(config.book_time_format)
          );
        }
      }

      let get_all = () => {
        let rows = [];
        let promises = [];

        books_to_get.forEach(date => {
          let bookGet = d => {
            return new Promise((resolve, reject) => {
              methods
                .getBook(d)
                .then(book => {
                  update(b => {
                    b.books[d] = book;
                    return b;
                  });
                  resolve(book || []);
                })
                .catch(e => {
                  resolve([]);
                });
            });
          };
          promises.push(bookGet(date));
        });

        return Promise.all(promises)
          .then(books => {
            books.forEach(book => {
              book.forEach(log => {
                rows.push(new NomieLog(log));
              });
            });
            return methods.filterLogs(rows, options);
          })
          .catch(e => {
            console.error("error", e.message);
          });
      };

      return get_all().then(rows => {
        return rows.sort((a, b) => (a.end > b.end ? 1 : -1));
      });
    }
  };

  const { subscribe, set, update } = writable(base);

  return {
    methods,
    subscribe,
    ...methods,
    reset() {
      return set(base);
    }
  };
};

export const LedgerStore = ledgerInit();

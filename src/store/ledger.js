// Modules
import NomieLog from "../modules/nomie-log/nomie-log";
import Storage from "../modules/storage/storage";
import Hooky from "../modules/hooks/hooks";
import locate from "../modules/locate/locate";

// Utils
import Logger from "../utils/log/log";
import dayjs from "dayjs";
import { writable } from "svelte/store";
import PromiseStep from "../utils/promise-step/promise-step";
import md5 from "md5";

// Config
import config from "../../config/global";

// Stores
import { UserStore } from "./user";
import { Interact } from "./interact";

const console = new Logger("🧺 store/ledger.js", true);
const hooks = new Hooky(); // Hooky is for firing off generic events

// Work on making things able to save in bulk
let savingQ = [];

/**
 * Ledger Store
 * The ledger store is responsible for storing and getting logs, as well as maintaining what's
 * happened today.
 */

let bulkSaving = []; // holder of logs to save - if the user gets all fast like
let isSavingBulk = false;

const ledgerInit = () => {
  /**
   * Set base object for store
   */
  let base = {
    books: {},
    today: {},
    count: 0,
    saving: false,
    hash: null
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
      hooks.run("onBeforeGetBook", bookDateString);
      return Storage.get(`${config.book_root}/${bookDateString}`).then(
        results => {
          return (results || []).map(log => {
            return new NomieLog(log);
          });
        }
      );
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
    firstBook() {
      return new Promise((resolve, reject) => {
        methods
          .listBooks()
          .then(books => {
            if (books.length) {
              resolve(books[0].replace(config.book_root + "/", ""));
            } else {
              resolve("Unknown");
            }
          })
          .catch(reject);
      });
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
            hours: []
          };
          trackers[tag].values.push(log.trackers[tag].value);
          let hour = parseInt(dayjs(log.end).format("H"));
          if (trackers[tag].hours.indexOf(hour) == -1) {
            trackers[tag].hours.push(hour);
          }
        });
      });
      return trackers;
    },
    hashTodayPayload(today) {
      let nodes = Object.keys(today).map(tag => {
        return `${tag}-${today[tag].values.join(",")}`;
      });
      return md5(nodes.join(","));
    },
    getToday() {
      return new Promise((resolve, reject) => {
        let todayKey = dayjs().format("YYYY-MM");
        // Set local function for setting today
        let loadToday = () => {
          let logs = methods.filterLogs(base.books[todayKey], {
            start: dayjs()
              .startOf("day")
              .toDate(),
            end: dayjs()
              .endOf("day")
              .toDate()
          });
          let trackersUsed = methods.extractTrackerTagAndValues(logs);
          let data;
          update(d => {
            data = d;
            d.today = trackersUsed;
            // Create a hash of this setting so we can watch for changes
            d.hash = methods.hashTodayPayload(trackersUsed);
            d.count++;
            return d;
          });
          resolve(data.today);
        }; // end today_only

        if (base.books[todayKey]) {
          // If today exists in the book - roll with it.
          // Aggressively sync each time we get today - regardless if it exists.
          loadToday();
        } else {
          // If it doesn't exist, get it from storage
          methods.getBook(todayKey).then(book => {
            base.books[todayKey] = book;
            loadToday();
          });
        }
      });
    },
    locateIfNeeded() {
      let shouldLocate = JSON.parse(
        localStorage.getItem(config.always_locate_key) || "false"
      );

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
      let previousBookDate = dayjs(new Date(previousEndDate)).format(
        config.book_time_format
      );
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
      log.end = log.end || new Date().getTime();
      log.start = log.start || new Date().getTime();
      log = log instanceof NomieLog ? log : new NomieLog(log);
      hooks.run("onBeforeSave", log);
      delete log._dirty;
      // Trim any white space from note
      log.note = log.note.trim();
      // Get location if it's needed
      let location = await methods.locateIfNeeded();
      // If we have a location add to log
      if (location && !log.lat) {
        log.lat = location.latitude;
        log.lng = location.longitude;
      }
      return log;
    },

    /**
     * Save A Log!
     *
     * This is the main function to save a new log
     * It should not be used for updating
     * @param {NomieLog} log
     */
    async saveLog(log) {
      let currentState;
      update(s => {
        s.saving = true;
        currentState = s;
        return s;
      });
      // Set the time
      log = await methods.prepareLog(log);
      // Set the date for the book
      let date = dayjs(new Date(log.end)).format("YYYY-MM");

      //Return Promise
      return new Promise(async (resolve, reject) => {
        // Update store to show it's saving

        /** Reusable Save */
        let doSave = async date => {
          let bookPath = `${config.data_root}/books/${date}`; // path to book
          await Storage.put(bookPath, currentState.books[date]); // put the content
          update(s => {
            s.saving = false;
            s.books = currentState.books;
            return s;
          });
          Interact.toast(`Saved ${log.note}`); // show Alert
          hooks.run("onLogSaved", log);
          setTimeout(() => {
            methods.getToday(); // Get Today
          }, 120);
          return { log, book: date };
        };

        /** UPDATE always agreesive sync */
        let book = await Storage.get(`${config.data_root}/books/${date}`);
        let cont = true;
        if ((book || []).length < currentState.books[date].length) {
          cont = confirm(
            `${date} storage has ${book.length} records. This is less than expected. Something might be wrong. Continue anyway?`
          );
        }
        // If we can continue
        if (cont) {
          currentState.books[date] = book || [];
          currentState.books[date].push(log);
          // Return promise of save
          doSave(date)
            .then(resolve)
            .catch(reject);
        } else {
          reject({
            message:
              "Data loaded from storage is at least 25% less than expected"
          });
        }

        /**
         * Does this Book exist? If not, we need to get it
         * Also, lets make sure they don't want agreesiveSync
         * If they do, then just always get the book
         */
        // if (
        //   currentState.books.hasOwnProperty(date) &&
        //   !UserStore.data().meta.aggressiveSync
        // ) {
        //   currentState.books[date].push(log);
        //   // Return a Promise of the save
        //   doSave(date)
        //     .then(resolve)
        //     .catch(reject);
        // } else {
        //   // Need to fetch this book...
        //   Storage.get(`${config.data_root}/books/${date}`).then(data => {
        //     currentState.books[date] = data || [];
        //     currentState.books[date].push(log);
        //     // Return promise of save
        //     doSave(date)
        //       .then(resolve)
        //       .catch(reject);
        //   });
        // }
      });
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
          let bookKey = dayjs(new Date(log.end)).format("YYYY-MM");
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

        // Object.keys(base.books).forEach(date => {
        // 	let rows = base.books[date];
        // 	promises.push(methods.putBook(date, rows));
        // });

        // Promise.all(promises)
        // 	.then(resolve)
        // 	.catch(reject);
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
            let bookKey = dayjs(new Date(log.end)).format("YYYY-MM");
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
                  .search(term.toLowerCase()) > -1
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
        books_to_get.push(endMonth.format("YYYY-MM"));
      } else {
        books_to_get.push(startMonth.format("YYYY-MM"));
        for (let i = 0; i < diff; i++) {
          books_to_get.push(
            dayjs(startMonth)
              .add(i + 1, "month")
              .format("YYYY-MM")
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

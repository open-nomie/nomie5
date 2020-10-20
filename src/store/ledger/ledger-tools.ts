import appConfig from "../../config/appConfig";

import NPaths from "../../paths";

import array_utils from "../../utils/array/array_utils";
import logFilter from "../../modules/log-filter/log-filter";
import nid from "../../modules/nid/nid";
import NLog from "../../modules/nomie-log/nomie-log";

import dayjs from "dayjs";

import type TrackableElement from "../../modules/trackable-element/trackable-element";
import type { Dayjs } from "dayjs";
import type { IStorage } from "../../modules/storage/storage";
import type { ILedgerBook, IBooks } from "../ledger";

import type { LedgerImporter } from "./ledger-importer";

export interface IQueryOptions {
  fresh?: boolean;
  start?: Dayjs;
  end?: Dayjs;
  search?: string;
  fuzzy?: boolean;
}

type IBook = Array<NLog>;

export interface ITrackersSummary {
  [tag: string]: {
    values: Array<any>;
    tag: string;
    hours: Array<any>;
    logs: Array<NLog>;
  };
}

export default class LedgerTools {
  storage: IStorage;
  importer: LedgerImporter;

  constructor(storage: any) {
    this.storage = storage;
  }

  public getDateOfWeek(w: number, y: number) {
    let d: number = 1 + (w - 1) * 7;
    return new Date(y, 0, d);
  }

  public async getBook(dateString: string, allowUndefined: boolean = false): Promise<IBook> {
    let bookRaw = await this.storage.get(NPaths.storage.book(dateString));
    let book = bookRaw instanceof Array ? bookRaw : [];
    if (allowUndefined && !bookRaw) {
      return undefined;
    } else {
      return book.map((_log) => new NLog(_log)).filter((l) => l.isValid());
    }
  }

  public async saveBook(dateString: string, rows: Array<NLog>) {
    if (rows instanceof Array) {
      return await this.storage.put(NPaths.storage.book(dateString), rows);
    } else {
      throw new Error(`invalid book content provided. save failed`);
    }
  }

  public prepareLogForSave(_log: any): NLog {
    // Create a pure log
    let log: any = new NLog(_log);
    log.end = log.end || new Date().getTime();
    log.start = log.start || log.end - 1000;
    log.note = log.note.trim();
    log.source = log.source || "n5";
    delete log._dirty;
    return log;
  }

  public hashTrackersSummary(obj: ITrackersSummary): string {
    let nodes = Object.keys(obj).map((tag) => {
      return `${tag}-${obj[tag].values.join(",")}`;
    });
    return nid(nodes.join(","));
  }

  public getTrackersAndValuesFromLogs(logs: Array<NLog>): ITrackersSummary {
    if (logs instanceof Array == false) {
      throw new Error("Logs must be an array");
    }
    let trackers: any = {};
    logs.forEach((log: NLog) => {
      log = log instanceof NLog ? log : new NLog(log);
      // Pro tip: Get meta if its not already present
      !log.trackers ? log.getMeta() : "";
      // Loop over the Trackers Found
      log.trackers.forEach((trackableElement: TrackableElement) => {
        let tag = trackableElement.id;
        // Add the Values base to the tracker[tag] of not already
        trackers[tag] = trackers[tag] || {
          values: [],
          tag: tag,
          hours: [],
          logs: [],
        };
        // Push the value to values array - make sure to convert to number
        let trackableElementValue = parseFloat(trackableElement.value);
        let v: any = isNaN(trackableElementValue) ? 1 : trackableElementValue;
        trackers[tag].values.push(v);
        // Add the Logs for Today - so we can calcuate the score
        if (trackers[tag].logs.indexOf(log) == -1) {
          trackers[tag].logs.push(log);
        }
        // Get and set hour for the tracker time ball
        let hour = parseInt(dayjs(log.end).format("H"));
        if (trackers[tag].hours.indexOf(hour) == -1) {
          trackers[tag].hours.push(hour);
        }
      }); // end looping over the logs trackers
    });
    return trackers;
  }

  /**
   * Get a list of all books in storage.
   */
  listBooks() {
    return this.storage.list().then((files) => {
      return files.filter((f) => {
        return f.search(`${appConfig.book_root}/`) > -1 && f.search(`_last`) === -1;
      });
    });
  }

  /**
   * Getting the users first date lookup
   * Since this can be on blockstack the lookup can take a while
   * we have to look at all of the files to find the first.
   * @param fresh
   */
  async getFirstDate(fresh: boolean = false): Promise<Dayjs> {
    // Let's get the cache if one exists
    let defaultPayload = { date: null, lastChecked: null };
    let bookDetails = this.storage.local.get(`firstBook`) || defaultPayload;
    // If the cache is older than 2 days - let's refresh
    let age = bookDetails.lastChecked ? Math.abs(dayjs(bookDetails.lastChecked).diff(dayjs(), "day")) : 100;
    if (age > 2 || fresh) {
      // Get list of books
      const books = await this.listBooks();
      if (books.length) {
        let parsedBooks = books
          .map((path: string) => {
            let split = path.split("/");
            if (split.length === 3) {
              // Get book path YYYY-w (fucking lower case w SUCKS! - but stuck with it in Nomie 5)
              let bookPath = split[split.length - 1];
              // Get year month from book
              let yearMonSplit = bookPath.split("-");
              let year = parseInt(yearMonSplit[0]);
              let week = parseInt(yearMonSplit[1]);
              if (!isNaN(year)) {
                week = isNaN(week) ? 1 : week;
                let d = this.getDateOfWeek(week, year);
                return dayjs(d);
              } else {
                return null;
              }
            } else {
              return null;
            }
          })
          .filter((d) => d)
          .sort((a: Dayjs, b: Dayjs) => {
            return a.unix() > b.unix() ? 1 : -1;
          });

        let date = parsedBooks[0];
        if (date) {
          this.storage.local.put("firstBook", {
            date: date.toDate().getTime(),
            lastChecked: new Date().getTime(),
          });
        }
        return date;
      } else {
        return dayjs();
      }
    } else {
      return dayjs(bookDetails.date);
    }
  }

  /**
   * Get Users Memeories
   * @param getDayLookup -
   */
  public async getMemories(getDayLookup: Function): Promise<Array<NLog>> {
    let times = [];
    let firstDate = await this.getFirstDate();
    let yearsDiff = dayjs().diff(firstDate, "year");

    if (yearsDiff > 1) {
      for (var y = 0; y < yearsDiff; y++) {
        if (y !== 0 && y < 6) {
          times.push(dayjs().subtract(y, "year"));
        }
      }
    } else if (dayjs().diff(firstDate, "month") > 5) {
      times.push(dayjs().subtract(6, "month"));
    }

    let lookupPromises = [];
    times
      .filter((time) => time)
      .forEach((time) => {
        lookupPromises.push(getDayLookup(time));
      });

    let years = await Promise.all(lookupPromises);
    let memories = [];
    years.forEach((day) => {
      day = day
        .filter((log) => {
          return log.getScrubbedNote().length;
        })
        .sort((a, b) => {
          return a.note.length < b.note.length ? 1 : -1;
        });

      if (day.length) {
        memories.push(day[0]);
      }
    });

    return memories;
  }

  /**
   * Nomie Core Record Query Function
   * @param options - IQueryOptions
   * @param existingBooks - pass any existing books to look for
   */
  async query(options: IQueryOptions, existingBooks: IBooks = []) {
    options = options || {};

    // Fresh? Should pull from storage not cache
    options.fresh = options.fresh === false ? false : true;

    // Set Start Time - default to 30 days agao
    if (options.start && (options.start instanceof Date || options.start instanceof Number)) {
      options.start = dayjs(options.start);
    } else if (!options.start) {
      options.start = dayjs().subtract(30, "day");
    }
    // Set End Time - default to today
    if (options.end && (options.end instanceof Date || options.end instanceof Number)) {
      options.end = dayjs(options.end);
    } else if (!options.end) {
      options.end = dayjs();
    }

    /**
     * Get all books to cover this search query time frame
     * logs could be stored across books so we will
     * get the books, then query the results
     */
    // Set official start and end time
    let startTime = options.start.startOf("day");
    let endTime = options.end.endOf("day");
    // Diff Betwen the two
    const bookFormat: any = appConfig.book_time_unit || "week";
    // How many different books do we need to get to cover this time span?
    let diff = endTime.diff(startTime, bookFormat);
    // Define array of "book paths" to get
    let booksToGet = [];
    // If there's no diff, no need get multiple books
    if (diff === 0) {
      // It's only one book, but for the sake of wonkey monday settings
      // lets get the book after it too
      let bookId = startTime.format(appConfig.book_time_format);
      booksToGet.push(bookId);
      booksToGet.push(startTime.add(1, bookFormat).format(appConfig.book_time_format));
    } else {
      // We need to get multiple books.
      booksToGet.push(startTime.format(appConfig.book_time_format));
      diff = diff + 2; // add two book for good measure
      for (let i = 0; i < diff; i++) {
        // Push each of the formated dates YYYY-w to an array
        let thisBookDateStr = dayjs(startTime).add(i, bookFormat);
        booksToGet.push(thisBookDateStr.format(appConfig.book_time_format));
      }
    }

    // Batch the Book Lookups
    // This wil make blockstack looksup much faster.
    const batch_all = async (): Promise<ILedgerBook> => {
      let rows = [];
      let maxPerBatch = 10;
      let chunks = array_utils.chunk(booksToGet, maxPerBatch);
      for (var i = 0; i < chunks.length; i++) {
        let books = await get_batch(chunks[i]);
        books.forEach((book) => {
          book.forEach((row) => {
            row = row instanceof NLog ? row : new NLog(row);
            // Remove duplicates
            if (!rows.find((r: NLog) => r._id == row._id)) {
              rows.push(row);
            }
          });
        });
      }
      return rows;
    };

    let stateBooks = { ...existingBooks };

    // Get a Specific Batch of Books
    const get_batch = async (booksChunk): Promise<Array<ILedgerBook>> => {
      let gets = [];
      // Loop over each book
      booksChunk.forEach((bookPath) => {
        // Get the book if it current exists, or create it if not
        stateBooks[bookPath] = stateBooks[bookPath] || [];

        /**
         * If the Options.fresh is TRUE (default)
         * it should get the book from the storage lookup first
         * otherwise, it should just look at the existing books
         * that were passed to the this query.
         *
         * If it's a fresh look up, the results will be sent back up to the ledger and stored
         * for future query lookups.
         */
        if (options.fresh !== false) {
          // Generate promise and stuff the results in stateBooks
          let getBook = this.getBook(bookPath);
          getBook.then((rows) => {
            stateBooks[bookPath] = rows;
          });
          // Push the promise
          gets.push(getBook);
        } else {
          // Push automatically what we have in memory
          gets.push(Promise.resolve(stateBooks[bookPath]));
        }
      });
      return Promise.all(gets);
    };

    /** Get all  */
    let get_all = async (): Promise<Array<NLog>> => {
      let rows = await batch_all();
      let filtered = logFilter(rows, options);
      return filtered;
    }; // end get_all()

    try {
      let rows: Array<NLog> = await get_all();
      return {
        books: stateBooks,
        logs: rows.sort((a, b) => (a.end < b.end ? 1 : -1)),
      };
    } catch (e) {
      console.error("Error caught ", e);
    }
  }
}

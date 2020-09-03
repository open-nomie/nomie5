import Storage, { IStorage } from "../../modules/storage/storage";
import NPaths from "../../paths";
import NLog from "../../modules/nomie-log/nomie-log";
import TrackableElement from "../../modules/trackable-element/trackable-element";
import dayjs from "dayjs";
import type { Dayjs } from "dayjs";
import nid from "../../modules/nid/nid";
import appConfig from "../../config/appConfig";

import { LedgerImporter } from "./ledger-importer";
import { ILedgerBook, IBooks } from "../ledger";
import array_utils from "../../utils/array/array_utils";
import logFilter from "../../modules/log-filter/log-filter";

export interface IQueryOptions {
  fresh?: boolean;
  start?: Dayjs;
  end?: Dayjs;
  search?: string;
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
      //(!log.trackers) ? log.getMeta() : '';
      log.getMeta().trackers;
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
        // Push the value to values array
        trackers[tag].values.push(trackableElement.value);
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
        return f.search(`${appConfig.book_root}/`) > -1;
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
        const firstBook = books[0].replace(appConfig.book_root + "/", "");

        let date = dayjs(firstBook, appConfig.book_time_format);
        // console.log({ autoDate: autoDate.format("YYYY MMM DD ddd") });

        // let bookYearWeekSplit = firstBook.split("-");
        // console.log({ bookYearWeekSplit });

        // let day = 1 + (bookYearWeekSplit[1] - 1) * 7; // 1st of January + 7 days for each week
        // console.log({ day });
        // let frankenDate = new Date(bookYearWeekSplit[0], 0, day);
        // console.log({ frankenDate });
        // // Create date from book name
        // let date = dayjs(frankenDate, appConfig.book_time_format);
        // Store it locally so we don't have to look it up all the time.
        this.storage.local.put("firstBook", {
          date: date.toDate().getTime(),
          lastChecked: new Date().getTime(),
        });
        return date;
      } else {
        return dayjs();
      }
    } else {
      return dayjs(bookDetails.date);
    }
  }

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

  async query(options: IQueryOptions, existingBooks?: IBooks) {
    options = options || {};
    // Fresh? Should pull from storage not cache
    options.fresh = options.fresh ? options.fresh : false;
    // Start
    let startTime = dayjs(options.start || new Date()).startOf("day");
    // End Time
    let endTime = dayjs(options.end || new Date()).endOf("day");
    // Diff Betwen the two
    const bookFormat: any = appConfig.book_time_unit || "week";
    // Diff
    let diff = endTime.diff(startTime, bookFormat);
    // Define array of "book paths" to get
    let books_to_get = [];

    // If there's no diff, no need get multiple books
    if (diff === 0) {
      books_to_get.push(endTime.format(appConfig.book_time_format));
    } else {
      // We need to get multiple books.
      books_to_get.push(startTime.format(appConfig.book_time_format));
      diff = diff + 1; // add one book for good measure
      for (let i = 0; i < diff; i++) {
        // Push each of the formated dates YYYY-w to an array
        books_to_get.push(
          dayjs(startTime)
            .add(i + 1, bookFormat)
            .format(appConfig.book_time_format)
        );
      }
    }

    // Batch the Book Lookups
    // This wil make blockstack looksup much faster.
    const batch_all = async (): Promise<ILedgerBook> => {
      let rows = [];
      let maxPerBatch = 10;
      let chunks = array_utils.chunk(books_to_get, maxPerBatch);
      for (var i = 0; i < chunks.length; i++) {
        let books = await get_batch(chunks[i]);
        books.forEach((book) => {
          book.forEach((row) => {
            row = row instanceof NLog ? row : new NLog(row);
            rows.push(row);
          });
        });
      }
      return rows;
    };

    let stateBooks = { ...existingBooks };

    // Get a Specific Batch of Books
    const get_batch = async (booksChunk): Promise<Array<ILedgerBook>> => {
      let gets = [];
      booksChunk.forEach((bookPath) => {
        stateBooks[bookPath] = stateBooks[bookPath] || [];
        if (stateBooks[bookPath].length == 0 || options.fresh === true) {
          let getBook = this.getBook(bookPath);
          getBook.then((rows) => {
            stateBooks[bookPath] = rows;
          });
          gets.push(getBook);
        } else {
          gets.push(Promise.resolve(stateBooks[bookPath]));
        }
      });
      return Promise.all(gets);
    };

    /** Get all  */
    let get_all = async (): Promise<Array<NLog>> => {
      let rows = await batch_all();
      return logFilter(rows, options);
    }; // end get_all()

    try {
      let rows: Array<NLog> = await get_all();
      return rows.sort((a, b) => (a.end < b.end ? 1 : -1));
    } catch (e) {
      console.error("Error caught ", e);
    }
  }
}

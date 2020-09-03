import Storage, { IStorage } from "../../modules/storage/storage";
import NLog from "../../modules/nomie-log/nomie-log";
import dayjs from "dayjs";
import appConfig from "../../config/appConfig";
import PromiseStep from "../../utils/promise-step/promise-step";
import Logger from "../../utils/log/log";
import math from "../../utils/math/math";

// const console = new Logger(":The Ledger importer", true);

export class LedgerImporter {
  storage: IStorage;
  status: Function;
  rows: Array<NLog>;
  putBook: Function;
  getBook: Function;

  constructor(storage: any, rows: Array<NLog>, statusCallback: Function, getBook: Function, putBook: Function) {
    this.storage = storage;
    this.rows = rows;
    this.status = statusCallback;
    this.putBook = putBook;
    this.getBook = getBook;
  }

  public async import() {
    // Set the callback / status function
    let statusFunc = this.status || function () {};
    let importBooks = {};

    this.rows.forEach((rawLog) => {
      let log = rawLog instanceof NLog ? rawLog : new NLog(rawLog);
      let bookKey = dayjs(new Date(log.end)).format(appConfig.book_time_format);
      delete log._dirty;
      importBooks[bookKey] = importBooks[bookKey] || [];
      importBooks[bookKey].push(log);
    });
    let bookDates = Object.keys(importBooks).map((date) => {
      return {
        date: date,
        records: importBooks[date],
      };
    });

    // Create to hold books while we loop over the results
    let existingBooks = {};

    // Step through each book Date,
    // Create or merge the rows
    // make sure to check for duplicates
    let duplicates: number = 0;
    // Loop over each Book
    for (let i = 0; i < bookDates.length; i++) {
      let row = bookDates[i];
      // Get Book Date
      let bookKey = row.date;
      // Define existing rows
      let existingRows: Array<NLog> = [];
      // Check if book is cashed already
      if (existingBooks[bookKey]) {
        existingRows = existingBooks[bookKey];
      } else {
        // if not cached, get the book from storage
        existingRows = await this.getBook(bookKey, true);
        existingRows = existingRows || [];
        // Assign book to book loopup
        existingBooks[bookKey] = existingRows;
      }
      // Define Duplicate Counter for this book
      // let duplicates = [];

      // Try and import the records for this book
      // Filter out logs that have a matching .hash() result
      row.records.forEach((log) => {
        // Does Existing Row have a log with the same has as the log provided?
        if (existingRows.findIndex((elog) => elog.hash() == log.hash()) == -1) {
          existingRows.push(log);
        } else {
          duplicates++;
        }
      });
      // Save the Book with the Merged Rows
      let saved = await this.putBook(row.date, existingRows);
      // Show console if duplicates were found

      // Update Status Function
      statusFunc({ importing: "logs", step: i, total: bookDates.length - 1, duplicates });
    } // end for loop

    if (duplicates) {
      console.log(`${duplicates} duplicates found`);
    }

    return existingBooks;
  }
}

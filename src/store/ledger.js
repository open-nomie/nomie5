// Modules
import NomieLog from '../modules/nomie-log/nomie-log';
import Storage from '../modules/storage/storage';

// Utils
import Logger from '../utils/log/log';
import dayjs from 'dayjs';
import { writable } from 'svelte/store';
import PromiseStep from '../utils/promise-step/promise-step';

// Config
import config from '../../config/global';

// Stores
import { UserStore } from './user';
import locate from '../modules/locate/locate';
import { Interact } from './interact';

const console = new Logger('🧺 store/ledger.js', true);

const ledgerInit = () => {
	let base = {
		books: {},
		today: {},
		count: 0,
		saving: false,
	};

	const methods = {
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
		async getBook(date) {
			return Storage.get(`${config.book_root}/${date}`).then(results => {
				return (results || []).map(log => {
					return new NomieLog(log);
				});
			});
		},
		firstBook() {
			return new Promise((resolve, reject) => {
				methods
					.listBooks()
					.then(books => {
						if (books.length) {
							resolve(books[0].replace(config.book_root + '/', ''));
						} else {
							resolve('Unknown');
						}
					})
					.catch(reject);
			});
		},
		listBooks() {
			return UserStore.listFiles().then(files => {
				return files.filter(f => {
					return f.search(`${config.book_root}/`) > -1;
				});
			});
		},
		async putBook(date, rows) {
			return Storage.put(`${config.data_root}/books/${date}`, rows);
		},
		findFirst() {
			let finished = [];
			let first = 2013;
			let lookups = () => {};
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
					};
					trackers[tag].values.push(log.trackers[tag].value);
				});
			});
			return trackers;
		},
		getToday() {
			return new Promise((resolve, reject) => {
				let todayKey = dayjs().format('YYYY-MM');
				// Set local function for setting today
				let setToday = () => {
					let logs = methods.filterLogs(base.books[todayKey], {
						start: dayjs()
							.startOf('day')
							.toDate(),
						end: dayjs()
							.endOf('day')
							.toDate(),
					});
					let trackersUsed = methods.extractTrackerTagAndValues(logs);
					update(b => {
						b.today = trackersUsed;
						b.count++;
						return b;
					});
					resolve(base.today);
				}; // end today_only

				// If today exists in the book - roll with it.
				if (base.books[todayKey]) {
					setToday();
				} else {
					// If it doesn't exist, get it from storage
					methods.getBook(todayKey).then(book => {
						base.books[todayKey] = book;
						setToday();
					});
				}
			});
		},
		locateIfNeeded() {
			let shouldLocate = JSON.parse(localStorage.getItem(config.always_locate_key) || 'false');

			return new Promise((resolve, reject) => {
				if (shouldLocate) {
					locate()
						.then(resolve)
						.catch(e => {
							console.error('Location e', e);
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
		async updateLog(log) {
			// Set saving
			update(bs => {
				bs.saving = true;
				return bs;
			});
			// Add modified flag - in case we want to use it later
			log.modified = new Date().getTime();
			// Get Date for Book ID
			let bookDate = dayjs(new Date(log.end)).format(config.book_time_format);
			// Get book
			let book = await methods.getBook(bookDate);
			// Set empty foundIndex
			let foundIndex;
			// Loop over books
			book.forEach((row, index) => {
				// If row id is the same as log id
				if (row._id == log._id) {
					foundIndex = index;
				}
			});
			// Did we find anything?
			if (foundIndex) {
				book[foundIndex] = log;
			}
			// Update base again
			update(bs => {
				bs.saving = false;
				bs.books[bookDate] = book;
				return bs;
			});
			return methods.putBook(bookDate, book);
		},
		/**
		 * Save A Log!
		 *
		 * This is the main function to save a new log
		 * It should not be used for updating
		 * @param {NomieLog} log
		 */
		async saveLog(log) {
			// Set the time
			log.end = log.end || new Date().getTime();
			log.start = log.start || new Date().getTime();

			return new Promise(async (resolve, reject) => {
				// Update store to show it's saving
				update(s => {
					s.saving = true;
					return s;
				});
				// Get Date for Book ID
				let date = dayjs(new Date(log.end)).format('YYYY-MM');
				// Adjust Log for Saving;
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
				// Setup local save method
				let doSave = date => {
					return new Promise((res, rej) => {
						let bookPath = `${config.data_root}/books/${date}`;
						Storage.put(bookPath, base.books[date]).then(() => {
							base = base;
							update(s => {
								s.saving = false;
								return s;
							});
							Interact.toast('Saved');
							methods.getToday();
							res({ log, book: date });
						});
					});
				};
				// Check to see if this book exists locally for this log
				if (base.books.hasOwnProperty(date)) {
					base.books[date].push(log);
					// Return a Promise of the save
					doSave(date)
						.then(resolve)
						.catch(reject);
				} else {
					// Need to fetch this book...
					Storage.get(`${config.data_root}/books/${date}`).then(data => {
						base.books[date] = data || [];
						base.books[date].push(log);
						// Return promise of save
						doSave(date)
							.then(resolve)
							.catch(reject);
					});
				}
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
					let bookKey = dayjs(new Date(log.end)).format('YYYY-MM');
					base.books[bookKey] = base.books[bookKey] || [];
					base.books[bookKey].push(log);
				});

				let bookDates = Object.keys(base.books).map(date => {
					return {
						date: date,
						records: base.books[date],
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
						console.log('Finished', finished);
						resolve();
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
				payload.nomie.number = payload.nomie.number || '';
				if (parseInt(payload.nomie.number.substr(0, 1)) >= 3) {
					base.books = {};
					payload.events.forEach(rawLog => {
						let log = new NomieLog(rawLog);
						let bookKey = dayjs(new Date(log.end)).format('YYYY-MM');
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
					alert('Currently Nomie DAP only supports importing Nomie 3 data');
					reject({ message: 'Only nomie 3 is supported' });
				}
			});
		},
		/**
		 * Search for a Given term in a users nomie dataset
		 * @param {String} term
		 * @param {Number} year
		 */
		search(term, year) {
			year = year || dayjs().format('YYYY');
			let start = dayjs()
				.year(year)
				.startOf('year')
				.toDate();

			let end = dayjs(start)
				.endOf('year')
				.toDate();

			return methods
				.query({
					start,
					end,
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
			let startMonth = dayjs(options.start || new Date()).startOf('month');
			let endMonth = dayjs(options.end || new Date()).endOf('month');
			let diff = endMonth.diff(startMonth, 'month');

			let books_to_get = [];

			// TODO: Make this use listBooks() array to only look for books that exist
			// this will kill the annoying 404 console

			if (diff === 0) {
				books_to_get.push(endMonth.format('YYYY-MM'));
			} else {
				books_to_get.push(startMonth.format('YYYY-MM'));
				for (let i = 0; i < diff; i++) {
					books_to_get.push(
						dayjs(startMonth)
							.add(i + 1, 'month')
							.format('YYYY-MM')
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
						console.error('error', e.message);
					});
			};

			return get_all().then(rows => {
				return rows.sort((a, b) => (a.end > b.end ? 1 : -1));
			});
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

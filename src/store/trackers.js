// Svelte
import { writable } from 'svelte/store';

// Modules
import Storage from '../modules/storage/storage';
import Tracker from '../modules/tracker/tracker';
import StarterPack from '../modules/packs/default-trackers';

// Config
import config from '../../config/global';

// Stores
import { Interact } from '../store/interact';
import { BoardStore } from '../store/boards';
import { TrackerLibrary } from '../store/tracker-library';

// Utils
import Logger from '../utils/log/log';

const console = new Logger('🌟 TrackerStore 🌟');

const startPackArray = Object.keys(StarterPack.trackers).map(key => {
	return StarterPack.trackers[key];
});
const trackerStoreInit = () => {
	const { update, subscribe, set, get } = writable({});
	const methods = {
		/**
		 * Initialization
		 *
		 * This takes place in the user store. Once the user is loaded, it will
		 * initialize trackers and the boards. Then fire off the user ready command
		 */
		initialize(UserStore) {
			return new Promise((resolve, reject) => {
				return Storage.get(`${config.data_root}/trackers.json`).then(trackers => {
					// If the user doesn't have trackers
					// Let's prompt them to install some
					if (!trackers) {
						TrackerLibrary.toggle({ first: true });
						// Interact.confirm(
						// 	`${StarterPack.label}`,
						// 	`Install Default Trackers: ${startPackArray.map(t => t.label).join(', ')}? `
						// ).then(res => {
						// 	if (res === true) {
						// 		methods.populate(StarterPack);
						// 	}
						// });
						resolve({});
						// Setup Default Trackers
					} else {
						update(t => {
							let cleanedTrackers = methods.scrub(trackers);
							resolve(cleanedTrackers);
							return cleanedTrackers;
						});
					}
				});
			});
		},
		getAll() {
			let data = {};
			update(state => {
				data = state;
				return state;
			});
			return data || {};
		},
		getById(id) {
			let trackers = methods.getAll();
			let tracker = Object.keys(trackers)
				.map(tag => trackers[tag])
				.find(tracker => {
					return tracker.id === id;
				});
			return new Tracker(tracker);
		},
		getRunning() {
			//TODO :: Get this working so you can see all timers on a single dynamic board
			let allTrackers = methods.getAll() || {};
			return [];
			// return Object.keys(allTrackers || {})
			// 	.map(tag => {
			// 		return allTrackers[tag];
			// 	})
			// 	.filter(tracker => {
			// 		return tracker.started || false;
			// 	});
		},
		// Clean up any messy trackers
		scrub(trackers) {
			Object.keys(trackers).forEach(key => {
				if (!trackers[key].tag) {
					delete trackers[key];
				} else {
					trackers[key] = new Tracker(trackers[key]);
				}
			});
			return trackers;
		},
		/**
		 * Get Active Store Data
		 */
		data() {
			let d = null;
			update(trks => {
				d = trks;
				return trks;
			});
			return d;
		},
		/**
		 * Get Trackers as Array
		 */
		getAsArray() {
			let all = this.getAll();
			return Object.keys(all)
				.map(tag => {
					return all[tag];
				})
				.sort((a, b) => {
					return a.label < b.label ? -1 : 1;
				});
		},
		// Get Tracker by Tag
		getByTag(tag) {
			let trackers = this.getAll();
			return trackers.hasOwnProperty(tag) ? trackers[tag] : new Tracker({ tag: tag });
		},

		tagExists(tag) {
			let trackers = this.getAll();
			return trackers.hasOwnProperty(tag) ? true : false;
		},

		/**
		 *  Populate Nomie with a starter Pack
		 *
		 * TODO: Move this to BoardStore
		 *
		 * This will take the default-trackers.js StarterPack and fill it in
		 * Automatically creating boards and adding trackers
		 */

		populate(pack) {
			return new Promise((resolve, reject) => {
				// Set a map to layout board trackers
				let boards = {};
				// Loop over each of the tracker object keys
				Object.keys(pack.trackers).forEach(tag => {
					// if the tracker has a board attribute
					if (pack.trackers[tag].board) {
						let boardName = pack.trackers[tag].board;
						boards[boardName] = boards[boardName] || [];
						boards[boardName].push(tag);
					}
				});
				// Holder of promises
				let promises = [];

				// Save trackers from pack
				methods.save(pack.trackers).then(() => {
					// Loop over the boards Map
					Object.keys(boards).forEach(boardName => {
						// Add the board to BoardStore
						promises.push(BoardStore.addBoard(boardName, boards[boardName]));
					});
				});
				// Wait for boards to be saved
				Promise.all(promises)
					.then(res => {
						// Reinitalize the board with the new trackers
						BoardStore.initialize(this.data());
						resolve(res);
					})
					.catch(reject);
			});
		},
		/**
		 * Save The Tracker Store
		 *
		 * Optionally provide an object of trackers.
		 * This will merge with existing.
		 */
		save(trackers) {
			if (trackers) {
				if (Object.keys(trackers || {}).length == 0) {
					if (confirm("You're about to save 0 trackers.. Should I continue? this might be a bug")) {
						return Storage.put(`${config.data_root}/trackers.json`, trackers);
					}
				} else {
					let merger;
					update(b => {
						merger = { ...b, ...trackers };
						Object.keys(merger).forEach(tag => {
							merger[tag] = new Tracker(merger[tag]);
						});
						return merger;
					});
					return Storage.put(`${config.data_root}/trackers.json`, merger);
				}
			} else {
				return new Promise((resolve, reject) => {
					update(b => {
						// Save
						methods
							.save(b)
							.then(resolve)
							.catch(reject);
						return b;
					});
				});
			}
		},
		deleteTracker(tracker) {
			let response;
			update(t => {
				t = t || {};
				delete t[tracker.tag];
				response = methods.save(t);
				return t;
			});
			return response;
		},
		saveTracker(tracker) {
			let response;
			let board = BoardStore.data();
			update(t => {
				t = t || {};
				t[tracker.tag] = tracker;
				response = methods.save(t);

				if (board.id !== 'all') {
					BoardStore.addTrackersToActiveBoard([tracker]);
				}

				return t;
			});
			return response;
		},
	};
	return {
		update,
		subscribe,
		set,
		...methods,
	};
};

export const TrackerStore = trackerStoreInit();

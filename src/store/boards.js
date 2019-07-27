import { writable } from 'svelte/store';

// Modules
import Storage from '../modules/storage/storage';

// Stores
import config from '../../config/global';

// Utils
import md5 from 'md5';
import Logger from '../utils/log/log';

//

const console = new Logger('♟ BoardStore ♟');

const boardsInit = () => {
	let trackers = {};

	let base = {
		active: localStorage.getItem('active-board') || 'all',
		boards: [],
		loaded: false,
		activeBoard: null,
	};

	const { subscribe, set, update } = writable(base);

	const methods = {
		initialize(tkrs) {
			trackers = tkrs;
			return Storage.get(`${config.data_root}/boards.json`).then(boards => {
				if (boards) {
					methods.load(boards);
				}
				return boards;
			});
		},
		load(boards) {
			return update(bs => {
				bs.boards = boards;
				bs.loaded = true;
				bs.activeBoard = bs.boards.find(b => b.id == bs.active);
				if (bs.activeBoard) {
					bs.activeBoard.trackers = (bs.activeBoard.trackers || []).filter(b => (b ? true : false));
				}

				return bs;
			});
		},
		save(boards) {
			return Storage.put(`${config.data_root}/boards.json`, boards);
		},
		labelById(id) {
			let label = (base.boards.find(b => b.id === id) || {}).label;
			return label ? label : '';
		},
		addTracker(tracker) {
			return methods.addTrackersToActiveBoard([tracker]);
		},
		data() {
			let d = null;
			update(bs => {
				d = bs;
				return d;
			});
			return d;
		},
		deleteBoard(boardId) {
			let boards;
			update(bs => {
				bs.boards = bs.boards.filter(board => {
					return board.id !== boardId;
				});
				boards = bs.boards;
				// TODO - this save method name is not right
				return bs;
			});
			return methods.save(boards).then(() => {
				return methods.setActive('all');
			});
		},
		removeTrackerFromBoard(tracker, boardId) {
			console.log(`Removing tracker ${tracker.tag} from ${boardId}`);
			let res;
			update(bs => {
				let board = methods.boardById(boardId);
				if (board) {
					board.trackers = board.trackers.filter(tag => {
						return tag !== tracker.tag;
					});
					res = methods.save(bs.boards);
				}
				return bs;
			});
			return res;
		},
		addTrackersToActiveBoard(trackerArray) {
			return methods.addTrackersToBoard(trackerArray, base.active);
		},
		get(id) {
			return methods.boardById(id);
		},
		activeBoardContains(tracker) {
			let contains = false;
			tracker = tracker.tag || tracker; // if it's an object use the tag, otherwise assume it's a string
			update(d => {
				contains = d.activeBoard.indexOf(tracker) > -1;
				return d;
			});
			return contains;
		},
		saveBoard(board) {
			return new Promise(resolve => {
				update(bs => {
					let foundIndex;
					bs.boards.forEach((brd, index) => {
						if (brd.id === board.id && board.id !== null) {
							foundIndex = index;
						}
					});
					if (!foundIndex) {
						if (!board.id) {
							alert('No board id present in saved board');
						} else {
							bs.boards.push(board);
						}
					} else {
						bs.boards[foundIndex] = board;
					}
					methods.save(bs.boards).then(resolve);
					return bs;
				});
			});
		},
		boardById(id) {
			return base.boards.find(b => {
				return b.id == id;
			});
		},
		labelById(id) {
			return (methods.boardById(id) || {}).label;
		},
		activeLabel() {
			return (methods.boardById(base.active) || {}).label;
		},
		sortActiveTrackers(tagsArray) {
			update(bs => {
				let board = methods.boardById(bs.activeBoard.id);
				board.trackers = tagsArray;
				methods.save(bs.boards);
				return bs;
			});
		},
		addTrackersToBoard(trackerArray, boardId) {
			update(bs => {
				// Find the board by id.
				let board = methods.boardById(boardId);
				// if it's found
				if (board) {
					// loop over trackers to push
					// TODO: tried to make this a spread - but I keep breaking it.
					trackerArray
						.filter(t => {
							return t ? true : false;
						})
						.forEach(tkr => {
							if (board.trackers.indexOf(tkr.tag) === -1) {
								board.trackers.push(tkr.tag);
							}
						});

					methods.save(bs.boards);
				}

				return bs;
			});
		},
		addBoard(label, trackers) {
			trackers = trackers || [];
			return new Promise((resolve, reject) => {
				let id = md5(new Date().getTime() + label).substr(0, 10);
				update(bs => {
					bs.boards.push({
						id: id,
						label: label,
						trackers: trackers,
					});
					Storage.put(`${config.data_root}/boards.json`, bs.boards)
						.then(resolve)
						.catch(reject);
					return bs;
				});
			});
		},
		setActive(id) {
			localStorage.setItem('active-board', id);
			return update(bs => {
				bs.active = id;
				bs.activeBoard = bs.boards.find(b => b.id == bs.active);
				return bs;
			});
		},
		getActiveTrackerTags() {
			let trackers = [];
			let data = methods.data();

			if (data.active == 'all') {
				trackers = Object.keys(trackers || {});
			} else {
				let b = data.boards.find(board => board.id === data.active);
				if (b) {
					trackers = b.trackers;
				} else {
					return [];
				}
			}
			return trackers;
		},
		reset() {
			return set(base);
		},
	};

	return {
		subscribe,
		update,
		set,
		...methods,
	};
};

export const BoardStore = boardsInit();

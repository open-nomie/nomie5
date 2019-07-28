/**
 * User Store
 *
 * TODO: Look at push notifications in the browser
 */

// Utils
import Logger from '../utils/log/log';
import { writable } from 'svelte/store';

// vendors
import localforage from 'localforage';

// Modules
import Storage from '../modules/storage/storage';
import locate from '../modules/locate/locate';

// Stores
import { TrackerStore } from './trackers';
import { BoardStore } from './boards';

import config from '../../config/global';

// Consts
const console = new Logger('🤠 userStore');
const UserSession = new blockstack.UserSession();

// Store Initlization
const userInit = () => {
	let listeners = [];
	// User State
	let state = {
		storageType: Storage.local.get('root/storage_type') || 'blockstack',
		ready: false,
		signedIn: undefined,
		profile: {
			username: null,
		},
		alwaysLocate: JSON.parse(localStorage.getItem(config.always_locate_key) || 'false'),
		darkMode: JSON.parse(localStorage.getItem(config.dark_mode_key) || 'false'),
		location: null,
		meta: {
			lock: false,
			pin: null,
		},
		locked: true,
	};

	const { subscribe, set, update } = writable(state);

	const methods = {
		getStorageEngine() {
			return Storage.local.get('root/storage_type') || 'blockstack';
		},
		initialize() {
			// Set Dark or Light Mode
			if (state.darkMode) {
				document.body.classList.add('dark');
			} else {
				document.body.classList.remove('dark');
			}
			// Is blockstack user pending?
			if (UserSession.isSignInPending()) {
				UserSession.handlePendingSignIn().then(userData => {
					// redirect user to home - to avoid having the
					// blockstack authkey hanging around.
					window.location.href = '/';
				});
			} else if (UserSession.isUserSignedIn() || methods.getStorageEngine() === 'local') {
				// Signed In - let's get the user Ready
				if (methods.getStorageEngine() === 'local') {
					methods.setProfile({ username: 'Local' });
				} else if (methods.getStorageEngine() === 'blockstack') {
					methods.setProfile(UserSession.loadUserData());
				}
			} else {
				update(u => {
					u.ready = true;
					u.signedIn = false;
					return u;
				});
			}
			// set highlevel initialize marker

			// TODO: Add 10 minute interval to check for day change - if change, fire a new user.ready
		},
		setStorage(type) {
			update(p => {
				p.storageType = type === 'local' ? 'local' : 'blockstack';
				Storage.local.put('root/storage_type', type === 'local' ? 'local' : 'blockstack');
				return p;
			});
		},
		/**
		 * Set Profile and Signin
		 */
		setProfile(profile) {
			// Fire off the remaining bootstrap items.
			methods.bootstrap().then(() => {
				update(p => {
					p.ready = true;
					p.profile = profile;
					p.signedIn = true;
					return p;
				});
			});
			// Update store with new profile.
		},
		bootstrap() {
			// First lets get the TrackerStore loaded
			let promises = [];
			promises.push(methods.loadMeta());
			promises.push(methods.loadTrackersAndBoards());
			return Promise.all(promises)
				.then(() => {
					return methods.fireReady(state);
				})
				.catch(e => {
					console.error(e);
				});
		},
		loadTrackersAndBoards() {
			return TrackerStore.initialize().then(trackers => {
				// Now lets load the BoardStore and pass these trackers
				return BoardStore.initialize(trackers).then(() => {
					// Now let's fire off that we're ready
					if (state.alwaysLocate) {
						locate();
					}
					return { trackers };
				});
			});
		},
		reset() {
			update(u => state);
		},
		redirectToSignIn() {
			UserSession.redirectToSignIn();
		},
		setAlwaysLocate(bool) {
			localStorage.setItem(config.always_locate_key, JSON.stringify(bool));
			update(u => {
				u.alwaysLocate = bool;
				return u;
			});
		},
		unlock() {
			update(usr => {
				usr.locked = false;
				return usr;
			});
		},
		/**
		 * Meta Data
		 * Meta is unclassified data that is needed to make the app work
		 * it's usually just user preferences but  can be used for other things
		 *
		 */

		/**
		 * Load Meta for this user
		 */
		loadMeta() {
			return Storage.get(config.user_meta_path).then(value => {
				if (value) {
					update(usr => {
						usr.meta = value;
						return usr;
					});
				}
				return value;
			});
		},
		/**
		 * Save the Meta object for this user
		 */
		saveMeta() {
			let usr = this.data();
			if (Object.keys(usr.meta).length) {
				return Storage.put(config.user_meta_path, usr.meta);
			}
		},
		// Get the current state
		data() {
			let d;
			update(usr => {
				d = usr;
				return usr;
			});
			return d;
		},
		// Set Dark Mode for User
		setDarkMode(bool) {
			localStorage.setItem(config.dark_mode_key, JSON.stringify(bool));
			if (bool) {
				document.body.classList.add('dark');
			} else {
				document.body.classList.remove('dark');
			}
			update(u => {
				u.darkMode = bool;
				return u;
			});
		},

		// Pass the Session
		session() {
			return UserSession;
		},
		// On Ready Event
		onReady(func) {
			if (this.ready === true) {
				func(state);
			} else {
				listeners.push(func);
			}
		},
		// Fire when Ready!
		fireReady(payload) {
			update(b => {
				b.ready = true;
				return b;
			});
			listeners.forEach(func => {
				func(payload);
			});
			listeners = [];
		},
		/**
		 * ListFiles()
		 * LIst all files for this user
		 */
		listFiles() {
			return new Promise((resolve, reject) => {
				let files = [];
				if (Storage.local.get('root/storage_type') === 'blockstack') {
					blockstack
						.listFiles(file => {
							if (files.indexOf(file) == -1) {
								files.push(file);
							}
							return true;
						})
						.then(() => {
							resolve(files);
						});
				} else if (Storage.local.get('root/storage_type') === 'local') {
					localforage.keys().then(keys => {
						files = keys;
						resolve(files);
					});
				}
			});
		},
	};

	return {
		subscribe,
		set,
		update,
		...methods,
		boards: BoardStore,
		trackers: TrackerStore,
	};
};

export const UserStore = userInit();

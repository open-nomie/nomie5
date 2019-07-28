/**
 * Interact Store
 * This is used to fire off global interactions with the user.
 * Anything thing that requires the users input that is used across
 * multiple pages, containers or components.
 *
 * For example: Alerts, Confirms, Prompts, Location Lookup, Location Showing, Editing Trackers
 */

import { writable } from 'svelte/store';

// vendors
import dayjs from 'dayjs';

// utils
import Logger from '../utils/log/log';

// modules
import NomieLog from '../modules/nomie-log/nomie-log';

// Stores
import { LedgerStore } from '../store/ledger';

const console = new Logger('✋ Interact');

const interactInit = () => {
	let getBaseState = () => {
		return {
			alert: {
				show: false,
				title: null,
				message: null,
				ok: 'Ok',
				cancel: null,
				onInteract: null,
			},
			trackerSelector: {
				show: false,
				multiple: false,
				onInteract: null,
			},
			trackerEditor: {
				show: false,
				tracker: null,
				onInteract: null,
			},
			trackerInput: {
				show: false,
				tracker: null,
				onInteract: null,
			},
			logDataEditor: {
				show: false,
				log: null,
				onInteract: null,
				tag: null,
				value: null,
			},
			toast: {
				show: false,
				message: null,
			},
			popmenu: {
				show: false,
				title: null,
				buttons: [],
			},
			locationFinder: {
				show: false,
				onInteract: null,
				location: null,
			},
			locationViewer: {
				show: false,
				locations: null,
			},
			prompt: {
				show: false,
				placeholder: null,
				message: null,
			},
			trackerInput: {
				show: false,
				tracker: null,
				onInteract: null,
			},
		};
	};

	let state = getBaseState();

	const { update, subscribe, set } = writable(state);

	const methods = {
		alert(title, message, ok) {
			return new Promise(resolve => {
				update(s => {
					s.alert.show = true;
					s.alert.title = title;
					s.alert.message = message;
					s.alert.cancel = null;
					s.alert.ok = ok || 'Ok';
					s.alert.onInteract = resolve;
					return s;
				});
			});
		},
		editTracker(tracker) {
			return new Promise((resolve, reject) => {
				update(s => {
					s.trackerEditor.show = true;
					s.trackerEditor.tracker = tracker;
					s.trackerEditor.onInteract = event => {
						resolve(event.detail);
					};
					return s;
				});
			});
		},
		dismissEditTracker() {
			update(s => {
				s.trackerEditor.show = false;
				s.trackerEditor.tracker = null;
				s.trackerEditor.onInteract = null;
				return s;
			});
		},
		trackerInput(tracker) {
			return new Promise((resolve, reject) => {
				update(s => {
					s.trackerInput.show = true;
					s.trackerInput.tracker = tracker;
					s.trackerInput.onInteract = tracker => {
						resolve(tracker);
					};
					return s;
				});
			});
		},
		dismissTrackerInput() {
			console.log('Dismissing Tracker INput');
			update(s => {
				s.trackerInput.show = false;
				s.trackerInput.tracker = null;
				s.trackerInput.onInteract = null;
				return s;
			});
		},
		/**
		 * Select a Single Tracker
		 */
		selectTracker() {
			return new Promise((resolve, reject) => {
				update(s => {
					s.trackerSelector.show = true;
					s.trackerSelector.multiple = false;
					s.trackerSelector.onInteract = trackerArray => {
						resolve(trackerArray.length ? trackerArray[0] : null);
					};
					return s;
				});
			});
		},
		/**
		 * Select a Multiple Tracker
		 */
		selectTrackers() {
			return new Promise((resolve, reject) => {
				update(s => {
					s.trackerSelector.show = true;
					s.trackerSelector.multiple = true;
					s.trackerSelector.onInteract = trackerArray => {
						resolve(trackerArray);
					};
					return s;
				});
			});
		},
		dismissTrackerSelector() {
			update(s => {
				s.trackerSelector.show = false;
				s.trackerSelector.multiple = false;
				s.trackerSelector.onInteract = null;
				return s;
			});
		},
		editLogData(log) {
			log = new NomieLog(log);
			log.expanded();
			return new Promise((resolve, reject) => {
				update(s => {
					s.logDataEditor.show = true;
					s.logDataEditor.log = log;
					s.logDataEditor.onInteract = resolve;
					return s;
				});
			});
		},
		dismissEditLogData() {
			update(s => {
				s.logDataEditor.show = false;
				s.logDataEditor.log = null;
				s.logDataEditor.onInteract = null;
				return s;
			});
		},
		logOptions(log) {
			log = new NomieLog(log);
			if (!log.trackers) {
				log.expanded();
			}
			return new Promise((resolve, reject) => {
				let actions = {
					updateContent() {
						methods.prompt('Update Content', { value: log.note, valueType: 'textarea' }).then(content => {
							log.note = content;
							LedgerStore.updateLog(log).then(res => {
								resolve({ action: 'updated' });
							});
						});
					},
					updateData() {
						Interact.editLogData(log).then(log => {
							console.log('Edit Log data - RESOLVING', log);
							setTimeout(() => {
								resolve({ action: 'data-updated' });
							}, 10);
						});
					},
					updateDate() {
						Interact.prompt('New Date', {
							valueType: 'datetime',
							value: dayjs(new Date(log.end)).format('YYYY-MM-DDTHH:mm'),
						}).then(date => {
							console.log('Edit Log data - RESOLVING', log);
							log.start = new Date(date).getTime();
							log.end = new Date(date).getTime();
							setTimeout(() => {
								LedgerStore.updateLog(log).then(res => {
									resolve({ action: 'date-updated' });
								});
							}, 10);
						});
					},
					updateLocation() {
						methods.pickLocation().then(location => {
							if (location) {
								log.lat = location.lat;
								log.lng = location.lng;
								setTimeout(() => {
									LedgerStore.updateLog(log).then(res => {
										resolve({ action: 'updated' });
									});
								}, 10);
							}
						});
					},
					delete() {
						setTimeout(() => {
							methods
								.confirm('Are you sure?', 'Deleting an log cannot be undone, only recreated')
								.then(res => {
									if (res === true) {
										LedgerStore.deleteLogs([log]).then(() => {
											setTimeout(() => {
												resolve({ action: 'deleted' });
											}, 1000);
										});
									}
								});
						}, 10);
					},
				};
				let initial = [
					{
						title: 'Note',
						click: actions.updateContent,
					},
					{
						title: 'Location',
						click: actions.updateLocation,
					},
					{
						title: 'Date & Time',
						click: actions.updateDate,
					},
				];

				if (Object.keys(log.trackers).length) {
					initial.push({
						title: 'Tracker Data',
						click: actions.updateData,
					});
				}

				initial.push({
					title: 'Delete...',
					click: actions.delete,
				});

				methods.popmenu({ title: 'Edit Log', buttons: initial });
			}); // end return promise
		},
		showLocations(locations) {
			update(s => {
				s.locationViewer.locations = locations;
				s.locationViewer.show = true;
				return s;
			});
		},
		dismissLocations() {
			update(s => {
				s.locationViewer.locations = null;
				s.locationViewer.show = false;
				return s;
			});
		},
		dismissToast() {
			update(s => {
				s.toast.message = null;
				s.toast.show = false;
				return s;
			});
		},
		toast(message, perm) {
			perm = perm === true ? true : false;
			update(s => {
				s.toast.message = message;
				s.toast.show = true;
				return s;
			});
			if (!perm) {
				setTimeout(() => {
					update(s => {
						s.toast.message = null;
						s.toast.show = false;
						return s;
					});
				}, 1300);
			}
		},
		confirm(title, message, ok, cancel) {
			return new Promise((resolve, reject) => {
				update(s => {
					s.alert.show = true;
					s.alert.title = title;
					s.alert.message = message;
					s.alert.cancel = null;
					s.alert.ok = ok || 'Ok';
					s.alert.cancel = cancel || 'Cancel';
					s.alert.onInteract = resolve;
					return s;
				});
			});
		},
		popmenu(options) {
			update(s => {
				s.popmenu.show = true;
				s.popmenu.buttons = options.buttons;
				s.popmenu.title = options.title;
				return s;
			});
		},
		pickLocation() {
			return new Promise((resolve, reject) => {
				update(s => {
					s.locationFinder.show = true;
					s.locationFinder.onInteract = event => {
						resolve(event);
					};
					return s;
				});
			});
		},
		dismissPickLocation() {
			update(s => {
				s.locationFinder.show = false;
				s.locationFinder.onInteract = null;
				return s;
			});
		},
		clearPrompt() {
			update(s => {
				s.prompt.show = false;
				s.prompt.onInteract = null;
				return s;
			});
		},
		prompt(message, options) {
			return new Promise((resolve, reject) => {
				setTimeout(() => {
					update(s => {
						s.prompt.show = true;
						s.prompt.message = message;
						s.prompt.value = options.value || null;
						s.prompt.valueType = options.valueType || 'text';
						s.prompt.title = options.title || 'Prompt';
						s.prompt.cancel = 'Cancel';
						s.prompt.placeholder = options.placeholder || '';
						s.prompt.onInteract = res => {
							resolve(s.prompt.value);
						};
						return s;
					});
				}, 10);
			});
		},
		dismiss() {
			update(s => {
				s.alert.show = false;
				s.popmenu.show = false;
				s.prompt.show = false;
				return s;
			});
		},
	};

	return {
		update,
		subscribe,
		set,
		...methods,
	};
};

export const Interact = interactInit();

import { writable } from 'svelte/store';

// utils
import Logger from '../utils/log/log';

// Stores
import { LedgerStore } from '../store/ledger';

const console = new Logger('✋ Interact');

const interactInit = () => {
	let getBase = () => {
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

	let base = getBase();

	const { update, subscribe, set } = writable(base);

	const methods = {
		alert(title, message, ok) {
			return new Promise(resolve => {
				update(b => {
					b.alert.show = true;
					b.alert.title = title;
					b.alert.message = message;
					b.alert.cancel = null;
					b.alert.ok = ok || 'Ok';
					b.alert.onInteract = resolve;
					return b;
				});
			});
		},
		editTracker(tracker) {
			return new Promise((resolve, reject) => {
				update(b => {
					b.trackerEditor.show = true;
					b.trackerEditor.tracker = tracker;
					b.trackerEditor.onInteract = event => {
						resolve(event.detail);
					};
					return b;
				});
			});
		},
		dismissEditTracker() {
			update(b => {
				b.trackerEditor.show = false;
				b.trackerEditor.tracker = null;
				b.trackerEditor.onInteract = null;
				return b;
			});
		},
		trackerInput(tracker) {
			return new Promise((resolve, reject) => {
				update(b => {
					b.trackerInput.show = true;
					b.trackerInput.tracker = tracker;
					b.trackerInput.onInteract = tracker => {
						resolve(tracker);
					};
					return b;
				});
			});
		},
		dismissTrackerInput() {
			update(b => {
				b.trackerInput.show = false;
				b.trackerInput.tracker = null;
				b.trackerInput.onInteract = null;
				return b;
			});
		},
		/**
		 * Select a Single Tracker
		 */
		selectTracker() {
			return new Promise((resolve, reject) => {
				update(b => {
					b.trackerSelector.show = true;
					b.trackerSelector.multiple = false;
					b.trackerSelector.onInteract = trackerArray => {
						resolve(trackerArray.length ? trackerArray[0] : null);
					};
					return b;
				});
			});
		},
		/**
		 * Select a Multiple Tracker
		 */
		selectTrackers() {
			return new Promise((resolve, reject) => {
				update(b => {
					b.trackerSelector.show = true;
					b.trackerSelector.multiple = true;
					b.trackerSelector.onInteract = trackerArray => {
						resolve(trackerArray);
					};
					return b;
				});
			});
		},
		dismissTrackerSelector() {
			update(b => {
				b.trackerSelector.show = false;
				b.trackerSelector.multiple = false;
				b.trackerSelector.onInteract = null;
				return b;
			});
		},
		logOptions(log) {
			return new Promise((resolve, reject) => {
				let actions = {
					updateContent() {
						methods.prompt('Update Content', { value: log.note }).then(content => {
							log.note = content;
							setTimeout(() => {
								LedgerStore.updateLog(log).then(res => {
									resolve({ action: 'updated' });
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
						title: 'Edit...',
						click() {
							setTimeout(() => {
								methods.popmenu({
									title: 'Edit Log',
									buttons: [
										{
											title: 'Edit Content',
											click: actions.updateContent,
										},
										{
											title: 'Edit Location',
											click: actions.updateLocation,
										},
										// {
										// 	title: 'Edit Tracker Data',
										// 	click() {
										// 		//
										// 	},
										// },
									],
								});
							}, 10);
						},
					},
					{
						title: 'Delete...',
						click: actions.delete,
					},
				];

				methods.popmenu({ title: 'Log Options', buttons: initial });
			}); // end return promise
		},
		showLocations(locations) {
			update(bs => {
				bs.locationViewer.locations = locations;
				bs.locationViewer.show = true;
				return bs;
			});
		},
		dismissLocations() {
			update(bs => {
				bs.locationViewer.locations = null;
				bs.locationViewer.show = false;
				return bs;
			});
		},
		dismissToast() {
			update(bs => {
				bs.toast.message = null;
				bs.toast.show = false;
				return bs;
			});
		},
		toast(message, perm) {
			perm = perm === true ? true : false;
			update(bs => {
				bs.toast.message = message;
				bs.toast.show = true;
				return bs;
			});
			if (!perm) {
				setTimeout(() => {
					update(bs => {
						bs.toast.message = null;
						bs.toast.show = false;
						return bs;
					});
				}, 1300);
			}
		},
		confirm(title, message, ok, cancel) {
			return new Promise((resolve, reject) => {
				update(b => {
					b.alert.show = true;
					b.alert.title = title;
					b.alert.message = message;
					b.alert.cancel = null;
					b.alert.ok = ok || 'Ok';
					b.alert.cancel = cancel || 'Cancel';
					b.alert.onInteract = resolve;
					return b;
				});
			});
		},
		popmenu(options) {
			update(b => {
				b.popmenu.show = true;
				b.popmenu.buttons = options.buttons;
				b.popmenu.title = options.title;
				return b;
			});
		},
		pickLocation() {
			return new Promise((resolve, reject) => {
				update(b => {
					b.locationFinder.show = true;
					b.locationFinder.onInteract = event => {
						resolve(event);
					};
					return b;
				});
			});
		},
		dismissPickLocation() {
			update(b => {
				b.locationFinder.show = false;
				b.locationFinder.onInteract = null;
				return b;
			});
		},
		clearPrompt() {
			update(b => {
				b.prompt.show = false;
				b.prompt.onInteract = null;
				return b;
			});
		},
		prompt(message, options) {
			return new Promise((resolve, reject) => {
				setTimeout(() => {
					update(b => {
						b.prompt.show = true;
						b.prompt.message = message;
						b.prompt.value = options.value || null;
						b.prompt.valueType = options.valueType || 'text';
						b.prompt.title = options.title || 'Prompt';
						b.prompt.cancel = 'Cancel';
						b.prompt.placeholder = options.placeholder || '';
						b.prompt.onInteract = res => {
							resolve(b.prompt.value);
						};
						return b;
					});
				}, 10);
			});
		},
		dismiss() {
			update(b => {
				b.alert.show = false;
				b.popmenu.show = false;
				b.prompt.show = false;
				return b;
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

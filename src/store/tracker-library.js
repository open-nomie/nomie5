/**
 * Commander
 * Partial port + cleanup from Nomie 2 - currently only supports Notes.  Nomie 2 supported all sorts of wacky shit
 */

// Svelte
import { writable } from 'svelte/store';

// utils
import Logger from '../utils/log/log';

// Vendors

import StartPack from '../modules/packs/default-trackers';
import { TrackerStore } from '../store/trackers';
import { Interact } from '../store/interact';
import { Lang } from '../store/lang';

// Stores

const console = new Logger('🚦 Lang');

// Nomie API Store

const TrackerLibInit = () => {
	const { update, subscribe, set } = writable({
		trackers: Object.keys(StartPack.trackers).map(key => StartPack.trackers[key]),
		show: false,
	});

	const methods = {
		toggle() {
			update(p => {
				p.show = !p.show;
				return p;
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

export const TrackerLibrary = TrackerLibInit();

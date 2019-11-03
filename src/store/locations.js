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
import { TrackerStore } from './trackers';
import { Interact } from './interact';
import { Lang } from './lang';
import Storage from '../modules/storage/storage';

import config from '../../config/global';
import md5 from 'md5';
import Location from '../modules/locate/Location';

// Stores

const console = new Logger('🗺 $Locations');

// Nomie API Store

const LocationsInit = () => {
	const { update, subscribe, set } = writable([]);

	const methods = {
		/**
		 * Save a single location
		 * it will update or insert if ifs new
		 * @param {Location} location
		 */
		save(location) {
			return new Promise((resolve, reject) => {
				location = new Location(location);
				update(d => {
					let found = d.find(d => d.id == location.id);
					if (!found) {
						d.push(location);
					} else {
						d = d.map(row => {
							return row.id == location.id ? location : row;
						});
					}
					Storage.put(`${config.data_root}/locations.json`, d)
						.then(() => {
							resolve(location);
						})
						.catch(reject);
					return d;
				});
			});
		},
		deleteByID(id) {
			update(d => {
				return d.filter(row => row.id !== id);
			});
		},
	};

	// Get storage
	Storage.onReady(() => {
		Storage.get(`${config.data_root}/locations.json`).then(locations => {
			update(d => locations || []);
		});
	});

	return {
		update,
		subscribe,
		set,
		...methods,
	};
};

export const Locations = LocationsInit();

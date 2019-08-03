/**
 * Nomie's someone generic data storage
 * this was used originally to communicate with sqlite
 * then pouchdb, now it's blockstack and localforage.
 */

// Vendors
import localforage from 'localforage';

import LocalForageEngine from './engine.localforage';
import BlockStackEngine from './engine.blockstack';

export default {
	engines: {
		blockstack: BlockStackEngine,
		local: LocalForageEngine,
	},
	engine: null,
	// Get user storage type
	storageType() {
		return this.engine || this.local.get('root/storage_type') || 'blockstack';
	},
	getEngine() {
		return this.engines[this.storageType()];
	},
	// Get a file
	async get(path) {
		let content;
		return await this.getEngine().get(path);
	},
	// Put a file
	async put(path, content) {
		return await this.getEngine().put(path, content);
	},
	// Delete a file
	async delete(path) {
		return await this.getEngine().delete(path);
		// if (this.storageType() === 'blockstack') {
		// 	return blockstack.deleteFile(path);
		// } else if (this.storageType() === 'local') {
		// 	return localforage.removeItem(path);
		// }
	},
	async list() {
		return await this.getEngine().list();
	},
	// This local is reference to storage on the device ONLY... Regardless of storage engine.
	// So this  stuff wouldn't sync with blockstack or other storage engines
	local: {
		get(path) {
			return JSON.parse(localStorage.getItem(`n4/storage/${path}`) || 'null');
		},
		put(path, value) {
			return localStorage.setItem(`n4/storage/${path}`, JSON.stringify(value));
		},
	},
};

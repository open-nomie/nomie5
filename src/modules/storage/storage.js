/**
 * Nomie's someone generic data storage
 * this was used originally to communicate with sqlite
 * then pouchdb, now it's blockstack and localforage.
 */

// Vendors
import localforage from 'localforage';

export default {
	// Get user storage type
	storageType() {
		return this.local.get('root/storage_type') || 'blockstack';
	},
	// Get a file
	async get(path) {
		let content;
		try {
			if (this.storageType() === 'blockstack') {
				content = await blockstack.getFile(path);
			} else {
				content = await localforage.getItem(path);
			}
			content = JSON.parse(content);
		} catch (e) {
			content = null;
		}
		return content ? content : null;
	},
	// Put a file
	async put(path, content) {
		if (this.storageType() === 'blockstack') {
			return blockstack.putFile(path, JSON.stringify(content));
		} else if (this.storageType() === 'local') {
			return localforage.setItem(path, JSON.stringify(content));
		}
	},
	// Delete a file
	async delete(path) {
		if (this.storageType() === 'blockstack') {
			return blockstack.deleteFile(path);
		} else if (this.storageType() === 'local') {
			return localforage.removeItem(path);
		}
	},
	local: {
		get(path) {
			return JSON.parse(localStorage.getItem(`n4/storage/${path}`) || 'null');
		},
		put(path, value) {
			return localStorage.setItem(`n4/storage/${path}`, JSON.stringify(value));
		},
	},
};

import config from '../../../config/global';
import localforage from 'localForage';

export default {
	async get(path) {
		let content;
		try {
			if (this.local.get('root/storage_type') === 'blockstack') {
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
	async put(path, content) {
		if (this.local.get('root/storage_type') === 'blockstack') {
			return blockstack.putFile(path, JSON.stringify(content));
		} else if (this.local.get('root/storage_type') === 'local') {
			return localforage.setItem(path, JSON.stringify(content));
		}
	},
	async delete(path) {
		if (this.local.get('root/storage_type') === 'blockstack') {
			return blockstack.deleteFile(path);
		} else if (this.local.get('root/storage_type') === 'local') {
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

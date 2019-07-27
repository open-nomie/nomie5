import config from '../../../config/global';
import localforage from 'localForage';

export default {
	async get(path) {
		let content;
		try {
			if (config.storage_engine === 'blockstack') {
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
		if (config.storage_engine === 'blockstack') {
			return blockstack.putFile(path, JSON.stringify(content));
		} else if (config.storage_engine === 'local') {
			return localforage.setItem(path, JSON.stringify(content));
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

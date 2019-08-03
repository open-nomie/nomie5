import localforage from 'localforage';

export default {
	name: 'Locally Stored Data',
	description: 'All data is stored in your browser locally.',
	authRequired: false,
	put(path, content) {
		return localforage.setItem(path, JSON.stringify(content));
	},
	get(path) {
		return localforage.getItem(path).then(content => {
			return content ? JSON.parse(content) : null;
		});
	},
	list() {
		return localforage.keys().then(keys => {
			return keys;
		});
	},
	delete(path) {
		return localforage.deleteItem(path);
	},
};

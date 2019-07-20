export default {
	async get(path) {
		let content;
		try {
			content = await blockstack.getFile(path);
			content = JSON.parse(content);
		} catch (e) {
			content = null;
		}
		return content ? content : null;
	},
	async put(path, content) {
		return blockstack.putFile(path, JSON.stringify(content));
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

export default {
	authRequired: true,
	name: 'Blockstack',
	description: 'Encrypted storage you control.',
	login() {
		window.blockstack.redirectToSignIn();
	},
	loginPending() {
		// TODO: tie in pending
	},
	onLogin(payload) {
		// TODO: tie in on login
	},
	put(path, content) {
		return blockstack.putFile(path, JSON.stringify(content));
	},
	get(path) {
		return blockstack.getFile(path).then(content => {
			return content ? JSON.parse(content) : null;
		});
	},
	list() {
		return blockstack.listFiles().then(content => {
			return content;
		});
	},
	delete(path) {
		return blockstack.deleteFile(path);
	},
};

const userSession = new blockstack.UserSession();

export default {
	authRequired: true,
	name: 'Blockstack',
	description: 'Encrypted storage you control.',
	onReady(func) {
		if (userSession.isSignInPending()) {
			console.log('User is pending');
			userSession.handlePendingSignIn().then(userData => {
				console.log('Handling Pending Signin');
				window.location.href = '/';
			});
		} else if (userSession.isUserSignedIn()) {
			func();
		} else {
			// console.error('REDIRECTING TO BLOCKSTACK');
			if (confirm('Sign-in/Register with Blockstack?')) {
				this.login();
			} else {
				// Clear local storage
				localStorage.clear();
				// Show Onboarding
				window.location.reload();
			}
		}
	},
	getProfile() {
		return userSession.loadUserData();
	},
	login() {
		window.blockstack.redirectToSignIn();
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

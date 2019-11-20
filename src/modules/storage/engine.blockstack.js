const userSession = new blockstack.UserSession();
let askingForBlockstack = false;
let listeners = [];
export default {
  authRequired: true,
  name: "Blockstack",
  description: "Encrypted storage you control.",
  init() {
    if (userSession.isSignInPending()) {
      userSession.handlePendingSignIn().then(userData => {
        window.location.href = "/";
      });
    } else if (userSession.isUserSignedIn()) {
    } else if ((askingForBlockstack = false)) {
      // console.error('REDIRECTING TO BLOCKSTACK');

      if (confirm("Sign-in/Register with Blockstack?")) {
        this.login();
      } else {
        askingForBlockstack = false;
        // Clear local storage
        localStorage.clear();
        // Show Onboarding
        window.location.reload();
      }
    }
  },
  onReady(func) {
    if (listeners.indexOf(func) == -1) {
      listeners.push(func);
    }
    listeners = [];
  },
  fireReady() {
    listeners.forEach(func => {
      func();
    });
  },
  processLogin() {
    if (userSession.isSignInPending()) {
      userSession.handlePendingSignIn().then(userData => {
        window.location.href = "/";
      });
    } else if (userSession.isUserSignedIn()) {
      func();
    } else if ((askingForBlockstack = false)) {
      // console.error('REDIRECTING TO BLOCKSTACK');
      setTimeout(() => {
        askingForBlockstack = true;
      }, 1);
      if (confirm("Sign-in/Register with Blockstack?")) {
        this.login();
      } else {
        askingForBlockstack = false;
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
    return new Promise((resolve, reject) => {
      let files = [];
      blockstack
        .listFiles((file, what) => {
          files.push(file);
          return true;
        })
        .then(() => {
          resolve(files);
        })
        .catch(reject);
    });
  },
  delete(path) {
    return blockstack.deleteFile(path);
  }
};

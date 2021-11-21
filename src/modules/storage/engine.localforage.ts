import localforage from "localforage";

let listeners = [];

export default {
  name: "Locally Stored Data",
  description: "All data is stored in your browser locally.",
  authRequired: false,
  onReady(func) {
    // No need to setup just call the function
    if (listeners.indexOf(func) == -1) {
      listeners.push(func);
    }
  },
  fireReady() {
    listeners.forEach(func => {
      func();
    });
    listeners = [];
  },
  init() {
    this.fireReady();
  },
  getProfile() {
    return {
      username: "Local User"
    };
  },
  put(path, content) {
    return localforage.setItem(path, JSON.stringify(content));
  },
  get(path) {
    return localforage.getItem(path).then((content: any) => {
      return content ? JSON.parse(content) : null;
    });
  },
  list() {
    return localforage.keys().then(keys => {
      return keys;
    });
  },
  delete(path) {
    return localforage.removeItem(path);
  }
};

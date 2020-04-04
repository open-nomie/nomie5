export default class Person {
  constructor(starter = {}) {
    if (typeof starter == "string") {
      this.username = starter;
      this.displayName = starter;
      this.avatar = null;
      this.last = new Date();
      starter = {};
    } else {
      this.username = starter.username || null;
      this.displayName = starter.displayName || starter.username || null;
      this.avatar = starter.avatar || null;
      this.last = starter.last ? new Date(starter.last) : new Date();
    }
  }

  setLast(date) {
    date = date || new Date();
    this.last = date;
  }
  getLast() {
    return this.last;
  }

  setUsername(username) {
    this.username = username;
  }
  setDisplayName(displayName) {
    this.displayName = displayName;
  }
  setAvatar(avatar) {
    this.avatar = avatar;
  }
  getUsername() {
    return this.username;
  }
  getDisplayName() {
    return this.displayName || this.username;
  }
  getAvatar() {
    return this.avatar;
  }
}

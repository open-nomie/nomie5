export default class Person {
  constructor(starter = {}) {
    if (typeof starter == "string") {
      this.username = starter;
      this.displayName = starter;
      this.avatar = null;
      starter = {};
    } else {
      this.username = starter.tag || null;
      this.displayName = starter.name || null;
      this.avatar = starter.avatar || null;
    }
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
}

export default class Person {
  constructor(starter = {}) {
    this.username = starter.tag || null;
    this.displayName = starter.name || null;
  }
}

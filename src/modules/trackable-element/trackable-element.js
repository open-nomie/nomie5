export default class TrackableElement {
  constructor(starter = {}) {
    this.id = starter.id || null;
    this.type = starter.type || null;
    this.raw = starter.raw || null;
    this.value = starter.value || null;
    this.prefix = starter.prefix || null;
  }
}

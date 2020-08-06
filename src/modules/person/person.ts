export interface IPerson {
  username: string;
  displayName: string;
  avatar?: string;
  last: Date;
  notes: string;
}

export default class Person {
  username: string;
  displayName: string;
  avatar?: string;
  last: Date;
  notes: string;

  constructor(starter: any = {}) {
    if (typeof starter == "string") {
      this.username = starter;
      this.displayName = starter;
      this.last = new Date();
      this.notes = "";
      starter = {};
    } else if (typeof starter == "object") {
      this.username = starter.username ? starter.username.toLowerCase() : "unknown";
      this.displayName = starter.displayName || starter.username;
      this.avatar = starter.avatar;
      this.last = starter.last ? new Date(starter.last) : new Date();
      this.notes = starter.notes || "";
    }
  }

  setLast(date): void {
    date = date || new Date();
    this.last = date;
  }
  getLast(): Date {
    return this.last;
  }

  setUsername(username: string): void {
    this.username = username;
  }

  setDisplayName(displayName: string): void {
    this.displayName = displayName;
  }

  setAvatar(avatar: string): void {
    this.avatar = avatar;
  }

  getUsername(): string {
    return this.username;
  }

  getDisplayName(): string {
    return this.displayName || this.username;
  }

  getAvatar(): string {
    return this.avatar;
  }
}

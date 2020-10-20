import nid, { md5 } from "../nid/nid";
export interface AwardConfig {
  id?: string;
  name: string;
  level?: number;
  reason?: string;
  hash?: string;
  phash?: string;
  timestamp?: Date;
}
export default class Award {
  id?: string;
  name: string;
  level?: number = 0;
  reason?: string;
  hash?: string;
  phash?: string;
  timestamp?: Date;

  constructor(starter: AwardConfig = { name: undefined }) {
    this.id = starter.id || `awd-${nid(6)}`;
    this.name = starter.name;
    this.reason = starter.reason;
    this.level = starter.level || 0;
    this.phash = starter.phash;
    this.timestamp = starter.timestamp || new Date();
    if (!this.name) {
      throw new Error("Award name is required");
    }
    this.hash = starter.hash;
  }

  getHash(): string {
    return md5(`${this.id}${this.phash}${this.timestamp.getTime()}${this.name}${this.reason}`);
  }
}

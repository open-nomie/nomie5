/**
 * Nomie's someone generic data storage
 * this was used originally to communicate with sqlite
 * then pouchdb, now it's blockstack and localforage.
 */

// Vendors

import LocalForageEngine from "./engine.localforage";
import BlockStackEngine from "./engine.blockstack";
import PouchDBEngine from "./engine.pouchdb";

export default {
  engines: {
    blockstack: BlockStackEngine,
    local: LocalForageEngine,
    pouchdb: PouchDBEngine
  },
  engine: null,
  // Get user storage type
  storageType() {
    return this.engine || this._storageType() || "local";
    // return "pouchdb";
  },
  _storageType() {
    return this.local.get("root/storage_type");
  },
  setType(type) {
    this.local.put("root/storage_type", type);
  },
  getEngine() {
    try {
      return this.engines[this.storageType()];
    } catch (e) {
      console.log("Error getting Engine");
      console.log("e", e.message);
      return null;
    }
  },
  getProfile() {
    const engine = this.getEngine();
    return engine.getProfile();
  },
  onReady(func) {
    return this.getEngine().onReady(func);
  },
  async init() {
    let engineProfile = this.getEngine().init();
    return engineProfile;
  },
  // Get a file
  async get(path, onChange = null) {
    return await this.getEngine().get(path, onChange);
  },
  // Put a file
  async put(path, content) {
    return await this.getEngine().put(path, content);
  },
  async putBinary(path, content) {
    return await this.getEngine().putBinary(path, content);
  },

  // Delete a file
  async delete(path) {
    return await this.getEngine().delete(path);
    // if (this.storageType() === 'blockstack') {
    // 	return blockstack.deleteFile(path);
    // } else if (this.storageType() === 'local') {
    // 	return localforage.removeItem(path);
    // }
  },
  async list() {
    return await this.getEngine().list();
  },
  // This local is reference to storage on the device ONLY... Regardless of storage engine.
  // So this  stuff wouldn't sync with blockstack or other storage engines
  local: {
    get(path) {
      return JSON.parse(localStorage.getItem(`n4/storage/${path}`) || "null");
    },
    put(path, value) {
      return localStorage.setItem(`n4/storage/${path}`, JSON.stringify(value));
    }
  }
};

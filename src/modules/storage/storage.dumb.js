/**
 * Storage DUMB! This is only for testing modules that need to use storage,
 * and the current storage module is to bound to pouchdb and blockstack
 * both of which cause problems with Cypress
 */

import { tick } from "svelte";
import Config from "../../../config/global";

// Vendors

const fakeLocal = {};

class SideStore {
  constructor(path) {
    this.dbPath = `${Config.data_root}/localDB/${path}`;
    this.data = fakeLocal;
  }
  get(key) {
    return this.data.hasOwnProperty(key) ? this.data[key] : null;
  }
  put(key, value) {
    this.data[key] = value;
  }
}

const FakeEngine = {
  data: {},
  async get(key) {
    await tick(100);
    return this.data.hasOwnProperty(key) ? this.data[key] : null;
  },
  async put(key, value) {
    await tick(100);
    this.data[key] = value;
    return this.data;
  },
  async delete(key) {
    await tick(100);
    delete this.data[key];
    return this.data;
  },
  async list() {
    await tick(100);
    return Object.keys(this.data);
  },
};

const Storage = {
  // Get user storage type
  storageType() {
    return this._storageType() || "local.dumb";
    // return "pouchdb";
  },
  _storageType() {
    return this.local.get("root/storage_type");
  },
  setType(type) {
    this.local.put("root/storage_type", type);
  },

  onReady(func) {
    return func(this);
  },
  async init() {
    // let engineProfile = this.getEngine().init();
    // return engineProfile;
    await tick(100);
    return FakeEngine;
  },
  // Get a file
  async get(path, onChange = null) {
    return await FakeEngine.get(path, onChange);
  },
  // Put a file
  async put(path, content) {
    return await FakeEngine.put(path, content);
  },
  async putBinary(path, content) {
    // return await this.getEngine().putBinary(path, content);
  },

  // Delete a file
  async delete(path) {
    return await FakeEngine.delete(path);
    // if (this.storageType() === 'blockstack') {
    // 	return blockstack.deleteFile(path);
    // } else if (this.storageType() === 'local') {
    // 	return localforage.removeItem(path);
    // }
  },
  async list() {
    return await FakeEngine.list();
  },
  // This local is reference to storage on the device ONLY... Regardless of storage engine.
  // So this  stuff wouldn't sync with blockstack or other storage enginesenu
  local: new SideStore("local"),
  SideStore,
};

export default Storage;

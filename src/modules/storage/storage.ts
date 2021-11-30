/**
 * Nomie's someone generic data storage
 * this was used originally to communicate with sqlite
 * then pouchdb, now it's blockstack and localforage.
 */

// Vendors

import LocalForageEngine from "./engine.localforage";
// import BlockStackEngine from "./engine.blockstack";
// import PouchDBEngine from "./engine.pouchdb";
import Config from "../../config/appConfig";

const STORAGE_TYPE_PATH = "n6/storage-type";

export class SideStore {
  dbPath: string;
  data: any;
  constructor(path) {
    this.dbPath = `${Config.data_root}/localDB/${path}`;
    this.data = JSON.parse(localStorage.getItem(this.dbPath) || "{}");
  }
  get(key) {
    return this.data.hasOwnProperty(key) ? this.data[key] : null;
  }
  put(key, value) {
    this.data[key] = value;
    localStorage.setItem(this.dbPath, JSON.stringify(this.data));
  }
}

export function getStorageType() {
  let type: string = localStorage.getItem(STORAGE_TYPE_PATH);
  if (type) {
    return type.replace(/\"/g, "");
  } else {
    return null;
  }
}

export type StorageTypes = "local" | "pouchdb" | "firebase"; // blockstack

export function setStorage(type: StorageTypes) {
  localStorage.setItem(STORAGE_TYPE_PATH, type);
}

export interface IStorage {
  engines: {
    // blockstack: BlockStackEngine;
    local: typeof LocalForageEngine;
    // pouchdb: typeof PouchDBEngine;
  };
  engine: any;
  storageType(): string;
  get(path: string): Promise<any>;
  put(path: string, content: any): Promise<any>;
  delete(path: string): Promise<any>;
  list(): Promise<any>;
  local: {
    get(path: string): any;
    put(path: string, content: any): any;
    remove(path: string): void;
  };
}

const Storage = {
  engines: {
    // blockstack: BlockStackEngine,
    local: LocalForageEngine,
    // pouchdb: PouchDBEngine,
  },
  engine: getStorageType(),
  // Get user storage type
  storageType(): string {
    return this.engine || this._storageType() || "local";
    // return "pouchdb";
  },
  _storageType() {
    return getStorageType();
  },
  setType(type: StorageTypes) {
    setStorage(type);
  },
  getEngine() {
    try {
      return this.engines[this.storageType()];
    } catch (e) {
      console.error("Error getting Engine");
      console.error("e", e.message);
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
  // Aug 24th Also adding some migration
  local: {
    get(path) {
      return JSON.parse(localStorage.getItem(`storage/${path}`) || "null");
    },
    put(path, value) {
      return localStorage.setItem(`storage/${path}`, JSON.stringify(value));
    },
    remove(path) {
      return localStorage.removeItem(`storage/${path}`);
    },
  },
  SideStore,
};

export default Storage;

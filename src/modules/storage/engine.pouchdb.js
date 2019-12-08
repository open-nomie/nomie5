/**
 * Svelte is throwing errors when importing pouch
 * instead i've moved those packages into the build_tools/move-resources
 * it will move the needed files into a vendor folder
 * and can be imported with script calls..
 * Not idea, but I can get svelte to compile with them.
 */
// import pouchdb from "pouchdb";

let listeners = [];
let syncer;
let dbKey = "nomie4-v01";

export default {
  name: "PouchDB",
  description: "Stored locally, with CouchDB Syncing support",
  authRequired: false,
  db: new PouchDB(dbKey, {
    auto_compaction: true,
    revs_limit: 2
  }),
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
  onChange(change) {
    console.log("Sync Change", change);
  },
  onPaused(change) {
    console.log("Sync Paused", change);
  },
  onError(error) {
    console.log("Sync Error", error);
  },
  init() {
    let syncURL = "http://localhost:32778/" + dbKey;
    if (syncURL) {
      syncer = PouchDB.sync(dbKey, syncURL, {
        live: true,
        retry: true
      });
      syncer
        .on("change", this.onChange)
        .on("paused", this.onPaused)
        .on("error", this.onError);
    }
    this.fireReady();
  },
  info() {
    return {
      sync: syncer
    };
  },
  getProfile() {
    return {
      username: "Local User"
    };
  },
  async deleteRev(path, rev) {},
  async put(path, content) {
    console.log("pouch put", path);
    let payload = {
      _id: path,
      data: content
    };
    // check if it exists
    let exists = await this.getFullDoc(path);
    if (exists) {
      return this.db.put({ ...exists, ...payload });
    } else {
      return this.db.put(payload);
    }
  },
  async getFullDoc(path) {
    let doc = null;
    console.log(`get ${path}`);
    try {
      doc = await this.db.get(path);
    } catch (e) {
      console.log(`getFullDoc(${path}) error`, e.message);
    }
    return doc;
  },
  async get(path) {
    let doc = null;
    try {
      let fullDoc = await this.getFullDoc(path);
      doc = fullDoc ? fullDoc.data : null;
    } catch (e) {}
    return doc;
  },
  async list() {
    let docs = await this.db.allDocs();
    console.log("All Docs", docs);
    let rows = docs ? docs.rows : [];
    return rows.map(doc => doc.id);
  },
  async delete(path) {
    let doc = await this.getFullDoc(path);
    if (doc) {
      return await this.db.remove(doc);
    }
    return null;
  }
};

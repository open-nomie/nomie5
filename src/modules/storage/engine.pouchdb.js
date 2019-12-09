/**
 * Svelte is throwing errors when importing pouch
 * instead i've moved those packages into the build_tools/move-resources
 * it will move the needed files into a vendor folder
 * and can be imported with script calls..
 * Not idea, but I can get svelte to compile with them.
 */
// import pouchdb from "pouchdb";
import Storage from "../storage/storage";

let listeners = [];
let syncer;
let dbKey = "nomie4-v01";

export default {
  name: "PouchDB",
  description: "Stored locally, with CouchDB Syncing support",
  authRequired: false,
  remote: null,
  sync: false,
  dbKey: dbKey,
  syncing: false,
  syncer: null,
  db: new PouchDB(dbKey, {
    auto_compaction: true,
    revs_limit: 2
  }),
  onReady(func) {
    this.sync = Storage.local.get("pouchdb-sync") || false;
    this.remote = Storage.local.get("pouchdb-remote") || null;
    console.log("What is Storage in engine?", this);
    func(this);
    // No need to setup just call the function
    // if (listeners.indexOf(func) == -1) {
    //   listeners.push(func);
    // }
  },
  async testRemote() {
    return true;
  },
  // setRemote(auth, url) {
  //   let remote = {
  //     url,
  //     auth: auth
  //   };
  //   return Storage.local.put("pouchdb-remote", remote);
  // },
  removeRemote() {},
  fireReady() {
    listeners.forEach(func => {
      func();
    });
    listeners = [];
  },
  remoteToUrl() {
    let remote = Storage.local.get("pouchdb-remote");
    if (remote) {
      let parsed = new URL(remote.host);
      parsed.username = remote.username;
      parsed.password = remote.password;
      parsed.pathname = "/" + this.dbKey;
      return parsed.toString();
    } else {
      return null;
    }
  },
  onChange(change) {
    console.log("Sync Change", change);
    this.syncing = true;
  },
  onPaused(change) {
    console.log("Sync Paused", change);
    this.syncing = true;
  },
  onError(error) {
    console.log("Sync Error", error);
  },
  stopSync() {
    console.log("stopsync", this.syncer);
    this.syncer.cancel();
  },
  startSync() {
    let errorCount = 0;
    let syncURL = this.remoteToUrl();
    if (syncURL && this.sync) {
      this.syncer = PouchDB.sync(dbKey, syncURL, {
        live: true,
        retry: true
      });

      console.log("🍆🍆🍆🍆 Sync Enabled");
      this.syncer
        .catch(e => {
          console.log("Catch error in syncer", e.message);
          this.syncing = false;
        })
        .then(res => {
          this.syncing = true;
          this.valid = true;
        });
      this.syncer
        .on("complete", this.onChange)
        .on("change", this.onChange)
        .on("paused", this.onPaused)
        .on("error", e => {
          this.onError(e);
          errorCount++;
          if (errorCount > 10) {
            alert("Something bad is going on");
          }
        });
    } else {
      console.log("🥊🥊🥊🥊🥊🥊🥊🥊🥊 Sync disabled");
    }
  },
  init() {
    this.startSync();
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

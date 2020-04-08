/**
 * Nomie API Client
 *
 * This modules is a warpper for the nomie api.
 * Alling us to capture encrypted logs from nomieapi.com
 *\\
 */

import Storage from "../storage/storage";
import Config from "../../../config/global";

const NAPI_STORE_PATH = `${Config.data_root}/napi.json`;

export default class NomieCaptureCli {
  constructor(options) {
    this.listeners = []; // Prep listeners
    options = options || {}; // any options?
    this.domain = options.domain; // set domain if there.
    this.ready = false; // is it ready?
    this.plan = "free"; // what's the plan? (this doesn't do anything currently)

    // Get Config Storage
    Storage.get(NAPI_STORE_PATH).then((captureConfig) => {
      // We have an api capture configure
      if (captureConfig) {
        this.apiKey = captureConfig.apiKey; // api key
        this.plan = captureConfig.plan; // the plan
        this.privateKey = captureConfig.privateKey; // private key
      }
      // we're ready!
      this.ready = true;
      this.fireReady(); // !fire off ready to listeners
    });
  }

  /**
   * onReady
   * fires when this is ready
   * @param {*} func
   */
  onReady(func) {
    if (this.ready) {
      func(this);
    } else {
      this.listeners.push(func);
    }
  }

  /**
   * Private Fire Ready
   */
  fireReady() {
    this.listeners.forEach((func) => {
      func(this);
    });
  }

  baseUrl() {
    return this.domain.search("localhost") > -1 ? `http://${this.domain}` : `https://${this.domain}`;
  }

  isRegistered() {
    return (this.apiKey || "").length && (this.privateKey || "").length;
  }

  /**
   * Post to the API
   * @param {String} url
   * @param {Object} payload
   * @param {array} additionalHeaders
   */
  async post(url, payload, additionalHeaders) {
    // Set headers for json
    let headers = {
      "Content-Type": "application/json",
    };
    // Setup Calling URL
    let callingURL = `${this.baseUrl()}${url}`;
    // Mash headers and  parameter headers together .
    let finalHeaders = { ...headers, ...additionalHeaders };

    // Call The service
    let results = await fetch(callingURL, {
      method: "POST",
      headers: finalHeaders,
      body: JSON.stringify(payload),
    });

    // Get Payload back
    let cbPayload = await results.json();

    // The key is no longer valid
    if (cbPayload.results.destroy) {
      await Storage.delete(NAPI_STORE_PATH);
      throw new Error("invalid-key-combination");
    }

    return cbPayload;
  }

  /**
   * Test a valid api private key combo
   * @param {String} api_key
   * @param {String} private_key
   */

  async test(api_key, private_key) {
    let success;
    try {
      const headers = { api_key, private_key: btoa(private_key) };
      let response = await this.post("/logs", {}, headers);
      success = response.success;
      return success;
    } catch (e) {
      return false;
    }
  }

  async testAndSave(api_key, private_key) {
    let success = await this.test(api_key, private_key);
    if (success) {
      await this.saveKeys(api_key, private_key);
    }
    return success;
  }

  logs() {
    return this.post(
      "/logs",
      {},
      {
        api_key: this.apiKey,
        private_key: btoa(this.privateKey),
      }
    ).then((payload) => {
      if (payload.success) {
        return payload.results;
      } else {
        alert(payload.results.message);
      }
    });
  }

  async forget() {
    return await Storage.delete(NAPI_STORE_PATH);
  }

  async unregister() {
    let payload = await this.post(
      "/unregister",
      {},
      {
        api_key: this.apiKey,
        private_key: btoa(this.privateKey),
      }
    );
    if (payload.success) {
      await Storage.delete(NAPI_STORE_PATH);
      return payload.results;
    } else {
      alert(payload.results.message);
      return null;
    }
  }

  async clear() {
    let payload = await this.post(
      "/clear",
      {},
      {
        api_key: this.apiKey,
        private_key: btoa(this.privateKey),
      }
    );
    if (payload.success) {
      return payload.results;
    } else {
      alert(payload.results.message);
    }
  }

  async saveKeys(apiKey, privateKey) {
    this.apiKey = apiKey;
    this.privateKey = privateKey;
    const payload = { apiKey: apiKey, privateKey, plan: "free" };
    let saved = await Storage.put("nomie-capture", payload);
    return true;
  }

  async register() {
    let payload = await this.post("/register");
    if (payload.success) {
      this.apiKey = payload.results.apiKey;
      this.privateKey = payload.results.privateKey;
      await Storage.put("nomie-capture", payload.results);
      return payload.results;
    } else {
      alert(payload.results.message);
    }
    return payload.success;
  }
}

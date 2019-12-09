/**
 * Nomie API Client
 *
 * This modules is a warpper for the nomie api.
 * Alling us to capture encrypted logs from nomieapi.com
 *\\
 */

import Storage from "../storage/storage";

export default class NomieCaptureCli {
  constructor(options) {
    this.listeners = []; // Prep listeners
    options = options || {}; // any options?
    this.domain = options.domain; // set domain if there.
    this.ready = false; // is it ready?
    this.plan = "free"; // what's the plan? (this doesn't do anything currently)

    // Get Config Storage
    Storage.get("nomie-capture").then(captureConfig => {
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
    this.listeners.forEach(func => {
      func(this);
    });
  }

  baseUrl() {
    return this.domain.search("localhost") > -1
      ? `http://${this.domain}`
      : `https://${this.domain}`;
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
      "Content-Type": "application/json"
    };
    // Setup Calling URL
    let callingURL = `${this.baseUrl()}${url}`;
    // Mash headers and  parameter headers together .
    let finalHeaders = { ...headers, ...additionalHeaders };

    // Call The service
    let results = await fetch(callingURL, {
      method: "POST",
      headers: finalHeaders,
      body: JSON.stringify(payload)
    });

    // Get Payload back
    let cbPayload = await results.json();

    // The key is no longer valid
    if (cbPayload.results.destroy) {
      Storage.delete("nomie-capture").then(() => {
        window.location.href = window.location.href;
      });
    }

    return cbPayload;
  }

  logs() {
    return this.post(
      "/logs",
      {},
      {
        api_key: this.apiKey,
        private_key: btoa(this.privateKey)
      }
    ).then(payload => {
      if (payload.success) {
        return payload.results;
      } else {
        alert(payload.results.message);
      }
    });
  }

  unregister() {
    return this.post(
      "/unregister",
      {},
      {
        api_key: this.apiKey,
        private_key: btoa(this.privateKey)
      }
    ).then(payload => {
      if (payload.success) {
        Storage.delete("nomie-capture");
        return payload.results;
      } else {
        alert(payload.results.message);
      }
    });
  }

  clear() {
    return this.post(
      "/clear",
      {},
      {
        api_key: this.apiKey,
        private_key: btoa(this.privateKey)
      }
    ).then(payload => {
      if (payload.success) {
        return payload.results;
      } else {
        alert(payload.results.message);
      }
    });
  }

  register() {
    return new Promise((resolve, reject) => {
      this.post("/register").then(payload => {
        if (payload.success) {
          this.apiKey = payload.results.apiKey;
          this.privateKey = payload.results.privateKey;
          Storage.put("nomie-capture", payload.results).then(() => {
            resolve(payload.results);
          });
        } else {
          alert(payload.results.message);
        }
      });
    });
  }
}

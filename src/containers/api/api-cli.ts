/**
 * Nomie API Client
 *
 * This modules is a warpper for the nomie api.
 * Alling us to capture encrypted logs from nomieapi.com
 *\\
 */

import Storage from "../../modules/storage/storage";
import Config from "../../config/appConfig";
import KeyLocker from "./key-locker/key-locker";

const NAPI_STORE_PATH = `${Config.data_root}/napi.json`;

export interface NapiLog {
  date: Date;
  id: string;
  lat?: number;
  lng?: number;
  note: string;
  source: string;
  saved?: boolean;
  discarded?: boolean;
}

export interface NapiConfig {
  apiKey: string;
  privateKey: string;
}

export default class NomieAPICli {
  listeners: Array<Function>;
  options: any;
  domain: string;
  ready: boolean;
  keyLocker: KeyLocker; // holder and worker of the ak/pk

  constructor(options:any) {
    this.listeners = []; // Prep listeners
    options = options || {}; // any options?
    this.domain = options.domain; // set domain if there.
    this.ready = false; // is it ready?
    this.keyLocker = new KeyLocker();
  }
  
  // initialie the API
  async init() {
    try {
      // Get configuration from Storage
      let config = await Storage.get(NAPI_STORE_PATH);
      if(config) {
        // Set Keylocker API Private Keys
        this.keyLocker.apiKey = config.apiKey || config.api_key;
        this.keyLocker.privateKey = config.privateKey || config.private_key;
        // we're ready!
        this.ready = true;
        this.fireReady(); // !fire off ready to listeners
      } else {
        // Not registered 
        this.ready = true;
        // Fire anyways - so we can let user register 
        this.fireReady();
      }
    } catch (e) {
      // Something bad has happened 
      alert(`Something wrong has happened. Check the console for details. Msg: ${e.message}`);
      console.error('API-Cli init error', e);
    }
  }

  /**
   * onReady
  * fires when this is ready
   * @param {*} func
   */
  onReady(func: Function) {
    return this.ready ? func(this) : this.listeners.push(func);
  }

  /**
   * Private Fire Ready
   */
  fireReady() {
    this.listeners.forEach((func) => {
      func(this);
    });
  }

  baseUrl(): string {
    return this.domain.search("localhost") > -1 ? `http://${this.domain}` : `https://${this.domain}`;
  }

  isRegistered(): boolean {
    return this.keyLocker.apiKey && this.keyLocker.privateKey ? true : false;
  }

  /**
   * Post to the API
   * @param {String} url
   * @param {Object} payload
   * @param {array} additionalHeaders
   */

  async post(url: string, payload?: any, additionalHeaders?: any): Promise<any> {
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
      throw new Error('Server is saying that is an invalid api/private key combo.');
      // await this.clearConfig();
    }

    if (results.status !== 400 && !cbPayload.success) {
      throw new Error(`API Server returned code: ${cbPayload?.results?.message || `Error Code: ${results.status}`}`);
    }

    return cbPayload;
  }

  /**
   * Test API
   * Test Vailidity of a Private Key API Combo
   */

  async test(apiKey: string, privateKey: string) {
    let success: boolean;
    this.keyLocker.apiKey = apiKey;
    this.keyLocker.privateKey = privateKey;
    let response = await this.post("/logs", {}, this.keyLocker.asAuth);
    success = response.success;
    return success;
  }

  /**
   * Test and Save
   * This will test, then save the API config to storage
   */
  async testAndSave(apiKey: string, privateKey: string) {
    let success: boolean = await this.test(apiKey, privateKey);
    if (success) {
      await this.saveKeys(apiKey, privateKey);
    }
    return success;
  }

  /**
   * Get Logs from API
   */
  async getLogs(): Promise<Array<NapiLog>> {
    return await this.logs();
  }

  // Get Logs
  async logs(): Promise<Array<NapiLog>> {
    const payload = await this.post("/logs", {}, this.keyLocker.asAuth);
    if (payload.success) {
      return payload.results;
    } else {
      throw new Error(payload.results.message);
    }
  }

  /**
   * For get this configuration
   */
  async forget() {
    return await this.clearConfig();
  }

  
  /**
   * Empty slots
   * This will clear out the slots of any remaining API logs on the server
   */
  async clear() {
    let payload = await this.post("/clear", {}, this.keyLocker.asAuth);
    if (payload.success) {
      return payload.results;
    } else {
      throw new Error(payload.results.message);
    }
  }

  /**
   * Forget this API
   * Clear Storage Config
   */
  async clearConfig() {
    await Storage.delete(NAPI_STORE_PATH);
    // await hyperStorage.delete("api-locker");
    this.fireReady();
  }

  /**
   * Set Locker Config
   * @param config 
   */
  async setConfig(config: NapiConfig) {
    try {
      this.keyLocker.apiKey = config.apiKey || this.keyLocker.apiKey;
      this.keyLocker.privateKey = config.privateKey || this.keyLocker.privateKey;
      return await Storage.put(NAPI_STORE_PATH, this.keyLocker.asObject);
    } catch (e) {
      alert(e.message);
      console.error("Set Config error", e, config);
    }
  }

  /**
   * Save Keys to Storage
   * @param apiKey 
   * @param privateKey 
   */
  async saveKeys(apiKey: string, privateKey: string) {
    this.setConfig({ apiKey: apiKey, privateKey });
    return true;
  }

  /**
   * Register for an API Key
   */
  async register(): Promise<NomieAPICli> {
    let payload = await this.post("/register");
    if (payload.success) {
      this.keyLocker.apiKey = payload.results.apiKey;
      this.keyLocker.privateKey = payload.results.privateKey;
      this.setConfig({
        apiKey: payload.results.apiKey,
        privateKey: payload.results.privateKey,
        
      });
      return this;
    } else {
      throw new Error(payload.results.message);
    }
  }

  /**
   *
   * Unregister
   * Unregisters and removes the Current API Config
   *
   */
  async destory():Promise<boolean> {
    let payload = await this.post("/unregister", {}, this.keyLocker.asAuth);
    if (payload.success) {
      return true
    } else {
      throw new Error(payload.results.message);
    }
  }

}

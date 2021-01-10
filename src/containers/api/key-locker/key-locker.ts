class KeyLocker {
  _apiKey: string;
  _privateKey: string;

  constructor() {}

  public decode(str: string): KeyLocker {
    try {
      const decoded = atob(str);
      const keyArray = decoded.split("*");
      const apiKey = keyArray[0];
      const privateKey = keyArray[1];
      // Validate 
      if (!this.validateApiKey(apiKey)) {
        throw Error("Invalid API Key provided");
      } else if (!this.validatePrivateKey(privateKey)) {
        throw Error("Invalid Private Key provided");
      } else {
        // Assign
        this.apiKey = apiKey;
        this.privateKey = privateKey;
        return this;
      }
    } catch (e) {
      console.log("Decode error", e.message);
      throw e;
    }
  }

  /**
   * Encode into a base 64 string 
   * 
   * this way it's not super super obvious its a private key
   * but honestly, if anyone gets access to your device 
   * they could easily decode the API, but then again if they have 
   * access to your device, you're pretty much screwed anyway
   * 
   * What I'm saying: this isn't encryption, this is encoding. 
   */

  public encode(): string {
    return btoa([this._apiKey, this._privateKey].join("*"));
  }

  // Private Functions

  private validateApiKey(key: string) {
    console.log("validating key", key);
    return key && key.length > 30 && key.length < 68;
  }

  private validatePrivateKey(key: string) {
    return key && key.length > 200 && key.length < 650;
  }

  // Getters and Setters

  get apiKey() {
    return this._apiKey;
  }

  set apiKey(apik: string) {
    if(this.validateApiKey(apik)) {
      this._apiKey = apik; 
    } else {
      throw Error('Invalid API Key')
    }
  }

  get privateKey() {
    return this._privateKey;
  }

  set privateKey(pk: string) {
    if(this.validatePrivateKey(pk)) {
      this._privateKey = pk;
    } else {
      throw Error('Invalid Private Key');
    }
  }

  get asAuth() {
    return {
      api_key: this._apiKey,
      private_key: btoa(this._privateKey),
    };
  }
  get asObject():any {
    return {
      api_key: this._apiKey,
      private_key: this._privateKey,
    };
  }
}

export default KeyLocker;

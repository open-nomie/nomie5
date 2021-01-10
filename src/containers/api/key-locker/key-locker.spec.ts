import KeyLocker from "./key-locker";

describe('Keylocker will make storing the api key and private key easier and tiny bit more secure - but not really', ()=>{

  it('should work!', ()=>{
    let keyLocker = new KeyLocker();
    keyLocker.apiKey = '62a06c6b252b565389cf7452766cbd6b';
    keyLocker.privateKey = '-----BEGIN PRIVATE KEY-----\nMIIBVQIBADAFAASCAT8wggE7AgEAAkEA7z9eJNBgkqhkiG9w0BAQE7ckKDOdS9m2\nWLEQBuNIlN0kkGNIS5b/ItV61ygDSgXBCvCV5BVpTjKyMOgeckt2rJ6Ttlfk70FX\n36Av+QIDAQABAkAllhb8tlD/39\nZO6UST9EJZDsyWwEQEe/C94Z8IgTzz5v+Zp23IVobOunUOUndnXZy+Hb3AZFLHzYEDWRe15nVhAiEA+3AoFpGXnq6JlfHcA1EaAESy\nfn2+5j4COycL76r5WicCIQDzlpcUAVWSTzRiWg22u8w6nCjOHJAQcc30dxG+zbEY\n3wIhANMYsK9yAKeaxax76Elol7nN80W7cMCBIwJin+TR2JNVAiBVanf9vt4H2RhQ\naK2oZ0AdSUcRx3hJG+8Ri3NAihZQ1wIhALVMs6k3r6R2ELrUwPha4rjJ9csqXnyJ\nFqR9FrOMxz1M\n-----END PRIVATE KEY-----';

    const encoded = keyLocker.encode();
    let keyLocker2 = new KeyLocker();
    keyLocker2.decode(encoded);
    expect(keyLocker2.apiKey).toBe(keyLocker.apiKey);
    expect(keyLocker2.privateKey).toBe(keyLocker.privateKey);
    // Expect auth to provide the proper keys (including a btoa'd private key)
    expect(keyLocker2.asAuth.api_key).toBe(keyLocker.apiKey);
    expect(keyLocker2.asAuth.private_key).toBe(btoa(keyLocker.privateKey));
  })

  it('should handle bad API Key failure', ()=>{
    let keyLocker = new KeyLocker();
    try {
      keyLocker.apiKey = '12345';
    } catch(e) {
      expect(e).toBeTruthy();
    }
  })

  it('should handle bad Private Key failure', ()=>{
    let keyLocker = new KeyLocker();
    try {
      keyLocker.privateKey = '12345';
    } catch(e) {
      expect(e).toBeTruthy();
    }
  })

  it('should handle bad decode request ', ()=>{
    let keyLocker = new KeyLocker();
    try {
      keyLocker.decode('123456');
    } catch(e) {
      expect(e).toBeTruthy();
    }
  })

})
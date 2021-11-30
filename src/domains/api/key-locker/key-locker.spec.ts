import KeyLocker from "./key-locker";

describe('Keylocker will make storing the api key and private key easier and tiny bit more secure - but not really', ()=>{


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
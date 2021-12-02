// import { EThree } from "@virgilsecurity/e3kit-browser";
import { EThree } from "@virgilsecurity/e3kit-browser/dist/browser.asmjs.es";

import {
  firebaseAuth,
  firebaseDB,
  FirebaseStore,
  useLoginModal,
} from "../../domains/firebase/FirebaseStore";
import { doc, setDoc, getDoc, collection, getDocs } from "firebase/firestore";
import Logger from "../../utils/log/log";

const console = new Logger("engine.firebase");

const getBasePath = (): string => {
  return `env/${import.meta.env.VITE_APP_FIRESTORE_ROOT}/${
    firebaseAuth.currentUser.uid
  }/profiles/default`;
};

const formatPath = (path: string) => {
  return path.replace(/\//g, "-");
};

let eThree: EThree;

const FirebaseEngine = {
  ready: false,
  authRequired: true,
  name: "Nomie Cloud Account",
  listeners: [],
  description: "Stored end-to-end encrypted.",
  profile: null,
  init() {
    /** Storage Init */
    return new Promise((resolve, reject) => {
      if (firebaseAuth.currentUser) {
        resolve(true);
      }
    }); // end return promise
  },
  onReady(func) {
    FirebaseStore.subscribe(async (s) => {
      if (s?.user && s?.jwt) {
        eThree = await EThree.initialize(async () => {
          return s.jwt;
        });
        await eThree.register().catch((e) => {});

        func();
      }
    });

    // if (this.ready) {
    //   func();
    // } else {
    //   if (this.listeners.indexOf(func) == -1) {
    //     this.listeners.push(func);
    //   }
    // }
  },
  fireReady() {
    this.ready = true;
    this.listeners.forEach((func) => {
      func();
    });
    this.listeners = [];
  },
  processLogin(func) {
    console.log("Process Login");
    func();
    // if (userSession.isSignInPending()) {
    //   userSession.handlePendingSignIn().then(userData => {
    //     window.location.href = "/";
    //   });
    // } else if (userSession.isUserSignedIn()) {
    //   func();
    // } else if ((askingForBlockstack = false)) {
    //   // console.error('REDIRECTING TO BLOCKSTACK');
    //   setTimeout(() => {
    //     askingForBlockstack = true;
    //   }, 1);
    //   if (confirm("Sign-in/Register with Blockstack?")) {
    //     this.login();
    //   } else {
    //     askingForBlockstack = false;
    //     // Clear local storage
    //     localStorage.clear();
    //     // Show Onboarding
    //     // window.location.reload();
    //     window.location.href = "/";
    //   }
    // }
  },
  async getProfile() {
    // if (this.profile) {
    //   return this.profile;
    // } else {
    //   let u = new blockstack.UserSession();
    //   let data = await u.loadUserData();
    //   this.profile = data;
    //   return this.profile;
    // }
    return this.profile;
  },
  login() {
    // window.blockstack.redirectToSignIn();
  },
  async put(_path, content) {
    const path = `/${getBasePath()}/${formatPath(_path)}`;
    const finalDoc = doc(firebaseDB, path);
    const data = JSON.stringify(content);
    const encrypted: string = (await eThree.authEncrypt(data)).toString();
    return setDoc(finalDoc, { data: encrypted });
  },
  async get(_path: string) {
    const path = `/${getBasePath()}/${formatPath(_path)}`;
    const docRef = doc(firebaseDB, path);
    const snap = await getDoc(docRef);
    // console.log("get path", path, snap.exists());

    if (snap.exists()) {
      const encryptedData = snap.data().data;
      const unencryptedData: string = (
        await eThree.authDecrypt(encryptedData)
      ).toString();
      // console.log({ unencryptedData });
      return JSON.parse(unencryptedData);
    } else {
      return null;
    }
  },
  async list(): Promise<Array<string>> {
    let files = [];
    const querySnap = await getDocs(collection(firebaseDB, getBasePath()));
    querySnap.forEach((doc) => {
      files.push(`${getBasePath()}/${doc.id}`);
    });
    return files;
  },
  delete(path) {
    // return blockstack.deleteFile(path);
  },
};

export default FirebaseEngine;

import { writable } from "svelte/store";
import { Interact } from "../../store/interact";

// Firebase Includes
import { getStorage } from "firebase/storage";
import { initializeApp } from "firebase/app";
import { getFunctions, httpsCallable } from "firebase/functions";
import {
  getFirestore,
  getDocs,
  collection,
  onSnapshot,
} from "firebase/firestore";

import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from "firebase/auth";

import {
  getProducts,
  getStripePayments,
} from "@stripe/firestore-stripe-payments";

import type { Product, Subscription } from "@stripe/firestore-stripe-payments";

// Get Config
const firebaseConfig = {
  apiKey: `${import.meta.env.VITE_APP_APIKEY}`,
  authDomain: `${import.meta.env.VITE_APP_AUTHDOMAIN}`,
  projectId: `${import.meta.env.VITE_APP_PROJECTID}`,
  storageBucket: `${import.meta.env.VITE_APP_STORAGEBUCKET}`,
  messagingSenderId: `${import.meta.env.VITE_APP_MESSAGINGSENDERID}`,
  appId: `${import.meta.env.VITE_APP_APPID}`,
  measurementId: `${import.meta.env.VITE_APP_MEASUREMENTID}`,
};

export const firebaseApp = initializeApp(firebaseConfig);
export const firebaseAuth = getAuth(firebaseApp);
export const firebaseDB = getFirestore();
export const firebaseFunctions = getFunctions(firebaseApp);
export const storage = getStorage(firebaseApp);

const payments = getStripePayments(firebaseApp, {
  productsCollection: "products",
  customersCollection: "customers",
});

/**
 * Create the Firebase Store
 */

type FirebaseStoreProps = {
  user: any;
  hasAccount: boolean;
  showSignIn: boolean;
  showRegister: boolean;
  jwt?: string;
  plan?: Subscription;
  products: Array<Product>;
  planName?: string;
  planId?: string;
  ready: boolean;
  showLogin: boolean;
  showPlan: boolean;
};

function createFirebaseStore() {
  const firebaseStateBase: FirebaseStoreProps = {
    user: undefined,
    hasAccount: localStorage.getItem("has-nomiecloud") ? true : false,
    showSignIn: false,
    showRegister: false,
    products: [],
    plan: undefined,
    planName: undefined,
    planId: undefined,
    showLogin: false,
    ready: false,
    showPlan: false,
  };
  const { subscribe, update } = writable(firebaseStateBase);

  return {
    subscribe,
    update,
  };
}

/**
 * Export FirebaseStore
 */
export const FirebaseStore = createFirebaseStore();

/**
 * Create an Account
 * @param email
 * @param password
 * @returns
 */
export const createAccount = async (email, password) => {
  return await createUserWithEmailAndPassword(
    firebaseAuth,
    email,
    password
  ).catch((e) => {
    let message = e.message;
    if (e.message.match("invalid-email")) message = "Invalid Email";
    if (e.message.match("user-not-found")) message = "Invalid Account";
    throw new Error(message);
  });
};

/**
 * Sign In
 * @param email
 * @param password
 * @returns
 */
export const signIn = async (email, password) => {
  return await signInWithEmailAndPassword(firebaseAuth, email, password).catch(
    (e) => {
      let message = e.message;
      if (e.message.match("invalid-email")) message = "Invalid Email";
      if (e.message.match("user-not-found")) message = "Invalid Account";
      throw new Error(message);
    }
  );
};

/**
 * Sign Out
 */
export const signOutOfNomieCloud = async () => {
  const confirm = await Interact.confirm(
    "Logout of Nomie Cloud?",
    "You can always log back in"
  );
  if (confirm) signOut(firebaseAuth);
};

export const useLoginModal = () => {
  return [
    () => {
      FirebaseStore.update((s) => {
        s.showLogin = true;
        return s;
      });
    },
    () => {
      FirebaseStore.update((s) => {
        s.showLogin = false;
        return s;
      });
    },
  ];
};

export const usePlanModal = () => {
  return [
    () => {
      FirebaseStore.update((s) => {
        s.showPlan = true;
        return s;
      });
    },
    () => {
      FirebaseStore.update((s) => {
        s.showPlan = false;
        return s;
      });
    },
  ];
};

const loadUserSubscription = (subscriptions: Array<Subscription>) => {
  console.log("Loading user Subscriptions", subscriptions);
  const active: Subscription = subscriptions.find((s) => s.status === "active");
  console.log({ active });
  if (active) {
    const activePlan: any = active.product;

    console.log({ activePlan, id: activePlan.id });
    FirebaseStore.update((s) => {
      const activeProduct: any = s.products.find((p) => p.id === activePlan.id);
      s.plan = active;
      s.planName = activeProduct?.name;
      s.planId = activeProduct?.metadata?.planId;
      s.showPlan = false;
      return s;
    });
  }
};

const getStripeProducts = async (): Promise<Array<Product>> => {
  const freshProducts: Array<Product> = [];
  const prods = await getProducts(payments, {
    includePrices: true,
    activeOnly: true,
  });
  for (const product of prods) {
    freshProducts.push(product);
  }
  return freshProducts;
};

onAuthStateChanged(firebaseAuth, async (user) => {
  if (user) {
    try {
      /*
      Get Virgil Security JWT Token
      */
      const products: Array<Product> = await getStripeProducts();
      const getJWT = httpsCallable(firebaseFunctions, "getVirgilJwt");
      const results: any = await getJWT();
      const token = results.data.token;
      FirebaseStore.update((s: FirebaseStoreProps): any => {
        s.user = user;
        s.showLogin = false;
        s.products = products;
        s.showPlan = false;
        s.jwt = token;
        s.ready = true;
        return s;
      });

      // watch for Subscription
      const subscriptionPath = `/customers/${user.uid}/subscriptions`;
      const subscriptionsCol = collection(firebaseDB, subscriptionPath);
      const querySnap = await getDocs(subscriptionsCol);
      const subscriptions = [];
      querySnap.forEach((doc: any) => {
        const sub: Subscription = doc.data();
        if (sub.status == "active") {
          subscriptions.push(sub);
        }
      });
      if (subscriptions.length) {
        loadUserSubscription(subscriptions);
      } else {
        const unsubscribe = onSnapshot(subscriptionsCol, (colSnapshot) => {
          const subDocs = [];
          colSnapshot.forEach((doc) => {
            subDocs.push(doc.data());
          });
          if (subDocs.find((sub: Subscription) => sub.status === "active")) {
            loadUserSubscription(subDocs);
            unsubscribe();
          }
        });
      }
    } catch (e) {
      alert(e);
    }
  } else {
    FirebaseStore.update((s) => {
      s.user = undefined;
      s.ready = true;
      s.jwt = undefined;
      s.showLogin = true;
      return s;
    });
  }
});

"use client";

import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator, type Firestore } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDthVLJC3-6MFz1CAQ3Fy3ciO54TFHMTDA",
  authDomain: "ibamanager.firebaseapp.com",
  projectId: "ibamanager",
  storageBucket: "ibamanager.firebasestorage.app",
  messagingSenderId: "784060528641",
  appId: "1:784060528641:web:0d2a41630eed67c38fe800",
  measurementId: "G-0C2FEQF1D4"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const storage = getStorage(app);

const shouldUseEmulator =
  (typeof window !== 'undefined' && window.location.hostname === 'localhost') ||
  process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true';

if (shouldUseEmulator) {
  try {
    connectAuthEmulator(auth, 'http://localhost:9099');
    connectStorageEmulator(storage, 'localhost', 9199);
    // eslint-disable-next-line no-console
    console.log('Connected to Firebase emulators (Auth/Storage)');
  } catch (e) {
    // swallow in dev
    // eslint-disable-next-line no-console
    console.warn('Could not connect to Firebase emulators (Auth/Storage)', e);
  }
}

let db: Firestore;
if (shouldUseEmulator) {
  db = getFirestore(app);
  try {
    connectFirestoreEmulator(db, 'localhost', 8080);
    // eslint-disable-next-line no-console
    console.log('Connected to Firebase emulator (Firestore)');
  } catch (e) {
    // swallow in dev
    // eslint-disable-next-line no-console
    console.warn('Could not connect to Firestore emulator', e);
  }
} else {
  db = getFirestore(app);
}

export async function getFirebaseAnalytics() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const supported = await isSupported();
    return supported ? getAnalytics(app) : null;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn("Firebase analytics not supported in this environment", error);
    return null;
  }
}

export { auth, db, storage };


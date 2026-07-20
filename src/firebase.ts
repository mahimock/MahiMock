import { initializeApp } from "firebase/app";
import { getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import firebaseConfig from "./firebase-applet-config.json";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = initializeFirestore(app, { localCache: persistentLocalCache({tabManager: persistentMultipleTabManager()}) });
export const auth = getAuth(app);
export const storage = getStorage(app);

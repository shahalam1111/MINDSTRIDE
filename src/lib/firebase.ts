
import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";
// import { getAuth } from "firebase/auth"; // For future Firebase Auth integration
// import { getStorage } from "firebase/storage"; // For future Firebase Storage integration

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

let app: FirebaseApp | null = null;
let dbInstance: Firestore | null = null;

// Only initialize Firebase if a projectId is actually set.
if (firebaseConfig.projectId && typeof firebaseConfig.projectId === 'string' && firebaseConfig.projectId.trim() !== '') {
  if (!getApps().length) {
    try {
      app = initializeApp(firebaseConfig);
      dbInstance = getFirestore(app);
      console.log("MINDSTRIDE: Firebase initialized with Firestore.");
      // Note: Firestore offline persistence (enableIndexedDbPersistence) has been removed for now.
      // It can be re-enabled if/when Firestore is fully configured and desired.
    } catch (e) {
      console.error("MINDSTRIDE: Firebase initialization failed:", e);
      app = null;
      dbInstance = null;
    }
  } else {
    app = getApps()[0];
    dbInstance = getFirestore(app);
    // console.log("MINDSTRIDE: Firebase app already initialized. Using existing Firestore instance.");
  }
} else {
  console.warn("MINDSTRIDE: Firebase project ID is missing or invalid in environment variables. Firestore functionality will be disabled. The app will rely on localStorage.");
}

export const db = dbInstance; // This will be null if projectId is missing or initialization fails
export { app /*, auth, storage */ };


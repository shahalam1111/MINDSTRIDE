
import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getFirestore, type Firestore, enableIndexedDbPersistence, CACHE_SIZE_UNLIMITED } from "firebase/firestore";
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

let app: FirebaseApp;
let dbInstance: Firestore;

if (!getApps().length) {
  app = initializeApp(firebaseConfig);
  dbInstance = getFirestore(app);
  enableIndexedDbPersistence(dbInstance, { cacheSizeBytes: CACHE_SIZE_UNLIMITED })
    .then(() => {
      console.log("Firestore offline persistence enabled successfully.");
    })
    .catch((err) => {
      if (err.code === 'failed-precondition') {
        console.warn(
          "MINDSTRIDE: Firestore offline persistence failed. This can happen if multiple tabs are open or due to other browser limitations. Data might not be available offline in this tab."
        );
      } else if (err.code === 'unimplemented') {
        console.warn(
          "MINDSTRIDE: Firestore offline persistence is not supported in this browser environment. Data will not be available offline."
        );
      } else {
        console.error("MINDSTRIDE: An unexpected error occurred while enabling Firestore offline persistence: ", err);
      }
    });
} else {
  app = getApps()[0];
  // If app is already initialized, get the Firestore instance.
  // Persistence should have been enabled by the first initializer.
  dbInstance = getFirestore(app); 
}

export const db = dbInstance;
export { app /*, auth, storage */ };

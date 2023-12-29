import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB3HAVSfiQJupJRFrddIig37teING57iTw",
  authDomain: "rn-data-collection.firebaseapp.com",
  projectId: "rn-data-collection",
  storageBucket: "rn-data-collection.appspot.com",
  messagingSenderId: "724654499739",
  appId: "1:724654499739:web:b9a36f49cb9a5bf593a33e",
};

export const FIREBASE_APP = initializeApp(firebaseConfig);
export const FIREBASE_AUTH = getAuth(FIREBASE_APP);
export const FIREBASE_DB = getFirestore(FIREBASE_APP);

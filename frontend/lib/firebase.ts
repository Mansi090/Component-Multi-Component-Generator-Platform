// lib/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyC8Uudh6A_r_oXA-pndd1WBvxwPFxg05uU",
  authDomain: "assignment-25329.firebaseapp.com",
  projectId: "assignment-25329",
  storageBucket: "assignment-25329.appspot.com",
  messagingSenderId: "933548595133",
  appId: "1:933548595133:web:5240aa13f382711b0524d4",
  measurementId: "G-M9714LNHJ2",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

if (typeof window !== "undefined") {
  isSupported().then((yes) => {
    if (yes) getAnalytics(app);
  });
}

export { auth, db };

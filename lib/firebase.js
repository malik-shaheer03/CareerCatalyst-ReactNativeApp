import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDb54fsYS5FPVrq73sexiGXEAc3W8kwfns",
  authDomain: "careercatalyst-a6a21.firebaseapp.com",
  projectId: "careercatalyst-a6a21",
  storageBucket: "careercatalyst-a6a21.firebasestorage.app",
  messagingSenderId: "561831437444",
  appId: "1:561831437444:web:d91e056cb8929f7cc10ed1",
  measurementId: "G-8D6396JRVR",
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };

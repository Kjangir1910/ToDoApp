// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyCAOEsX7G6kiowGbCQXfAcrzu7dQA8hVtM",
    authDomain: "todo-98154.firebaseapp.com",
    projectId: "todo-98154",
    storageBucket: "todo-98154.appspot.com",
    messagingSenderId: "435500799236",
    appId: "1:435500799236:web:09f7d62f4781e1b9096c51",
    measurementId: "G-LPSDV2LEXS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };

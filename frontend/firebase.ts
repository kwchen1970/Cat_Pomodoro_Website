import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration

const firebaseConfig = {
    apiKey: "AIzaSyBg1fGNLDrEv39ogUBVV95o4rKkiEaWOyc",
    authDomain: "cat-pomodoro-59fea.firebaseapp.com",
    projectId: "cat-pomodoro-59fea",
    storageBucket: "cat-pomodoro-59fea.firebasestorage.app",
    messagingSenderId: "455175424781",
    appId: "1:455175424781:web:0fbdbf96b0ba1bf6a53e44"
  };
// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

export const auth = getAuth(app);
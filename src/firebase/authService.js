// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC3vs9Gr101g8FMIDSS5fWim-sXZ_6hpm4",
  authDomain: "aces-3e9a5.firebaseapp.com",
  projectId: "aces-3e9a5",
  storageBucket: "aces-3e9a5.firebasestorage.app",
  messagingSenderId: "10039456663",
  appId: "1:10039456663:web:80522ee7c2921f138f8ad2",
  measurementId: "G-ELZQEH2GGQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
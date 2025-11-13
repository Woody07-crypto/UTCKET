// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCaIVIY5kRZNMeq50f5XZacJFKUPHx22yM",
  authDomain: "utcket.firebaseapp.com",
  projectId: "utcket",
  storageBucket: "utcket.firebasestorage.app",
  messagingSenderId: "340782027820",
  appId: "1:340782027820:web:6df648a16bec7a30c92d89",
  measurementId: "G-7FTLD4BRV0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
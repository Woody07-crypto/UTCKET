// Import Firebase core SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js";

// Tu configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCaIVIY5kRZNMeq50f5XZacJFKUPHx22yM",
  authDomain: "utcket.firebaseapp.com",
  projectId: "utcket",
  storageBucket: "utcket.firebasestorage.app",
  messagingSenderId: "340782027820",
  appId: "1:340782027820:web:6df648a16bec7a30c92d89",
  measurementId: "G-7FTLD4BRV0"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar Firestore
export const db = getFirestore(app);

// (Opcional) Analytics — evita error en local
let analytics = null;
try {
  analytics = getAnalytics(app);
} catch (e) {
  console.warn("Analytics no disponible en este entorno", e);
}

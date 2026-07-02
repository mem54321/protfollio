// firebase-config.js - Placeholder for actual Firebase configuration
// To use Firebase, add your config here and initialize
// import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
// import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// const app = initializeApp(firebaseConfig);
// export const db = getFirestore(app);

// We are using local DB.js for now so the app works immediately.
export const isFirebaseEnabled = false;

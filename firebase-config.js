import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyB5R46A1j_RQN1W2UuRLZPJqJcauyOIAWE",
  authDomain: "tuition-finder-bd6d8.firebaseapp.com",
  projectId: "tuition-finder-bd6d8",
  storageBucket: "tuition-finder-bd6d8.firebasestorage.app",
  messagingSenderId: "493282941073",
  appId: "1:493282941073:web:4558fffe45d49668cb4730"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
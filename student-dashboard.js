import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const welcomeText = document.getElementById("welcome-text");
const logoutLink = document.getElementById("logout-link");

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  const userDoc = await getDoc(doc(db, "users", user.uid));
  if (userDoc.exists()) {
    welcomeText.textContent = `Welcome, ${userDoc.data().name}!`;
  }
});

logoutLink.addEventListener("click", async (e) => {
  e.preventDefault();
  await signOut(auth);
  window.location.href = "login.html";
});
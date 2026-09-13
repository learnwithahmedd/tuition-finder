import { auth, db } from "./firebase-config.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const emailInput = document.getElementById("email-input");
const passwordInput = document.getElementById("password-input");
const loginBtn = document.getElementById("login-btn");
const authMessage = document.getElementById("auth-message");

loginBtn.addEventListener("click", async () => {
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  if (!email || !password) {
    authMessage.textContent = "Please enter your email and password.";
    return;
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;

    const userDoc = await getDoc(doc(db, "users", uid));

    if (userDoc.exists()) {
      const role = userDoc.data().role;
      if (role === "teacher") {
        window.location.href = "teacher-dashboard.html";
      } else {
        window.location.href = "student-dashboard.html";
      }
    } else {
      authMessage.textContent = "No profile found for this account.";
    }

  } catch (error) {
    authMessage.textContent = "Login failed: " + error.message;
  }
});
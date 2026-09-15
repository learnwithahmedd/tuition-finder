import { auth, db } from "./firebase-config.js";
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { sendEmailVerification } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const nameInput = document.getElementById("name-input");
const emailInput = document.getElementById("email-input");
const passwordInput = document.getElementById("password-input");
const signupBtn = document.getElementById("signup-btn");
const authMessage = document.getElementById("auth-message");

signupBtn.addEventListener("click", async () => {
  const name = nameInput.value.trim();
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();
  const roleRadio = document.querySelector('input[name="role"]:checked');

  if (!name || !email || !password || !roleRadio) {
    authMessage.textContent = "Please fill in all fields and choose a role.";
    return;
  }

  const role = roleRadio.value;

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;
    await sendEmailVerification(userCredential.user);
   
    await setDoc(doc(db, "users", uid), {
      name: name,
      email: email,
      role: role
      
    });

    authMessage.textContent = "Account created! Redirecting...";

    if (role === "teacher") {
      window.location.href = "teacher-dashboard.html";
    } else {
      window.location.href = "student-dashboard.html";
    }

  } catch (error) {
    authMessage.textContent = error.message;
  }
});

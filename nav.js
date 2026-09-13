import { auth } from "./firebase-config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { db } from "./firebase-config.js";

const navLinks = document.getElementById("nav-links");

onAuthStateChanged(auth, async (user) => {
  if (user) {
    const userDoc = await getDoc(doc(db, "users", user.uid));
    const role = userDoc.exists() ? userDoc.data().role : null;
    const dashboardPage = role === "teacher" ? "teacher-dashboard.html" : "student-dashboard.html";

    navLinks.innerHTML = `
      <a href="index.html">Search</a>
      <a href="${dashboardPage}">Dashboard</a>
      <a href="#" id="nav-logout">Log out</a>
    `;

    document.getElementById("nav-logout").addEventListener("click", async (e) => {
      e.preventDefault();
      await signOut(auth);
      window.location.href = "login.html";
    });

  } else {
    navLinks.innerHTML = `
      <a href="index.html">Search</a>
      <a href="login.html">Log in</a>
      <a href="signup.html">Sign up</a>
    `;
  }
});
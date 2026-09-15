import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const ADMIN_EMAIL = "YOUR_EMAIL_HERE@gmail.com";

onAuthStateChanged(auth, async (user) => {
  if (!user || user.email !== ADMIN_EMAIL) {
    document.body.innerHTML = "<p style='text-align:center; margin-top:50px;'>Access denied.</p>";
    return;
  }

  const usersSnap = await getDocs(collection(db, "users"));
  document.getElementById("users-list").innerHTML = usersSnap.docs.map(d => {
    const u = d.data();
    return `<p>${u.name} — ${u.email} (${u.role})</p>`;
  }).join("");

  const listingsSnap = await getDocs(collection(db, "listings"));
  document.getElementById("listings-list").innerHTML = listingsSnap.docs.map(d => {
    const l = d.data();
    return `<p>${l.subject} by ${l.name} — Rs. ${l.price} (${l.location})</p>`;
  }).join("");
});
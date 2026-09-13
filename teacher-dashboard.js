import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { doc, getDoc, collection, addDoc, query, where, getDocs, deleteDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const welcomeText = document.getElementById("welcome-text");
const subjectInput = document.getElementById("subject-input");
const locationInput = document.getElementById("location-input");
const priceInput = document.getElementById("price-input");
const phoneInput = document.getElementById("phone-input");
const modeInput = document.getElementById("mode-input");
const saveBtn = document.getElementById("save-btn");
const statusMessage = document.getElementById("status-message");
const tutorList = document.getElementById("tutor-list");
const logoutLink = document.getElementById("logout-link");

let currentUser = null;
let teacherName = "";

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  currentUser = user;

  const userDoc = await getDoc(doc(db, "users", user.uid));
  if (userDoc.exists()) {
    teacherName = userDoc.data().name;
    welcomeText.textContent = `Welcome, ${teacherName}!`;
  }

  loadMyListings();
});

saveBtn.addEventListener("click", async () => {
  const subject = subjectInput.value.trim();
  const location = locationInput.value.trim();
  const price = priceInput.value.trim();
  const phone = phoneInput.value.trim();
  const mode = modeInput.value;

  if (!subject || !location || !price) {
    statusMessage.textContent = "Please fill in all fields.";
    return;
  }

  try {
    await addDoc(collection(db, "listings"), {
      teacherId: currentUser.uid,
      name: teacherName,
      subject: subject,
      location: location,
      price: Number(price),
      phone: phone,
      mode: mode,
      rating: 4.5
    });

    statusMessage.textContent = "Listing saved!";
    subjectInput.value = "";
    locationInput.value = "";
    priceInput.value = "";
    phoneInput.value = "";
    loadMyListings();

  } catch (error) {
    statusMessage.textContent = "Error: " + error.message;
  }
});

async function loadMyListings() {
 tutorList.innerHTML = "<h3 style='text-align:center; margin-bottom: 10px;'>Your Listings</h3><p style='text-align:center;'>Loading...</p>";

  const q = query(collection(db, "listings"), where("teacherId", "==", currentUser.uid));
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    tutorList.innerHTML += "<p style='text-align:center;'>You haven't added any listings yet.</p>";
    return;
  }

  snapshot.forEach((docSnap) => {
    const listing = docSnap.data();
    const card = document.createElement("div");
    card.className = "tutor-card";
    card.innerHTML = `
      <h3>${listing.subject}</h3>
      <p><strong>Location:</strong> ${listing.location}</p>
      <p><strong>Price:</strong> Rs. ${listing.price}</p>
      <p><strong>Mode:</strong> ${listing.mode}</p>
      <button class="delete-btn" data-id="${docSnap.id}">Delete</button>
    `;
    tutorList.appendChild(card);
  });

  document.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      await deleteDoc(doc(db, "listings", btn.dataset.id));
      loadMyListings();
    });
  });
}

logoutLink.addEventListener("click", async (e) => {
  e.preventDefault();
  await signOut(auth);
  window.location.href = "login.html";
});
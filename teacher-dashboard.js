import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { doc, getDoc, updateDoc, collection, addDoc, query, where, getDocs, deleteDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const welcomeText = document.getElementById("welcome-text");
const subjectInput = document.getElementById("subject-input");
const locationInput = document.getElementById("location-input");
const priceInput = document.getElementById("price-input");
const phoneInput = document.getElementById("phone-input");
const modeInput = document.getElementById("mode-input");
const bioInput = document.getElementById("bio-input");
const saveBtn = document.getElementById("save-btn");
const cancelEditBtn = document.getElementById("cancel-edit-btn");
const statusMessage = document.getElementById("status-message");
const tutorList = document.getElementById("tutor-list");
const logoutLink = document.getElementById("logout-link");

let currentUser = null;
let teacherName = "";
let editingId = null; // tracks which listing (if any) is being edited

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }
  currentUser = user;
  if (!user.emailVerified) {
  const banner = document.createElement("p");
  banner.textContent = "⚠️ Please verify your email — check your inbox.";
  banner.style.cssText = "text-align:center; background:#fff3cd; color:#856404; padding:10px; border-radius:8px; margin: 10px auto; max-width:600px;";
  document.querySelector("main").prepend(banner);
}
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
const bio = bioInput.value.trim();
  const mode = modeInput.value;

  if (!subject || !location || !price) {
    statusMessage.textContent = "Please fill in all fields.";
    return;
  }

  try {
    if (editingId) {
      // Update the existing listing instead of creating a new one
     await updateDoc(doc(db, "listings", editingId), {
  subject, location, price: Number(price), phone, bio, mode
});
      statusMessage.textContent = "Listing updated!";
      exitEditMode();
    } else {
      await addDoc(collection(db, "listings"), {
      teacherId: currentUser.uid,
      name: teacherName,
      subject, location, price: Number(price), phone, bio, mode,
      rating: 4.5
});
      statusMessage.textContent = "Listing saved!";
    }

    subjectInput.value = "";
    locationInput.value = "";
    priceInput.value = "";
    phoneInput.value = "";
    bioInput.value = "";
    loadMyListings();

  } catch (error) {
    statusMessage.textContent = "Error: " + error.message;
  }
});

function enterEditMode(listing, id) {
  editingId = id;
  subjectInput.value = listing.subject;
  locationInput.value = listing.location;
  priceInput.value = listing.price;
  phoneInput.value = listing.phone || "";
  modeInput.value = listing.mode;
  saveBtn.textContent = "Update Listing";
  cancelEditBtn.style.display = "inline-block";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function exitEditMode() {
  editingId = null;
  saveBtn.textContent = "Save Listing";
  cancelEditBtn.style.display = "none";
}

cancelEditBtn.addEventListener("click", () => {
  exitEditMode();
  subjectInput.value = "";
  locationInput.value = "";
  priceInput.value = "";
  phoneInput.value = "";
  bioInput.value = "";
});

async function loadMyListings() {
  tutorList.innerHTML = "<h3>Your Listings</h3><p style='text-align:center;'>Loading...</p>";

  const q = query(collection(db, "listings"), where("teacherId", "==", currentUser.uid));
  const snapshot = await getDocs(q);

  tutorList.innerHTML = "<h3>Your Listings</h3>";

  if (snapshot.empty) {
    tutorList.innerHTML += "<div class='empty-state'>📭<p>You haven't added any listings yet.</p></div>";
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
      <button class="edit-btn" data-id="${docSnap.id}">Edit</button>
      <button class="delete-btn" data-id="${docSnap.id}">Delete</button>
    `;
    tutorList.appendChild(card);

    card.querySelector(".edit-btn").addEventListener("click", () => enterEditMode(listing, docSnap.id));
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
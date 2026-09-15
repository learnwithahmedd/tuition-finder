import { db, auth } from "./firebase-config.js";
import { collection, getDocs, addDoc, query, where } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { addDoc as addFavDoc, deleteDoc, query as favQuery, where as favWhere } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

function renderStars(rating) {
  const fullStars = Math.floor(rating);
  const hasHalf = rating - fullStars >= 0.5;
  let stars = "★".repeat(fullStars);
  if (hasHalf) stars += "½";
  const emptyCount = 5 - fullStars - (hasHalf ? 1 : 0);
  stars += "☆".repeat(Math.max(emptyCount, 0));
  return stars;
}
let tutors = [];
let favorites = []; // now loaded from Firestore per logged-in student
let loggedInStudent = null;

onAuthStateChanged(auth, async (user) => {
  loggedInStudent = user;
  if (user) {
    const q = favQuery(collection(db, "favorites"), favWhere("studentId", "==", user.uid));
    const snapshot = await getDocs(q);
    favorites = snapshot.docs.map(d => ({ id: d.id, listingId: d.data().listingId }));
  }
  displayTutors(tutors);
});

const tutorList = document.getElementById("tutor-list");
const resultsCount = document.getElementById("results-count");

async function getAverageRating(listingId, fallback) {
  const q = query(collection(db, "reviews"), where("listingId", "==", listingId));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return { avg: fallback, count: 0 };

  let total = 0;
  snapshot.forEach(doc => total += doc.data().rating);
  return { avg: (total / snapshot.size).toFixed(1), count: snapshot.size };
}

async function displayTutors(list) {
  tutorList.innerHTML = "";
  resultsCount.textContent = `${list.length} tutor${list.length !== 1 ? "s" : ""} found`;

  if (list.length === 0) {
    tutorList.innerHTML = "<div class='empty-state'>🔍<p>No tutors match your search.</p></div>";
    return;
  }

  for (const tutor of list) {
    const { avg, count } = await getAverageRating(tutor.id, tutor.rating);

    const card = document.createElement("div");
    card.className = "tutor-card" + (avg >= 4.7 ? " top-rated" : "");

    const isFavorited = favorites.some(f => f.listingId === tutor.id);
    const whatsappLink = tutor.phone
      ? `https://wa.me/${tutor.phone}?text=Hi%20${encodeURIComponent(tutor.name)},%20I%20found%20you%20on%20Tuition%20Finder%20and%20I'm%20interested%20in%20${encodeURIComponent(tutor.subject)}%20tuition.`
      : null;

    card.innerHTML = `
      ${avg >= 4.7 ? '<span class="top-badge">🏆 Top Rated</span>' : ""}
     <button class="favorite-btn ${isFavorited ? "active" : ""}" data-id="${tutor.id}">
        ${isFavorited ? "❤️" : "🤍"}
      </button>
      <div class="card-top">
        <div class="avatar">${tutor.name.charAt(0)}</div>
        <h3>${tutor.name}</h3>
        <span class="rating"><span class="stars">${renderStars(avg)}</span> ${avg} ${count > 0 ? `(${count})` : ""}</span>
      </div>
      <p><strong>Subject:</strong> ${tutor.subject}</p>
      <p><strong>Location:</strong> ${tutor.location}</p>
      <p><strong>Price:</strong> Rs. ${tutor.price}</p>
      <p><strong>Mode:</strong> ${tutor.mode}</p>
      ${tutor.bio ? `<p class="tutor-bio">${tutor.bio}</p>` : ""}
      ${whatsappLink ? `<a class="contact-btn" href="${whatsappLink}" target="_blank">Contact via WhatsApp</a>` : ""}
      ${loggedInStudent ? `<button class="review-btn" data-id="${tutor.id}" data-name="${tutor.name}">Leave a Review</button>` : ""}
    `;
    tutorList.appendChild(card);
  }

  document.querySelectorAll(".favorite-btn").forEach(btn => {
    btn.addEventListener("click", () => toggleFavorite(btn.dataset.name, btn));
  });

  document.querySelectorAll(".review-btn").forEach(btn => {
    btn.addEventListener("click", () => submitReview(btn.dataset.id, btn.dataset.name));
  });
}

async function toggleFavorite(listingId, btn) {
  if (!loggedInStudent) {
    alert("Please log in as a student to save tutors.");
    return;
  }

  const existing = favorites.find(f => f.listingId === listingId);

  if (existing) {
    await deleteDoc(doc(db, "favorites", existing.id));
    favorites = favorites.filter(f => f.listingId !== listingId);
    btn.classList.remove("active");
    btn.textContent = "🤍";
  } else {
    const newFav = await addFavDoc(collection(db, "favorites"), {
      studentId: loggedInStudent.uid,
      listingId: listingId
    });
    favorites.push({ id: newFav.id, listingId });
    btn.classList.add("active");
    btn.textContent = "❤️";
  }
}
  localStorage.setItem("favorites", JSON.stringify(favorites));


async function submitReview(listingId, tutorName) {
  const ratingStr = prompt(`Rate ${tutorName} out of 5 (e.g. 4.5):`);
  const rating = parseFloat(ratingStr);

  if (!rating || rating < 1 || rating > 5) {
    alert("Please enter a valid rating between 1 and 5.");
    return;
  }

  const comment = prompt("Optional: leave a short comment") || "";

  await addDoc(collection(db, "reviews"), {
    listingId: listingId,
    studentId: loggedInStudent.uid,
    rating: rating,
    comment: comment
  });

  alert("Thanks for your review!");
  filterTutors();
}

async function loadListings() {
  tutorList.innerHTML = Array(3).fill(`
    <div class="skeleton-card">
      <div class="skeleton-line skeleton-title"></div>
      <div class="skeleton-line"></div>
      <div class="skeleton-line"></div>
      <div class="skeleton-line short"></div>
    </div>
  `).join("");

  const snapshot = await getDocs(collection(db, "listings"));
  tutors = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  const heroCount = document.getElementById("hero-count");
  if (heroCount) heroCount.textContent = `${tutors.length} tutor${tutors.length !== 1 ? "s" : ""} ready to help you`;

  displayTutors(tutors);
}

loadListings();

const nameInput = document.getElementById("name-input");
const subjectInput = document.getElementById("subject-input");
const locationInput = document.getElementById("location-input");
const priceInput = document.getElementById("price-input");
const modeInput = document.getElementById("mode-input");
const sortInput = document.getElementById("sort-input");
const searchBtn = document.getElementById("search-btn");
const resetBtn = document.getElementById("reset-btn");

function filterTutors() {
  const nameValue = nameInput.value.trim().toLowerCase();
  const subjectValue = subjectInput.value.trim().toLowerCase();
  const locationValue = locationInput.value.trim().toLowerCase();
  const priceValue = priceInput.value.trim();
  const modeValue = modeInput.value;
  const sortValue = sortInput.value;

  let filtered = tutors.filter(tutor => {
    const matchesName = nameValue === "" || tutor.name.toLowerCase().includes(nameValue);
    const matchesSubject = subjectValue === "" || tutor.subject.toLowerCase().includes(subjectValue);
    const matchesLocation = locationValue === "" || tutor.location.toLowerCase().includes(locationValue);
    const matchesPrice = priceValue === "" || tutor.price <= Number(priceValue);
    const matchesMode = modeValue === "" || tutor.mode === modeValue;

    return matchesName && matchesSubject && matchesLocation && matchesPrice && matchesMode;
  });

  if (sortValue === "price-low") {
    filtered = filtered.slice().sort((a, b) => a.price - b.price);
  } else if (sortValue === "rating-high") {
    filtered = filtered.slice().sort((a, b) => b.rating - a.rating);
  }

  displayTutors(filtered);
}

searchBtn.addEventListener("click", filterTutors);
sortInput.addEventListener("change", filterTutors);

[nameInput, subjectInput, locationInput, priceInput].forEach(input => {
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") filterTutors();
  });
});

resetBtn.addEventListener("click", () => {
  nameInput.value = "";
  subjectInput.value = "";
  locationInput.value = "";
  priceInput.value = "";
  modeInput.value = "";
  sortInput.value = "";
  bioInput.value = "";
  displayTutors(tutors);
});
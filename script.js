import { db } from "./firebase-config.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

let tutors = []; // filled from Firestore
let favorites = JSON.parse(localStorage.getItem("favorites") || "[]");

const tutorList = document.getElementById("tutor-list");
const resultsCount = document.getElementById("results-count");

function displayTutors(list) {
  tutorList.innerHTML = "";
  resultsCount.textContent = `${list.length} tutor${list.length !== 1 ? "s" : ""} found`;

  if (list.length === 0) {
    tutorList.innerHTML = "<p>No tutors match your search.</p>";
    return;
  }

  list.forEach(tutor => {
    const card = document.createElement("div");
    card.className = "tutor-card" + (tutor.rating >= 4.7 ? " top-rated" : "");

    const isFavorited = favorites.includes(tutor.name);
    const whatsappLink = tutor.phone
      ? `https://wa.me/${tutor.phone}?text=Hi%20${encodeURIComponent(tutor.name)},%20I%20found%20you%20on%20Tuition%20Finder%20and%20I'm%20interested%20in%20${encodeURIComponent(tutor.subject)}%20tuition.`
      : null;

    card.innerHTML = `
      ${tutor.rating >= 4.7 ? '<span class="top-badge">🏆 Top Rated</span>' : ""}
      <button class="favorite-btn ${isFavorited ? "active" : ""}" data-name="${tutor.name}">
        ${isFavorited ? "❤️" : "🤍"}
      </button>
      <div class="card-top">
        <div class="avatar">${tutor.name.charAt(0)}</div>
        <h3>${tutor.name}</h3>
        <span class="rating">⭐ ${tutor.rating}</span>
      </div>
      <p><strong>Subject:</strong> ${tutor.subject}</p>
      <p><strong>Location:</strong> ${tutor.location}</p>
      <p><strong>Price:</strong> Rs. ${tutor.price}</p>
      <p><strong>Mode:</strong> ${tutor.mode}</p>
      ${whatsappLink ? `<a class="contact-btn" href="${whatsappLink}" target="_blank">Contact via WhatsApp</a>` : ""}
    `;
    tutorList.appendChild(card);
  });

  document.querySelectorAll(".favorite-btn").forEach(btn => {
    btn.addEventListener("click", () => toggleFavorite(btn.dataset.name, btn));
  });
}

function toggleFavorite(name, btn) {
  if (favorites.includes(name)) {
    favorites = favorites.filter(n => n !== name);
    btn.classList.remove("active");
    btn.textContent = "🤍";
  } else {
    favorites.push(name);
    btn.classList.add("active");
    btn.textContent = "❤️";
  }
  localStorage.setItem("favorites", JSON.stringify(favorites));
}

async function loadListings() {
  tutorList.innerHTML = "<p style='text-align:center;'>Loading tutors...</p>";
  const snapshot = await getDocs(collection(db, "listings"));
  tutors = snapshot.docs.map(doc => doc.data());
  displayTutors(tutors);
}

loadListings();

const subjectInput = document.getElementById("subject-input");
const locationInput = document.getElementById("location-input");
const priceInput = document.getElementById("price-input");
const modeInput = document.getElementById("mode-input");
const sortInput = document.getElementById("sort-input");
const searchBtn = document.getElementById("search-btn");
const resetBtn = document.getElementById("reset-btn");

function filterTutors() {
  const subjectValue = subjectInput.value.trim().toLowerCase();
  const locationValue = locationInput.value.trim().toLowerCase();
  const priceValue = priceInput.value.trim();
  const modeValue = modeInput.value;
  const sortValue = sortInput.value;

  let filtered = tutors.filter(tutor => {
    const matchesSubject = subjectValue === "" || tutor.subject.toLowerCase().includes(subjectValue);
    const matchesLocation = locationValue === "" || tutor.location.toLowerCase().includes(locationValue);
    const matchesPrice = priceValue === "" || tutor.price <= Number(priceValue);
    const matchesMode = modeValue === "" || tutor.mode === modeValue;

    return matchesSubject && matchesLocation && matchesPrice && matchesMode;
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

[subjectInput, locationInput, priceInput].forEach(input => {
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      filterTutors();
    }
  });
});

resetBtn.addEventListener("click", () => {
  subjectInput.value = "";
  locationInput.value = "";
  priceInput.value = "";
  modeInput.value = "";
  sortInput.value = "";
  displayTutors(tutors);
});
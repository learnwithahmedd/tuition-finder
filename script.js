// Sample tutor data (later this could come from a real database)
const tutors = [
  { name: "Ayesha Khan", subject: "Math", location: "Rawalpindi", price: 1500, rating: 4.8, mode: "Online", phone: "923001234567" },
  { name: "Bilal Ahmed", subject: "Physics", location: "Islamabad", price: 2000, rating: 4.5, mode: "In-person", phone: "923001234568" },
  { name: "Sara Malik", subject: "English", location: "Rawalpindi", price: 1200, rating: 4.9, mode: "Online", phone: "923001234569" },
  { name: "Usman Tariq", subject: "Chemistry", location: "Lahore", price: 1800, rating: 4.2, mode: "In-person", phone: "923001234570" },
  { name: "Hina Raza", subject: "Math", location: "Islamabad", price: 1600, rating: 4.7, mode: "Online", phone: "923001234571" },
  { name: "Ali Hassan", subject: "Biology", location: "Rawalpindi", price: 1700, rating: 4.3, mode: "In-person", phone: "923001234572" },
  { name: "Fatima Sheikh", subject: "English", location: "Islamabad", price: 1400, rating: 4.6, mode: "Online", phone: "923001234573" },
  { name: "Zain Abbas", subject: "Computer Science", location: "Lahore", price: 2200, rating: 4.9, mode: "Online", phone: "923001234574" },
  { name: "Noor Fatima", subject: "Physics", location: "Rawalpindi", price: 1900, rating: 4.4, mode: "In-person", phone: "923001234575" },
  { name: "Danish Iqbal", subject: "Math", location: "Lahore", price: 1300, rating: 4.1, mode: "In-person", phone: "923001234576" }
];

// Load saved favorites from the browser (persists across refreshes)
let favorites = JSON.parse(localStorage.getItem("favorites") || "[]");

// Grab the container where tutor cards will go
const tutorList = document.getElementById("tutor-list");
const resultsCount = document.getElementById("results-count");

// Function to display a list of tutors on the page
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
    const whatsappLink = `https://wa.me/${tutor.phone}?text=Hi%20${encodeURIComponent(tutor.name)},%20I%20found%20you%20on%20Tuition%20Finder%20and%20I'm%20interested%20in%20${encodeURIComponent(tutor.subject)}%20tuition.`;

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
      <a class="contact-btn" href="${whatsappLink}" target="_blank">Contact via WhatsApp</a>
    `;
    tutorList.appendChild(card);
  });

  // Attach click handlers to all favorite buttons just created
  document.querySelectorAll(".favorite-btn").forEach(btn => {
    btn.addEventListener("click", () => toggleFavorite(btn.dataset.name, btn));
  });
}

// Add or remove a tutor from favorites, and save to the browser
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

// Show all tutors when the page first loads
displayTutors(tutors);

// Grab the search inputs and buttons
const subjectInput = document.getElementById("subject-input");
const locationInput = document.getElementById("location-input");
const priceInput = document.getElementById("price-input");
const modeInput = document.getElementById("mode-input");
const sortInput = document.getElementById("sort-input");
const searchBtn = document.getElementById("search-btn");
const resetBtn = document.getElementById("reset-btn");

// Function that filters (and sorts) tutors based on what the user selected
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

// Run filterTutors() whenever the Search button is clicked, or sort changes
searchBtn.addEventListener("click", filterTutors);
sortInput.addEventListener("change", filterTutors);

// Let Enter key trigger search too
[subjectInput, locationInput, priceInput].forEach(input => {
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      filterTutors();
    }
  });
});

// Reset button clears inputs and shows all tutors again
resetBtn.addEventListener("click", () => {
  subjectInput.value = "";
  locationInput.value = "";
  priceInput.value = "";
  modeInput.value = "";
  sortInput.value = "";
  displayTutors(tutors);
});
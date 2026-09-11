// Sample tutor data (later this could come from a real database)
const tutors = [
  { name: "Ayesha Khan", subject: "Math", location: "Rawalpindi", price: 1500, rating: 4.8, mode: "Online" },
  { name: "Bilal Ahmed", subject: "Physics", location: "Islamabad", price: 2000, rating: 4.5, mode: "In-person" },
  { name: "Sara Malik", subject: "English", location: "Rawalpindi", price: 1200, rating: 4.9, mode: "Online" },
  { name: "Usman Tariq", subject: "Chemistry", location: "Lahore", price: 1800, rating: 4.2, mode: "In-person" },
  { name: "Hina Raza", subject: "Math", location: "Islamabad", price: 1600, rating: 4.7, mode: "Online" },
  { name: "Ali Hassan", subject: "Biology", location: "Rawalpindi", price: 1700, rating: 4.3, mode: "In-person" },
  { name: "Fatima Sheikh", subject: "English", location: "Islamabad", price: 1400, rating: 4.6, mode: "Online" },
  { name: "Zain Abbas", subject: "Computer Science", location: "Lahore", price: 2200, rating: 4.9, mode: "Online" },
  { name: "Noor Fatima", subject: "Physics", location: "Rawalpindi", price: 1900, rating: 4.4, mode: "In-person" },
  { name: "Danish Iqbal", subject: "Math", location: "Lahore", price: 1300, rating: 4.1, mode: "In-person" }
];

// Grab the container where tutor cards will go
const tutorList = document.getElementById("tutor-list");

// Function to display a list of tutors on the page
function displayTutors(list) {
  tutorList.innerHTML = ""; // clear old content

  if (list.length === 0) {
    tutorList.innerHTML = "<p>No tutors match your search.</p>";
    return;
  }

  list.forEach(tutor => {
    const card = document.createElement("div");
    card.className = "tutor-card";
    card.innerHTML = `
      <div class="card-top">
        <div class="avatar">${tutor.name.charAt(0)}</div>
        <h3>${tutor.name}</h3>
        <span class="rating">⭐ ${tutor.rating}</span>
      </div>
      <p><strong>Subject:</strong> ${tutor.subject}</p>
      <p><strong>Location:</strong> ${tutor.location}</p>
      <p><strong>Price:</strong> Rs. ${tutor.price}</p>
      <p><strong>Mode:</strong> ${tutor.mode}</p>
    `;
    tutorList.appendChild(card);
  });
}

// Show all tutors when the page first loads
displayTutors(tutors);

// Grab the search inputs and buttons
const subjectInput = document.getElementById("subject-input");
const locationInput = document.getElementById("location-input");
const priceInput = document.getElementById("price-input");
const modeInput = document.getElementById("mode-input");
const searchBtn = document.getElementById("search-btn");
const resetBtn = document.getElementById("reset-btn");

// Function that filters tutors based on what the user typed
function filterTutors() {
  const subjectValue = subjectInput.value.trim().toLowerCase();
  const locationValue = locationInput.value.trim().toLowerCase();
  const priceValue = priceInput.value.trim();
  const modeValue = modeInput.value;

  const filtered = tutors.filter(tutor => {
    const matchesSubject = subjectValue === "" || tutor.subject.toLowerCase().includes(subjectValue);
    const matchesLocation = locationValue === "" || tutor.location.toLowerCase().includes(locationValue);
    const matchesPrice = priceValue === "" || tutor.price <= Number(priceValue);
    const matchesMode = modeValue === "" || tutor.mode === modeValue;

    return matchesSubject && matchesLocation && matchesPrice && matchesMode;
  });

  displayTutors(filtered);
}

// Run filterTutors() whenever the Search button is clicked
searchBtn.addEventListener("click", filterTutors);

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
  displayTutors(tutors);
});
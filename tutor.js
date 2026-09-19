import { db } from "./firebase-config.js";
import { doc, getDoc, collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const profileContainer = document.getElementById("profile-container");
const reviewsList = document.getElementById("reviews-list");

// Read the listing ID from the URL (e.g. tutor.html?id=abc123)
const params = new URLSearchParams(window.location.search);
const listingId = params.get("id");

function renderStars(rating) {
  const full = Math.floor(rating);
  const hasHalf = rating - full >= 0.5;
  let stars = "★".repeat(full);
  if (hasHalf) stars += "½";
  stars += "☆".repeat(Math.max(5 - full - (hasHalf ? 1 : 0), 0));
  return stars;
}

async function loadProfile() {
  if (!listingId) {
    profileContainer.innerHTML = "<div class='empty-state'>❓<p>No tutor selected.</p></div>";
    return;
  }

  const snap = await getDoc(doc(db, "listings", listingId));

  if (!snap.exists()) {
    profileContainer.innerHTML = "<div class='empty-state'>❓<p>This listing no longer exists.</p></div>";
    reviewsList.innerHTML = "";
    return;
  }

  const t = snap.data();

  // Load reviews for this listing
  const revSnap = await getDocs(query(collection(db, "reviews"), where("listingId", "==", listingId)));
  const reviews = revSnap.docs.map(d => d.data());

  const avg = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : t.rating;

  const whatsappLink = t.phone
    ? `https://wa.me/${t.phone}?text=Hi%20${encodeURIComponent(t.name)},%20I%20found%20you%20on%20Tuition%20Finder%20and%20I'm%20interested%20in%20${encodeURIComponent(t.subject)}%20tuition.`
    : null;

  profileContainer.innerHTML = `
    <div class="profile-card">
      <div class="profile-header">
        <div class="avatar large">${t.name.charAt(0)}</div>
        <div>
          <h2>${t.name}</h2>
          <p class="profile-rating">
            <span class="stars">${renderStars(avg)}</span> ${avg}
            ${reviews.length ? `(${reviews.length} review${reviews.length !== 1 ? "s" : ""})` : "(no reviews yet)"}
          </p>
        </div>
      </div>

      <div class="profile-details">
        <div><span>Subject</span><strong>${t.subject}</strong></div>
        <div><span>Location</span><strong>${t.location}</strong></div>
        <div><span>Fee</span><strong>Rs. ${t.price}</strong></div>
        <div><span>Mode</span><strong>${t.mode}</strong></div>
      </div>

      ${t.bio ? `<p class="profile-bio">${t.bio}</p>` : ""}
      ${whatsappLink ? `<a class="contact-btn" href="${whatsappLink}" target="_blank">Contact via WhatsApp</a>` : ""}
    </div>
  `;

  renderReviews(reviews);
}

function renderReviews(reviews) {
  if (!reviews.length) {
    reviewsList.innerHTML = "<div class='empty-state'>💬<p>No reviews yet — be the first to leave one from the search page.</p></div>";
    return;
  }

  reviewsList.innerHTML = reviews.map(r => `
    <div class="review-card">
      <span class="stars">${renderStars(r.rating)}</span>
      ${r.comment ? `<p>${r.comment}</p>` : "<p class='no-comment'>No comment left.</p>"}
    </div>
  `).join("");
}

loadProfile();
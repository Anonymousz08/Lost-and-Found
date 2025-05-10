// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-app.js";
import {
  getDatabase,
  ref,
  set,
  push,
  get,
  child,
  onValue,
  remove,
  update,
} from "https://www.gstatic.com/firebasejs/10.3.1/firebase-database.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBsd1nrMxDcKYSOPtJ6WBj4hp_9n5xPKOI",
  authDomain: "lost-and-found-d8645.firebaseapp.com",
  databaseURL: "https://lost-and-found-d8645-default-rtdb.firebaseio.com",
  projectId: "lost-and-found-d8645",
  storageBucket: "lost-and-found-d8645.firebasestorage.app",
  messagingSenderId: "721199870675",
  appId: "1:721199870675:web:fbd36e0ae28be80ae5da26",
  measurementId: "G-33Z2S6MX5X",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// DOM Elements
const reportForm = document.getElementById("report-form");
const tabReport = document.getElementById("tab-report");
const tabBrowse = document.getElementById("tab-browse");
const reportSection = document.getElementById("report-section");
const browseSection = document.getElementById("browse-section");
const itemsContainer = document.getElementById("items-container");
const errorContainer = document.getElementById("error-container");
const successContainer = document.getElementById("success-container");
const searchInput = document.getElementById("search-input");
const statusFilter = document.getElementById("status-filter");

// Tab switching
tabReport.addEventListener("click", () => {
  tabReport.classList.add("active");
  tabBrowse.classList.remove("active");
  reportSection.style.display = "block";
  browseSection.style.display = "none";
});

tabBrowse.addEventListener("click", () => {
  tabBrowse.classList.add("active");
  tabReport.classList.remove("active");
  browseSection.style.display = "block";
  reportSection.style.display = "none";
  loadItems();
});

// Show error message
function showError(message) {
  errorContainer.textContent = message;
  errorContainer.style.display = "block";
  successContainer.style.display = "none";

  setTimeout(() => {
    errorContainer.style.display = "none";
  }, 5000);
}

// Show success message
function showSuccess(message) {
  successContainer.textContent = message;
  successContainer.style.display = "block";
  errorContainer.style.display = "none";

  setTimeout(() => {
    successContainer.style.display = "none";
  }, 5000);
}

// Add item to database
async function addItem(itemData) {
  try {
    // Generate a reference with an auto ID
    const itemsRef = ref(database, "items");
    const newItemRef = push(itemsRef);

    // Add timestamp
    const itemWithTimestamp = {
      ...itemData,
      date_reported: new Date().toISOString(),
    };

    // Set the data
    await set(newItemRef, itemWithTimestamp);
    return { id: newItemRef.key, ...itemWithTimestamp };
  } catch (error) {
    console.error("Error adding item:", error);
    throw error;
  }
}

// Get all items
async function getAllItems() {
  try {
    const itemsRef = ref(database, "items");
    const snapshot = await get(itemsRef);

    if (snapshot.exists()) {
      const items = [];
      snapshot.forEach((childSnapshot) => {
        items.push({
          id: childSnapshot.key,
          ...childSnapshot.val(),
        });
      });
      return items;
    } else {
      return [];
    }
  } catch (error) {
    console.error("Error getting items:", error);
    throw error;
  }
}

// Format date
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString() + " " + date.toLocaleTimeString();
}

// Create item card
function createItemCard(item) {
  const card = document.createElement("div");
  card.className = "item-card";

  const statusClass = `status-${item.status}`;

  card.innerHTML = `
                <div class="item-title">${item.name}</div>
                <div class="item-location">📍 ${item.place_of_lost}</div>
                <div class="item-status ${statusClass}">${item.status.toUpperCase()}</div>
                <div class="item-date">Reported: ${formatDate(
                  item.date_reported
                )}</div>
                <div class="item-description">${
                  item.description || "No description provided"
                }</div>
                <div class="item-contact">Contact: ${item.contact}</div>
            `;

  return card;
}

// Load and display items
async function loadItems(filter = "all", searchTerm = "") {
  try {
    itemsContainer.innerHTML = '<div class="loading">Loading items...</div>';
    const items = await getAllItems();

    if (items.length === 0) {
      itemsContainer.innerHTML = '<div class="loading">No items found</div>';
      return;
    }

    // Sort by date (newest first)
    items.sort((a, b) => new Date(b.date_reported) - new Date(a.date_reported));

    // Apply filters
    const filteredItems = items.filter((item) => {
      const matchesStatus = filter === "all" || item.status === filter;
      const matchesSearch =
        !searchTerm ||
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.place_of_lost.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.description &&
          item.description.toLowerCase().includes(searchTerm.toLowerCase()));

      return matchesStatus && matchesSearch;
    });

    // Clear container
    itemsContainer.innerHTML = "";

    // Display filtered items
    if (filteredItems.length === 0) {
      itemsContainer.innerHTML =
        '<div class="loading">No items match your criteria</div>';
      return;
    }

    filteredItems.forEach((item) => {
      const card = createItemCard(item);
      itemsContainer.appendChild(card);
    });
  } catch (error) {
    console.error("Error loading items:", error);
    itemsContainer.innerHTML =
      '<div class="error">Error loading items. Please try again.</div>';
  }
}

// Filter change event
statusFilter.addEventListener("change", () => {
  const filterValue = statusFilter.value;
  const searchTerm = searchInput.value;
  loadItems(filterValue, searchTerm);
});

// Search input event
searchInput.addEventListener("input", () => {
  const filterValue = statusFilter.value;
  const searchTerm = searchInput.value;
  loadItems(filterValue, searchTerm);
});

// Form submission
reportForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const submitBtn = document.getElementById("submit-btn");
  submitBtn.textContent = "Submitting...";
  submitBtn.disabled = true;

  try {
    const itemData = {
      name: document.getElementById("item-name").value,
      place_of_lost: document.getElementById("item-place").value,
      contact: document.getElementById("item-contact").value,
      description: document.getElementById("item-description").value,
      status: document.getElementById("item-status").value,
    };

    await addItem(itemData);

    // Reset form
    reportForm.reset();

    showSuccess("Item reported successfully!");

    // Switch to browse tab
    tabBrowse.click();
  } catch (error) {
    console.error("Error submitting form:", error);
    showError("Failed to submit. Please try again.");
  } finally {
    submitBtn.textContent = "Submit Report";
    submitBtn.disabled = false;
  }
});

// Initialize with report tab active
tabReport.click();

// Firebase modules import - updated to match HTML script tags
document.addEventListener("DOMContentLoaded", function () {
  // Firebase configuration - This should ideally be in environment variables
  // For a production app, consider server-side authentication instead of exposing API keys
  const firebaseConfig = {
    apiKey: "YOUR_API_KEY", // Replace with your Firebase key or use environment variables
    authDomain: "lost-and-found-d8645.firebaseapp.com",
    databaseURL: "https://lost-and-found-d8645-default-rtdb.firebaseio.com",
    projectId: "lost-and-found-d8645",
    storageBucket: "lost-and-found-d8645.appspot.com", // Fixed storage bucket URL
    messagingSenderId: "721199870675",
    appId: "1:721199870675:web:fbd36e0ae28be80ae5da26",
    measurementId: "G-33Z2S6MX5X",
  };

  // Initialize Firebase with compat version to match HTML imports
  firebase.initializeApp(firebaseConfig);
  const database = firebase.database();

  // DOM Elements - Get tabs from the home page
  const allItemsTab = document.querySelector("#tab-report");
  const lostItemsTab = document.querySelector("#tab-browse");
  const foundItemsTab = document.querySelectorAll(".tab")[2]; // Third tab

  // Create a container for items if it doesn't exist
  let itemsContainer = document.querySelector(".items-grid");
  if (!itemsContainer) {
    itemsContainer = document.createElement("div");
    itemsContainer.className = "items-grid";
    const recentItemsSection = document.querySelector("#recent-items");
    if (recentItemsSection) {
      recentItemsSection.appendChild(itemsContainer);
    }
  }

  // Add active class to the first tab by default
  if (allItemsTab) {
    allItemsTab.classList.add("active");
    loadItems("all", "", 6); // Load all items with a limit of 6
  }

  // Tab switching functionality
  if (allItemsTab) {
    allItemsTab.addEventListener("click", () => {
      setActiveTab(allItemsTab);
      loadItems("all", "", 6); // Load all items with a limit of 6
    });
  }

  if (lostItemsTab) {
    lostItemsTab.addEventListener("click", () => {
      setActiveTab(lostItemsTab);
      loadItems("lost", "", 6); // Load only lost items with a limit of 6
    });
  }

  if (foundItemsTab) {
    foundItemsTab.addEventListener("click", () => {
      setActiveTab(foundItemsTab);
      loadItems("found", "", 6); // Load only found items with a limit of 6
    });
  }

  // Set active tab
  function setActiveTab(activeTab) {
    const tabs = document.querySelectorAll(".tab");
    tabs.forEach((tab) => tab.classList.remove("active"));
    activeTab.classList.add("active");
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

    // Make the card clickable to show product details
    card.addEventListener("click", () => showItemDetail(item));

    const statusClass = item.status === "lost" ? "lost" : "found";

    card.innerHTML = `
      <div class="item-info">
        <div class="item-badge ${statusClass}">${item.status.toUpperCase()}</div>
        <h3>${item.name}</h3>
        <div class="item-meta">
          <span><i class="fas fa-map-marker-alt"></i> ${
            item.place_of_lost
          }</span>
          <span><i class="far fa-calendar-alt"></i> ${formatDate(
            item.date_reported
          )}</span>
        </div>
        <p class="item-description">${
          item.description
            ? item.description.substring(0, 80) +
              (item.description.length > 80 ? "..." : "")
            : "No description provided"
        }</p>
        <div class="view-details">Click for details</div>
      </div>
    `;

    return card;
  }

  // Show item detail in modal - Product details when card is clicked
  function showItemDetail(item) {
    // Check if modal exists, if not create it
    let modal = document.getElementById("item-detail-modal");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "item-detail-modal";
      modal.className = "modal";

      modal.innerHTML = `
        <div class="modal-content">
          <span class="close-modal">&times;</span>
          <div id="item-detail-container"></div>
        </div>
      `;

      document.body.appendChild(modal);

      // Add close event to the X button
      const closeButton = modal.querySelector(".close-modal");
      closeButton.addEventListener("click", () => {
        modal.style.display = "none";
      });

      // Close when clicking outside
      window.addEventListener("click", (event) => {
        if (event.target === modal) {
          modal.style.display = "none";
        }
      });
    }

    // Format date nicely
    const reportedDate = new Date(item.date_reported);
    const formattedDate = reportedDate.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    // Determine status class for styling
    const statusClass = item.status === "lost" ? "lost" : "found";

    // Update modal content with product details
    const detailContainer = document.getElementById("item-detail-container");
    if (detailContainer) {
      detailContainer.innerHTML = `
        <div class="item-detail">
          <div class="item-detail-header">
            <h2 class="item-detail-title">${item.name}</h2>
            <div class="item-detail-status ${statusClass}">${item.status.toUpperCase()}</div>
          </div>
          
          <div class="item-detail-section">
            <div class="item-detail-label">Location</div>
            <div class="item-detail-value">${item.place_of_lost}</div>
          </div>
          
          <div class="item-detail-section">
            <div class="item-detail-label">Date Reported</div>
            <div class="item-detail-value">${formattedDate}</div>
          </div>
          
          <div class="item-detail-section">
            <div class="item-detail-label">Description</div>
            <div class="item-detail-value">${
              item.description || "No description provided"
            }</div>
          </div>
          
          <div class="item-detail-section">
            <div class="item-detail-label">Contact Information</div>
            <div class="item-detail-value">${item.contact}</div>
          </div>
          
          <div class="item-detail-actions">
            <button class="btn btn-primary contact-button" id="contact-button">Contact Owner</button>
            ${
              item.status !== "claimed"
                ? `<button class="btn btn-secondary claim-button" id="claim-button">
                ${item.status === "lost" ? "I Found This" : "This Is Mine"}
              </button>`
                : ""
            }
          </div>
        </div>
      `;
    }

    // Show the modal
    modal.style.display = "block";

    // Add event listeners for buttons
    const contactButton = document.getElementById("contact-button");
    if (contactButton) {
      contactButton.addEventListener("click", (e) => {
        e.stopPropagation(); // Prevent event from bubbling to modal
        contactOwner(item);
      });
    }

    const claimButton = document.getElementById("claim-button");
    if (claimButton) {
      claimButton.addEventListener("click", (e) => {
        e.stopPropagation(); // Prevent event from bubbling to modal
        initiateClaimProcess(item.id);
      });
    }
  }

  // Contact owner function
  function contactOwner(item) {
    // Simple implementation - in a real app, you might have a messaging system
    const contactInfo = item.contact;

    // Check if it's an email
    if (contactInfo && contactInfo.includes("@")) {
      window.location.href = `mailto:${contactInfo}?subject=Regarding your ${item.status} item: ${item.name}`;
    }
    // Check if it's likely a phone number
    else if (contactInfo && /\d/.test(contactInfo)) {
      window.location.href = `tel:${contactInfo.replace(/\D/g, "")}`;
    }
    // Fallback - show contact info
    else {
      alert(
        `Contact the owner at: ${
          contactInfo || "No contact information provided"
        }`
      );
    }
  }

  // Claim process function
  async function initiateClaimProcess(itemId) {
    try {
      // In a real app with authentication:
      // - Check if user is logged in
      // - Create claim record in database

      // For now, just update the item status to "claimed" for demonstration
      const itemRef = database.ref(`items/${itemId}`);
      await itemRef.update({
        status: "claimed",
        claimed_date: new Date().toISOString(),
      });

      // Close the modal
      const modal = document.getElementById("item-detail-modal");
      if (modal) modal.style.display = "none";

      // Show success message
      showMessage("Item has been marked as claimed!", "success");

      // Refresh the items list
      const activeTab = document.querySelector(".tab.active");
      if (activeTab === allItemsTab) {
        loadItems("all", "", 6);
      } else if (activeTab === lostItemsTab) {
        loadItems("lost", "", 6);
      } else if (activeTab === foundItemsTab) {
        loadItems("found", "", 6);
      }
    } catch (error) {
      console.error("Error claiming item:", error);
      showMessage("Failed to claim item. Please try again.", "error");
    }
  }

  // Show message function
  function showMessage(message, type) {
    // Check if message container exists, if not create it
    let messageContainer = document.getElementById("message-container");
    if (!messageContainer) {
      messageContainer = document.createElement("div");
      messageContainer.id = "message-container";
      messageContainer.style.position = "fixed";
      messageContainer.style.top = "20px";
      messageContainer.style.right = "20px";
      messageContainer.style.zIndex = "1000";
      document.body.appendChild(messageContainer);
    }

    const msgElement = document.createElement("div");
    msgElement.className = `message ${type}`;
    msgElement.innerHTML = message;
    msgElement.style.padding = "10px 20px";
    msgElement.style.marginBottom = "10px";
    msgElement.style.borderRadius = "5px";
    msgElement.style.color = "white";
    msgElement.style.backgroundColor =
      type === "success" ? "#28a745" : "#dc3545";

    messageContainer.appendChild(msgElement);

    // Auto remove after 3 seconds
    setTimeout(() => {
      messageContainer.removeChild(msgElement);
    }, 3000);
  }

  // Get all items
  async function getAllItems() {
    try {
      const itemsRef = database.ref("items");
      const snapshot = await itemsRef.once("value");

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
      return [];
    }
  }

  // Add item to database
  async function addItem(itemData) {
    try {
      // Generate a reference with an auto ID
      const itemsRef = database.ref("items");
      const newItemRef = itemsRef.push();

      // Add timestamp
      const itemWithTimestamp = {
        ...itemData,
        date_reported: new Date().toISOString(),
      };

      // Set the data
      await newItemRef.set(itemWithTimestamp);
      return { id: newItemRef.key, ...itemWithTimestamp };
    } catch (error) {
      console.error("Error adding item:", error);
      throw error;
    }
  }

  // Load and display items
  async function loadItems(filter = "all", searchTerm = "", limit = null) {
    try {
      if (!itemsContainer) return;

      // Show loading indicator
      itemsContainer.innerHTML =
        '<div class="loading-indicator">Loading items...</div>';

      const items = await getAllItems();

      if (items.length === 0) {
        itemsContainer.innerHTML =
          '<div class="no-items-message">No items found</div>';
        return;
      }

      // Sort by date (newest first)
      items.sort(
        (a, b) => new Date(b.date_reported) - new Date(a.date_reported)
      );

      // Apply filters
      let filteredItems = items;

      if (filter !== "all") {
        filteredItems = items.filter((item) => item.status === filter);
      }

      if (searchTerm) {
        filteredItems = filteredItems.filter(
          (item) =>
            item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.place_of_lost
              .toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            (item.description &&
              item.description.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      }

      // Apply limit if provided
      if (limit) {
        filteredItems = filteredItems.slice(0, limit);
      }

      // Clear container
      itemsContainer.innerHTML = "";

      // Display filtered items
      if (filteredItems.length === 0) {
        itemsContainer.innerHTML =
          '<div class="no-items-message">No items match your criteria</div>';
        return;
      }

      filteredItems.forEach((item) => {
        const card = createItemCard(item);
        itemsContainer.appendChild(card);
      });
    } catch (error) {
      console.error("Error loading items:", error);
      itemsContainer.innerHTML =
        '<div class="error-message">Error loading items. Please try again.</div>';
    }
  }

  // Generate sample data if needed
  async function generateSampleData() {
    try {
      const items = await getAllItems();
      if (items.length === 0) {
        const sampleItems = [
          {
            name: "Black Wallet",
            place_of_lost: "Campus Library",
            contact: "john@example.com",
            description: "Leather wallet with ID cards and some cash",
            status: "lost",
          },
          {
            name: "Apple iPhone 14",
            place_of_lost: "Student Center",
            contact: "alice@example.com",
            description: "Black iPhone with red case",
            status: "lost",
          },
          {
            name: "Blue Backpack",
            place_of_lost: "Main Building",
            contact: "555-123-4567",
            description: "Nike backpack with laptop and textbooks",
            status: "found",
          },
          {
            name: "Car Keys",
            place_of_lost: "Parking Lot B",
            contact: "bob@example.com",
            description: "Honda car keys with a red keychain",
            status: "found",
          },
          {
            name: "Student ID Card",
            place_of_lost: "Cafeteria",
            contact: "sarah@example.com",
            description: "ID card for Sarah Johnson",
            status: "lost",
          },
          {
            name: "Gold Necklace",
            place_of_lost: "Gym",
            contact: "555-987-6543",
            description: "Gold necklace with a heart pendant",
            status: "found",
          },
          {
            name: "Textbook - Biology 101",
            place_of_lost: "Science Building",
            contact: "mark@example.com",
            description: "Campbell Biology textbook, 12th edition",
            status: "lost",
          },
          {
            name: "Water Bottle",
            place_of_lost: "Sports Field",
            contact: "emma@example.com",
            description: "Blue Hydro Flask with stickers",
            status: "found",
          },
        ];

        // Add sample items to database
        for (const item of sampleItems) {
          await addItem(item);
        }

        console.log("Sample data generated successfully");
      }
    } catch (error) {
      console.error("Error generating sample data:", error);
    }
  }

  // Check if we're on the report page
  const reportForm = document.getElementById("report-form");
  if (reportForm) {
    // Form submission for report page
    reportForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const submitBtn = document.getElementById("submit-btn");
      if (submitBtn) {
        submitBtn.textContent = "Submitting...";
        submitBtn.disabled = true;
      }

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

        showMessage("Item reported successfully!", "success");

        // Redirect back to home page
        setTimeout(() => {
          window.location.href = "../index.html"; // Fixed path with relative reference
        }, 2000);
      } catch (error) {
        console.error("Error submitting form:", error);
        showMessage("Failed to submit. Please try again.", "error");
      } finally {
        if (submitBtn) {
          submitBtn.textContent = "Submit Report";
          submitBtn.disabled = false;
        }
      }
    });
  }

  // Add CSS for the view details indicator and modal
  const style = document.createElement("style");
  style.textContent = `
    .view-details {
      color: #007bff;
      font-size: 0.9rem;
      margin-top: 8px;
      cursor: pointer;
      font-weight: 500;
    }
    
    .item-card {
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
      border-radius: 8px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.1);
      padding: 15px;
      margin-bottom: 20px;
      background: #fff;
    }
    
    .item-card:hover {
      transform: translateY(-3px);
      box-shadow: 0 5px 15px rgba(0,0,0,0.1);
    }
    
    .item-badge {
      display: inline-block;
      padding: 5px 10px;
      border-radius: 4px;
      font-size: 0.8rem;
      font-weight: bold;
      margin-bottom: 10px;
      color: white;
    }
    
    .lost {
      background-color: #dc3545;
    }
    
    .found {
      background-color: #28a745;
    }
    
    .modal {
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0,0,0,0.7);
      z-index: 1000;
      overflow-y: auto;
    }
    
    .modal-content {
      background-color: white;
      margin: 10% auto;
      padding: 20px;
      border-radius: 8px;
      width: 80%;
      max-width: 600px;
      position: relative;
    }
    
    .close-modal {
      position: absolute;
      top: 10px;
      right: 20px;
      font-size: 28px;
      font-weight: bold;
      cursor: pointer;
    }
    
    .item-detail-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    
    .item-detail-section {
      margin-bottom: 15px;
      padding-bottom: 15px;
      border-bottom: 1px solid #eee;
    }
    
    .item-detail-label {
      font-weight: bold;
      color: #555;
      margin-bottom: 5px;
    }
    
    .item-detail-actions {
      margin-top: 20px;
      display: flex;
      gap: 10px;
    }

    .loading-indicator {
      text-align: center;
      padding: 20px;
      color: #666;
    }

    .no-items-message, .error-message {
      text-align: center;
      padding: 20px;
      color: #666;
    }

    .error-message {
      color: #dc3545;
    }

    .message {
      animation: fadeOut 3s forwards;
    }

    @keyframes fadeOut {
      0% { opacity: 1; }
      70% { opacity: 1; }
      100% { opacity: 0; }
    }
  `;
  document.head.appendChild(style);

  // Generate sample data for demo purposes
  generateSampleData();

  // Initial load of items
  if (document.querySelector(".tab")) {
    loadItems("all", "", 6);
  }
});

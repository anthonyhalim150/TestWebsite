let auctionItems = []; // Array to store auction items
let filteredItems = []; // Array to store filtered items
let timerIntervals = []; // Store timers for auction items

// Fetch auction items from the server
const fetchAuctionItems = async () => {
  try {
    const response = await fetch("http://localhost:3000/auction");
    const data = await response.json();

    auctionItems = data.map(item => ({
      id: item.id,
      name: item.item_name,
      stock: item.stock,
      description: item.description,
      category: item.category,
      image: item.image,
      startingPrice: item.starting_price,
      duration: item.duration,
      startingTime: new Date(item.starting_time), // Convert to Date object
    }));

    // Initialize filtered items with all auction items
    filteredItems = [...auctionItems];

    renderAuctionItems();
  } catch (error) {
    console.error("Error fetching auction items:", error);
  }
};

// Fetch current highest bid for a specific item
const fetchHighestBid = async (itemId) => {
  try {
    const response = await fetch(`http://localhost:3000/highest-bid?auction_item_id=${itemId}`);
    const data = await response.json();
    return data.highestBid || 0;
  } catch (error) {
    console.error("Error fetching highest bid:", error);
    return 0;
  }
};

// Place a bid
const placeBid = async (itemId, bidAmount) => {
  const userId = localStorage.getItem("userID");
  try {
    const response = await fetch("http://localhost:3000/bids", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ auction_item_id: itemId, user_id: userId, bid_amount: bidAmount }),
    });
    const data = await response.json();
    if (response.ok) {
      alert("Bid placed successfully!");
      renderAuctionItems(); // Re-fetch and re-render auction items
    } else {
      alert(data.message || "Failed to place bid.");
    }
  } catch (error) {
    console.error("Error placing bid:", error);
  }
};

// Cancel a bid
const cancelBid = async (itemId) => {
  const userId = localStorage.getItem("userID");
  try {
    const response = await fetch(`http://localhost:3000/bids?auction_item_id=${itemId}&user_id=${userId}`, {
      method: "DELETE",
    });
    if (response.ok) {
      alert("Bid canceled successfully!");
      renderAuctionItems(); // Re-fetch and re-render auction items
    } else {
      alert("Failed to cancel bid.");
    }
  } catch (error) {
    console.error("Error canceling bid:", error);
  }
};

// Render auction items to the page
const renderAuctionItems = async (items = filteredItems) => {
  const auctionContainer = document.getElementById("auction-items");
  auctionContainer.innerHTML = ""; // Clear existing items

  for (const item of items) {
    const highestBid = await fetchHighestBid(item.id);
    const itemElement = document.createElement("div");
    itemElement.classList.add("auction-item");
    const highestBidText = highestBid > 0 ? `$${highestBid}` : "No bids yet";
    itemElement.innerHTML = `
      <img src="${item.image}" alt="${item.name}" class="item-image">
      <h3>${item.name}</h3>
      <p>Starting Price: $${item.startingPrice}</p>
      <p>Current Highest Bid: ${highestBidText}</p>
      <p class="timer" id="timer-${item.id}"></p>
      <button class="bid-btn" id="bid-btn-${item.id}">Place Bid</button>
      <button class="cancel-bid-btn" id="cancel-bid-btn-${item.id}">Cancel Bid</button>
    `;

    auctionContainer.appendChild(itemElement);

    startItemTimer(item); // Start countdown for each item

    // Add click events to bid and cancel bid buttons
    document.getElementById(`bid-btn-${item.id}`).addEventListener("click", () => {
      const bidAmount = prompt("Enter your bid amount:");
      if (bidAmount && parseFloat(bidAmount) > parseFloat(highestBid)) {
        placeBid(item.id, parseFloat(bidAmount));
      } else {
        alert("Bid amount must be higher than the current highest bid.");
      }
    });

    document.getElementById(`cancel-bid-btn-${item.id}`).addEventListener("click", () => {
      if (confirm("Are you sure you want to cancel your bid?")) {
        cancelBid(item.id);
      }
    });

    // Add click event to display product overview
    itemElement.addEventListener("click", () => showProductOverview(item, highestBid));
  }
};

// Start timer for a specific auction item
const startItemTimer = (item) => {
  const timerElement = document.getElementById(`timer-${item.id}`);
  const endTime = new Date(item.startingTime.getTime() + item.duration * 1000);

  const interval = setInterval(() => {
    const currentTime = new Date();
    const timeLeft = Math.max(0, Math.floor((endTime - currentTime) / 1000));

    if (timeLeft <= 0) {
      clearInterval(interval);
      timerElement.textContent = "Auction ended";
    } else {
      const minutes = Math.floor(timeLeft / 60).toString().padStart(2, "0");
      const seconds = (timeLeft % 60).toString().padStart(2, "0");
      timerElement.textContent = `${minutes}:${seconds}`;
    }
  }, 1000);

  timerIntervals.push(interval);
};

// Show product overview in a popup
const showProductOverview = (item, highestBid) => {
  const overviewSection = document.getElementById("product-overview");
  overviewSection.style.display = "block";

  document.getElementById("product-name").value = item.name;
  document.getElementById("product-price").value = item.startingPrice;
  document.getElementById("product-stock").value = item.stock;
  document.getElementById("product-description").value = item.description;
  document.getElementById("product-category").value = item.category;

  const productImage = document.getElementById("product-image");
  productImage.src = item.image || "placeholder.jpg";

  const highestBidElement = document.createElement("p");
  const highestBidText = highestBid > 0 ? `$${highestBid}` : "No bids yet";
  highestBidElement.textContent = `Current Highest Bid: ${highestBidText}`;
  highestBidElement.style.marginTop = "10px";

  const detailsSection = document.querySelector(".details");
  detailsSection.appendChild(highestBidElement);

  document.querySelector(".close-btn").addEventListener("click", () => {
    overviewSection.style.display = "none";
    highestBidElement.remove(); // Clean up the appended element
  });
};

// Apply search and sort together
const applySearchAndSort = () => {
  const searchInput = document.getElementById("search-input").value.toLowerCase();
  const sortCriteria = document.getElementById("sort-select").value;

  filteredItems = auctionItems.filter(item =>
    item.name.toLowerCase().includes(searchInput) ||
    item.description.toLowerCase().includes(searchInput)
  );

  switch (sortCriteria) {
    case "price-asc":
      filteredItems.sort((a, b) => a.startingPrice - b.startingPrice);
      break;
    case "price-desc":
      filteredItems.sort((a, b) => b.startingPrice - a.startingPrice);
      break;
    case "name-asc":
      filteredItems.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case "name-desc":
      filteredItems.sort((a, b) => b.name.localeCompare(a.name));
      break;
  }

  renderAuctionItems();
};

// Attach event listeners for search and sort
const attachEventListeners = () => {
  document.getElementById("search-input").addEventListener("input", applySearchAndSort);
  document.getElementById("sort-select").addEventListener("change", applySearchAndSort);
};

// Initialize auction
const initializeAuction = () => {
  fetchAuctionItems();
  attachEventListeners();
};

document.addEventListener("DOMContentLoaded", initializeAuction);

let auctionItems = []; // Array to store auction items
let filteredItems = []; // Array to store filtered items
let timerIntervals = []; // Store timers for auction items
const API_URL = 'https://anthonyhalim-150-723848267249.us-central1.run.app';
const API_URL_USER = 'https://users-723848267249.us-central1.run.app';

// Fetch auction items from the server
const fetchAuctionItems = async () => {
  get_balance();
  try {
    const response = await fetch(`${API_URL}/auction`);
    const data = await response.json();

    auctionItems = data.items.map(item => ({
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
    const response = await fetch(`${API_URL}/highest-bid?auction_item_id=${itemId}`);
    const data = await response.json();
    return data.length > 0 ? data[0] : { bid_amount: 0, username: null }; // Return the first item or a default object
  } catch (error) {
    console.error("Error fetching highest bid:", error);
    return 0;
  }
};

// Place a bid
const placeBid = async (itemId, bidAmount) => {
  const userId = localStorage.getItem("userID");
  if (!userId){
    alert("You must be logged in to bid!");
    return;
  }
  try {
    const response = await fetch(`${API_URL}/bids`, {
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
  if (!userId){
    alert("You must be logged in to cancel bid!");
    return;
  }
  try {
    const response = await fetch(`${API_URL}/bids?auction_item_id=${itemId}&user_id=${userId}`, {
      method: "DELETE",
    });
    if (response.ok) {
      alert("Bid canceled successfully!");
      fetchAuctionItems(); // Re-fetch and re-render auction items
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
    const data = await fetchHighestBid(item.id);
    const highestBid = data.bid_amount || 0;
    const itemElement = document.createElement("div");
    itemElement.classList.add("auction-item");
    const formattedBid = parseFloat(highestBid).toLocaleString('en-US');//Turn from 7000 to 7,000
    const user = data.username || 'None'; //Jangan sampe None
    const highestBidText = highestBid > 0 ? `$${formattedBid}<br>Submitted by ${user}` : "No bids yet";
    const startingPrice = item.startingPrice || 0; 
    const formattedPrice = parseFloat(startingPrice).toLocaleString('en-US');
    itemElement.innerHTML = `
      <img src="${item.image}" alt="${item.name}" class="item-image">
      <h3>${item.name}</h3>
      <p>Starting Price: $${formattedPrice}</p>
      <p>Current Highest Bid: ${highestBidText}</p>
      <p class="timer" id="timer-${item.id}"></p>
      <button class="bid-btn" id="bid-btn-${item.id}">Place Bid</button>
      <button class="cancel-bid-btn" id="cancel-bid-btn-${item.id}">Cancel Bid</button>
    `;

    auctionContainer.appendChild(itemElement);

    startItemTimer(item); // Start countdown for each item

    // Add click events to bid and cancel bid buttons
    const bid_button =  document.getElementById(`bid-btn-${item.id}`);
    if (bid_button){
      bid_button.addEventListener("click", (event) => {
        event.stopPropagation(); 
        const endTime = new Date(item.startingTime.getTime() + item.duration * 1000);//Get time converts it to miliseconds(Since UNIX epoch 1 JAN 1970)
        const currentTime = new Date();
        const timeLeft = Math.max(0, Math.floor((endTime - currentTime) / 1000));
        if (timeLeft < 1){
          alert("Auction has already ended! Cannot add bid!");
          return;
        }
        const bidAmount = prompt("Enter your bid amount:");
        if (bidAmount > 499999999999.99){
          alert("Bid amount too high! Please enter a number below 500 billion!");
          return;
        }
        if (bidAmount && parseFloat(bidAmount) > parseFloat(highestBid)) {
          placeBid(item.id, parseFloat(bidAmount));
        } 
        else {
          alert("Bid amount must be higher than the current highest bid.");
        }
      });
    }
    const cancel_bid_button = document.getElementById(`cancel-bid-btn-${item.id}`);
    if (cancel_bid_button){
      document.getElementById(`cancel-bid-btn-${item.id}`).addEventListener("click", (event) => {
        event.stopPropagation(); 
        const endTime = new Date(item.startingTime.getTime() + item.duration * 1000);//Get time converts it to miliseconds(Since UNIX epoch 1 JAN 1970)
        const currentTime = new Date();
        const timeLeft = Math.max(0, Math.floor((endTime - currentTime) / 1000));
        if (timeLeft < 1){
          alert("Auction has already ended! Cannot cancel bid!");
          return;
        }
        if (confirm("Are you sure you want to cancel your bid?")) {
          cancelBid(item.id);
        }
      });
    }

    // Add click event to display product overview
    itemElement.addEventListener("click", () => showProductOverview(item, highestBid, user));
  }
};

// Start timer for a specific auction item
const startItemTimer = (item) => {
  const timerElement = document.getElementById(`timer-${item.id}`);
  const endTime = new Date(item.startingTime.getTime() + item.duration * 1000);//Get time converts it to miliseconds(Since UNIX epoch 1 JAN 1970)

  const interval = setInterval(() => {
    const currentTime = new Date();
    const timeLeft = Math.max(0, Math.floor((endTime - currentTime) / 1000));

    if (timeLeft <= 0) {
      clearInterval(interval);
      timerElement.textContent = "Auction ended";
      fetchAuctionItems();
    } 
    else {
      const minutes = Math.floor(timeLeft / 60).toString().padStart(2, "0");
      const seconds = (timeLeft % 60).toString().padStart(2, "0");
      timerElement.textContent = `${minutes}:${seconds}`;
    }
  }, 1000);

  timerIntervals.push(interval);
};

// Show product overview in a popup
const showProductOverview = (item, highestBid, user) => {
  const overviewSection = document.getElementById("product-overview");
  overviewSection.style.display = "block";

  document.getElementById("product-name").value = item.name;
  const startingPrice = item.startingPrice || 0; 
  const formattedPrice = parseFloat(startingPrice).toLocaleString('en-US');//Turn from 7000 to 7,000
  document.getElementById("product-price").value = formattedPrice;
  document.getElementById("product-stock").value = item.stock;
  document.getElementById("product-description").value = item.description;
  document.getElementById("product-category").value = item.category;

  const productImage = document.getElementById("product-image");
  productImage.src = item.image || "placeholder.jpg";

  const highestBidElement = document.createElement("p");
  const formattedBid = parseFloat(highestBid).toLocaleString('en-US');//Turn from 7000 to 7,000
  const highestBidText = formattedBid > 0 ? `$${formattedBid} by ${user}` : "No bids yet";
  
  highestBidElement.textContent = `Current Highest Bid: ${highestBidText}`;
  highestBidElement.style.marginTop = "10px";

  const detailsSection = document.querySelector(".details");
  detailsSection.appendChild(highestBidElement);

  document.querySelector(".close-btn").addEventListener("click", () => {
    overviewSection.style.display = "none";
    highestBidElement.remove(); // Clean up the appended element??
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

async function get_balance() {
  const userID = localStorage.getItem('userID');
  try {
      const response = await fetch(`${API_URL_USER}/get-wallet?userID=${encodeURIComponent(userID)}`);
      if (response.ok) {
          const data = await response.json();
          if (data.success) {
              document.getElementById('current-balance').textContent = `${data.wallet || 0} CSP`;
          } else {
              console.error('Error fetching wallet:', data.error);
              document.getElementById('current-balance').textContent = 'Error loading balance';
          }
      } else {
          console.error('Request failed:', response.status, response.statusText);
          document.getElementById('current-balance').textContent = 'Error loading balance';
      }
  } catch (error) {
      console.error('Error fetching wallet:', error);
      document.getElementById('current-balance').textContent = 'Error loading balance';
  }
}
// Initialize auction
const initializeAuction = () => {
  fetchAuctionItems();
  attachEventListeners();
};
async function customer_support(){
  customer_support_button = document.getElementById('customer-support');
  if (customer_support_button){
      customer_support_button.addEventListener('click', function () {
          // Check if the script is already loaded
          if (!document.getElementById('tawk-script')) {
              // Dynamically create the script element
              var s1 = document.createElement("script");
              s1.async = true;
              s1.src = 'https://embed.tawk.to/675fd299af5bfec1dbdc8347/1if74tanu';
              s1.id = 'tawk-script'; // Add an ID to prevent duplicate loading
              s1.setAttribute('crossorigin', '*');
              document.body.appendChild(s1);
          } else {
              // If the script is already loaded, toggle the widget
              if (typeof Tawk_API !== 'undefined') {
                  Tawk_API.toggle();
              }
          }
      }
      )  
  }  
}

initializeAuction();
customer_support();

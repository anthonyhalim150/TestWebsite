document.addEventListener("DOMContentLoaded", () => {
  let auctionItems = []; // Array to store auction items
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

      renderAuctionItems();
    } catch (error) {
      console.error("Error fetching auction items:", error);
    }
  };

  // Render auction items to the page
  const renderAuctionItems = () => {
    const auctionContainer = document.getElementById("auction-items");
    auctionContainer.innerHTML = ""; // Clear existing items

    auctionItems.forEach(item => {
      const itemElement = document.createElement("div");
      itemElement.classList.add("auction-item");
      itemElement.dataset.id = item.id;

      itemElement.innerHTML = `
        <img src="${item.image}" alt="${item.name}" class="item-image">
        <h3>${item.name}</h3>
        <p>Starting Price: $${item.startingPrice}</p>
        <p class="timer" id="timer-${item.id}"></p>
      `;

      auctionContainer.appendChild(itemElement);

      startItemTimer(item); // Start countdown for each item

      // Add click event to display product overview
      itemElement.addEventListener("click", () => showProductOverview(item));
    });
  };

  // Start timer for a specific auction item
  const startItemTimer = (item) => {
    const timerElement = document.getElementById(`timer-${item.id}`);
    const endTime = new Date(item.startingTime.getTime() + item.duration * 1000); // Add duration to starting time

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
  const showProductOverview = (item) => {
    const overviewSection = document.getElementById("product-overview");
    overviewSection.style.display = "block";

    // Fill in product details
    document.getElementById("product-name").value = item.name;
    document.getElementById("product-price").value = item.startingPrice;
    document.getElementById("product-stock").value = item.stock;
    document.getElementById("product-description").value = item.description;
    document.getElementById("product-category").value = item.category;

    // Format starting time to local time for displa

    const productImage = document.getElementById("product-image");
    productImage.src = item.image || "placeholder.jpg"; // Fallback if no image is provided

    // Add event listener to close button
    document.querySelector(".close-btn").addEventListener("click", () => {
      overviewSection.style.display = "none";
    });
  };

  // Initialize auction
  fetchAuctionItems();
});

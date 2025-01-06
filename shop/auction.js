document.addEventListener("DOMContentLoaded", async () => {
    const timerElement = document.getElementById("timer");
    const hammerElement = document.getElementById("hammer");
    const countdownElement = document.getElementById("countdown");
    const itemElement = document.getElementById("item");
  
    let items = []; // Array to store auction items
    let currentIndex = 0;
  
    // Fetch all auction items from the server
    const fetchAuctionItems = async () => {
      try {
        const response = await fetch('/auction');
        const data = await response.json();
        items = data.map(item => ({
          id: item.itemID,
          name: item.item_name,
          startingPrice: item.starting_price,
          timeLeft: item.time
        }));
        if (items.length > 0) {
          loadItem(items[currentIndex]);
        }
      } catch (error) {
        console.error("Error fetching auction data:", error);
      }
    };
  
    // Load an item into the auction display
    const loadItem = (item) => {
      itemElement.textContent = `Item: ${item.name} | Starting Price: $${item.startingPrice}`;
      timeLeft = item.timeLeft;
      updateTimer();
    };
  
    // Update the timer display
    const updateTimer = () => {
      const minutes = Math.floor(timeLeft / 60).toString().padStart(2, "0");
      const seconds = (timeLeft % 60).toString().padStart(2, "0");
      timerElement.textContent = `${minutes}:${seconds}`;
    };
  
    // Start the countdown
    const countdown = () => {
      countdownElement.style.display = "block";
      let count = 3;
      countdownElement.textContent = count;
  
      const countdownInterval = setInterval(() => {
        count--;
        countdownElement.textContent = count;
  
        if (count === 0) {
          clearInterval(countdownInterval);
          countdownElement.style.display = "none";
          hammerFall();
          moveToNextItem();
        }
      }, 1000);
    };
  
    // Hammer animation
    const hammerFall = () => {
      hammerElement.style.top = "50%";
      hammerElement.style.transform = "translate(-50%, -50%)";
    };
  
    // Move to the next item in the auction
    const moveToNextItem = () => {
      currentIndex++;
      if (currentIndex < items.length) {
        loadItem(items[currentIndex]);
      } else {
        console.log("Auction ended.");
      }
    };
  
    // Main timer logic
    const timerInterval = setInterval(() => {
      timeLeft--;
      updateTimer();
  
      if (timeLeft <= 0) {
        clearInterval(timerInterval);
        countdown();
      }
    }, 1000);
  
    // Initialize the auction
    await fetchAuctionItems();
  });
  
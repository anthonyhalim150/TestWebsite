document.addEventListener("DOMContentLoaded", () => {
  let items = []; // Array to store auction items
  let currentIndex = 0;
  let timeLeft = 0; // Timer for the current item

  // DOM Elements
  const timerElement = document.getElementById("timer");
  const hammerElement = document.getElementById("hammer");
  const countdownElement = document.getElementById("countdown");
  const itemElement = document.getElementById("item");
  // Fetch all auction items from the server
  const fetchAuctionItems = async () => {
    try {
      const response = await fetch("http://localhost:3000/auction");
      const data = await response.json();
      items = data.map(item => ({
        id: item.itemID,
        name: item.item_name,
        startingPrice: item.starting_price,
        timeLeft: item.duration
      }));
      initializeAuction();
    } catch (error) {
      console.error("Error fetching auction data:", error);
    }
  };

  // Initialize auction based on fetched items
  const initializeAuction = () => {
    if (items.length === 0) {
      itemElement.textContent = "No Items Available";
      timerElement.style.display = "none";
      countdownElement.style.display = "none";
    } else {
      loadItem(items[currentIndex]);
      startTimer();
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

  // Start the countdown with hammer strikes
  const startCountdown = () => {
    let strikeCount = 0;

    const strikeHammer = () => {
      hammerElement.classList.add("hit");
      setTimeout(() => {
        hammerElement.classList.remove("hit");
        strikeCount++;

        if (strikeCount < 3) {
          setTimeout(strikeHammer, 500); // Delay between strikes
        } else {
          moveToNextItem(); // Proceed to the next item after strikes
        }
      }, 500); // Duration of each strike
    };

    strikeHammer();
  };

  // Move to the next item in the auction
  const moveToNextItem = () => {
    currentIndex++;
    if (currentIndex < items.length) {
      loadItem(items[currentIndex]);
      startTimer();
    } else {
      console.log("Auction ended.");
      itemElement.textContent = "No Items Available";
      timerElement.style.display = "none";
    }
  };

  // Start the timer for the current item
  const startTimer = () => {
    const timerInterval = setInterval(() => {
      timeLeft--;
      updateTimer();

      if (timeLeft <= 0) {
        clearInterval(timerInterval);
        startCountdown();
      }
    }, 1000);
  };

  // Initialize the auction process
  fetchAuctionItems();
});

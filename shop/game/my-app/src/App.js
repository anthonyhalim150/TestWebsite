import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import Miner from "./components/Miner";
import Upgrade from "./components/Upgrade";
import { updateWallet, getWalletBalance } from "./api/wallet";

function App() {
  const [tokens, setTokens] = useState(0); // Initial token balance
  const [miningPower, setMiningPower] = useState(1);
  const [tokensToSync, setTokensToSync] = useState(0);

  const userId = 1; // Replace with dynamic user ID if applicable

  // Fetch wallet balance on initial load
  useEffect(() => {
    const fetchWalletBalance = async () => {
      try {
        const balance = await getWalletBalance(userId);
        setTokens(balance); // Set tokens to fetched balance
        console.log("Wallet balance fetched:", balance);
      } catch (error) {
        console.error("Failed to fetch wallet balance:", error);
      }
    };

    fetchWalletBalance();
  }, []); // Empty dependency array ensures this runs only once

  const mineTokens = () => {
    setTokens((prev) => prev + miningPower);
    setTokensToSync((prev) => prev + miningPower);
  };

  const handleWalletUpdate = async () => {
    if (tokensToSync === 0) return; // Skip if no tokens to sync
    try {
      await updateWallet(userId, tokensToSync); // Ensure userId and tokensToSync are sent
      console.log("Wallet updated!");
      setTokensToSync(0); // Reset after syncing
    } catch (error) {
      console.error("Failed to update wallet:", error);
    }
  };

  // Sync tokens with the server every 5 seconds
  useEffect(() => {
    const interval = setInterval(handleWalletUpdate, 5000);
    return () => clearInterval(interval); // Clean up on unmount
  }, [tokensToSync]);

  const upgradeMiningPower = () => {
    const upgradeCost = 10 * miningPower;
    if (tokens >= upgradeCost) {
      setTokens((prev) => prev - upgradeCost);
      setTokensToSync((prev) => prev - upgradeCost); // Sync the spent tokens
      setMiningPower((prev) => prev + 1);
    } else {
      alert("Not enough tokens!");
    }
  };

  return (
    <div className="app">
      <Header tokens={tokens} />
      <Miner mineTokens={mineTokens} />
      <Upgrade miningPower={miningPower} upgradeMiningPower={upgradeMiningPower} />
    </div>
  );
}

export default App;

import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import Miner from "./components/Miner";
import Upgrade from "./components/Upgrade";
import { updateWallet } from "./api/wallet";

function App() {
  const [tokens, setTokens] = useState(0);
  const [miningPower, setMiningPower] = useState(1);
  const [tokensToSync, setTokensToSync] = useState(0);

  const mineTokens = () => {
    setTokens((prev) => prev + miningPower);
    setTokensToSync((prev) => prev + miningPower);
  };


  const handleWalletUpdate = async () => {
    try {
      const userId = 1; // Ensure this is the correct user ID
      const result = await updateWallet(userId, tokensToSync);
      console.log("Wallet updated!");
      setTokensToSync(0); // Reset after syncing
    } catch (error) {
      console.error("Failed to update wallet:", error);
    }
  };
  

  // Sync tokens with the server every 5 seconds
  useEffect(() => {
    const interval = setInterval(handleWalletUpdate, 5000);
    return () => clearInterval(interval);
  }, [tokensToSync]);

  const upgradeMiningPower = () => {
    const upgradeCost = 10 * miningPower;
    if (tokens >= upgradeCost) {
      setTokens(tokens - upgradeCost);
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

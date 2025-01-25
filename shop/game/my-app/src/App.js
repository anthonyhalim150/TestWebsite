import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import Miner from "./components/Miner";
import Upgrade from "./components/Upgrade";

function App() {
  const [tokens, setTokens] = useState(0);
  const [miningPower, setMiningPower] = useState(1);
  const [tokensToSync, setTokensToSync] = useState(0);

  const mineTokens = () => {
    setTokens((prev) => prev + miningPower);
    setTokensToSync((prev) => prev + miningPower);
  };

  const syncTokensWithServer = async () => {
    if (tokensToSync > 0) {
      try {
        const response = await fetch("/api/update-wallet", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: 1, tokens: tokensToSync }), // Replace `1` with actual user ID
        });
        if (!response.ok) throw new Error("Failed to sync tokens");
        setTokensToSync(0); // Reset after syncing
      } catch (error) {
        console.error("Error syncing tokens:", error);
      }
    }
  };

  // Sync tokens with the server every 5 seconds
  useEffect(() => {
    const interval = setInterval(syncTokensWithServer, 5000);
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

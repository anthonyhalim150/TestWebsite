import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import Miner from "./components/Miner";
import Upgradable from "./components/Upgradable";
import MyUpgrades from "./components/MyUpgrades";
import { updateWallet, getWalletBalance } from "./api/wallet";

function App() {
  const [tokens, setTokens] = useState(0);
  const [miningPower, setMiningPower] = useState(1);
  const [tokensToSync, setTokensToSync] = useState(0);
  const [currentSection, setSection] = useState("miner");
  const userId = 1; // Replace with dynamic user ID if applicable

  useEffect(() => {
    const fetchWalletBalance = async () => {
      try {
        const balance = await getWalletBalance(userId);
        setTokens(balance);
      } catch (error) {
        console.error("Failed to fetch wallet balance:", error);
      }
    };

    fetchWalletBalance();
  }, [userId]);

  const mineTokens = () => {
    setTokens((prev) => prev + miningPower);
    setTokensToSync((prev) => prev + miningPower);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (tokensToSync > 0) {
        updateWallet(userId, tokensToSync);
        setTokensToSync(0);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [tokensToSync, userId]);

  return (
    <div className="app">
      <Header tokens={tokens} setSection={setSection} />

      {currentSection === "miner" && <Miner mineTokens={mineTokens} />}
      {currentSection === "upgradable" && (
        <Upgradable tokens={tokens} setTokens={setTokens} userId={userId} />
      )}
      {currentSection === "my-upgrades" && <MyUpgrades userId={userId} />}
      {currentSection === "stats" && (
        <div className="stats">
          <h2>Stats</h2>
          <p>Tokens: {tokens}</p>
          <p>Mining Power: {miningPower}</p>
        </div>
      )}
    </div>
  );
}

export default App;

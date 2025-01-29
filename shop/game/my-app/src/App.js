import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import Miner from "./components/Miner";
import Upgradable from "./components/Upgradable";
import MyUpgrades from "./components/MyUpgrades";
import { updateWallet, getUserStats } from "./api/wallet";
import { sanitizeInput } from "./utils/auth"; // Import sanitization

function App() {
  const [tokens, setTokens] = useState(0);
  const [miningPower, setMiningPower] = useState(1);
  const [tokensToSync, setTokensToSync] = useState(0);
  const [currentSection, setSection] = useState("miner");
  const userId = 1; // Replace with dynamic user ID if applicable

  useEffect(() => {
    const fetchWalletAndPower = async () => {
      try {
        const { wallet, miningPower } = await getUserStats(sanitizeInput(userId));
        setTokens(wallet);
        setMiningPower(miningPower+1);
      } catch (error) {
        console.error("Failed to fetch wallet and mining power:", error);
      }
    };

    fetchWalletAndPower();
  }, [userId]);

  const mineTokens = () => {
    setTokens((prev) => prev + miningPower);
    setTokensToSync((prev) => prev + miningPower);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (tokensToSync > 0) {
        updateWallet(sanitizeInput(userId), sanitizeInput(tokensToSync));
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
        <Upgradable tokens={tokens} setTokens={setTokens} userId={sanitizeInput(userId)} />
      )}
      {currentSection === "my-upgrades" && <MyUpgrades userId={sanitizeInput(userId)} />}
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

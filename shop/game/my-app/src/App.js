import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import Miner from "./components/Miner";
import Upgradable from "./components/Upgradable";
import MyUpgrades from "./components/MyUpgrades";
import Stats from "./components/Stats"; // Import Stats Component
import { updateWallet, getUserStats } from "./api/user";
import { sanitizeInput } from "./utils/auth"; // Import sanitization

function App() {
  const [tokens, setTokens] = useState(0);
  const [tokensToSync, setTokensToSync] = useState(0);
  const [miningPower, setMiningPower] = useState(1);
  const [miningEfficiency, setMiningEfficiency] = useState(1.0);
  const [currentSection, setSection] = useState("miner");
  const userId = 1; // Replace with dynamic user ID if applicable

  useEffect(() => {
    const fetchWalletAndPower = async () => {
      try {
        const { wallet, miningPower, miningEfficiency } = await getUserStats(sanitizeInput(userId));
        setTokens(wallet);
        setMiningPower(miningPower);
        setMiningEfficiency(miningEfficiency);
      } catch (error) {
        console.error("Failed to fetch wallet and mining power:", error);
      }
    };

    fetchWalletAndPower();
  }, [userId]);

  const mineTokens = () => {
    const earnedTokens = miningPower * miningEfficiency;
    setTokens((prev) => prev + earnedTokens);
    setTokensToSync((prev) => prev + earnedTokens);
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
        <Upgradable tokens={tokens} setTokens={setTokens} userId={sanitizeInput(userId)} setMiningPower={setMiningPower}  setMiningEfficiency={setMiningEfficiency}/>
      )}
      {currentSection === "my-upgrades" && <MyUpgrades userId={sanitizeInput(userId)} />}
      {currentSection === "stats" && (
        <Stats tokens={tokens} miningPower={miningPower} miningEfficiency={miningEfficiency} />
      )}
    </div>
  );
}

export default App;

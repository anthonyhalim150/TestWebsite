import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import Miner from "./components/Miner";
import Upgradable from "./components/Upgradable";
import MyUpgrades from "./components/MyUpgrades";
import Stats from "./components/Stats";
import { updateWallet, getUserStats, gainXp } from "./api/user";
import { sanitizeInput } from "./utils/auth";

function App() {
  const [tokens, setTokens] = useState(0);
  const [tokensToSync, setTokensToSync] = useState(0);
  const [miningPower, setMiningPower] = useState(1);
  const [miningEfficiency, setMiningEfficiency] = useState(0.0);
  const [autoMiningRate, setAutoMiningRate] = useState(0); 
  const [level, setLevel] = useState(1);
  const [xp, setXp] = useState(0);
  const [xpToSync, setXpToSync] = useState(0);
  const [currentSection, setSection] = useState("miner");
  const userId = 1;

  // ✅ Fetch all user stats on load
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const sanitizedUserId = sanitizeInput(userId);
        const { wallet, level, xp, miningPower, miningEfficiency, autoMiningRate } = await getUserStats(sanitizedUserId);
        setTokens(Number(wallet));
        setLevel(Number(level));
        setXp(Number(xp));
        setMiningPower(Number(miningPower));
        setMiningEfficiency(Number(miningEfficiency));
        setAutoMiningRate(Number(autoMiningRate)); 
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      }
    };

    fetchStats();
  }, [userId]);

 
  const mineTokens = () => {
    const earnedTokens = miningPower * (1+ parseFloat(miningEfficiency));

    if (isNaN(earnedTokens) || isNaN(tokens)) {
      console.error("NaN detected in tokens calculation!", { miningPower, miningEfficiency, earnedTokens });
      return;
    }

    setTokens((prev) => Number(prev) + earnedTokens);
    setTokensToSync((prev) => Number(prev) + earnedTokens);

    const xpGained = 10;
    setXp((prevXp) => {
      let newXp = Number(prevXp) + xpGained;
      let newLevel = level;

      while (newXp >= newLevel * 100) {
        newXp -= newLevel * 100;
        newLevel += 1;
      }

      setLevel(newLevel);
      return newXp;
    });

    setXpToSync((prev) => Number(prev) + xpGained);
  };


  useEffect(() => {
    let autoMinerInterval;

    const startAutoMining = async () => {
      try {
        if (autoMiningRate > 0) {
          autoMinerInterval = setInterval(() => {
            setTokens((prev) => prev + autoMiningRate);
            setTokensToSync((prev) => prev + autoMiningRate);
          }, 5000); 
        }
      } catch (error) {
        console.error("Failed to start auto-mining:", error);
      }
    };

    startAutoMining();

    return () => clearInterval(autoMinerInterval);
  }, [autoMiningRate]);

  // ✅ Sync Tokens and XP Every 5 Seconds (Existing)
  useEffect(() => {
    const interval = setInterval(() => {
      if (tokensToSync > 0) {
        updateWallet(sanitizeInput(userId), sanitizeInput(tokensToSync));
        setTokensToSync(0);
      }
      if (xpToSync > 0) {
        gainXp(sanitizeInput(userId), sanitizeInput(xpToSync))
          .then(async ({ level, xp, leveledUp, autoMiningRate }) => {
            setLevel(level);
            setXp(xp);
            setAutoMiningRate(autoMiningRate); 

            if (leveledUp) {
              console.log("User leveled up! Fetching updated mining stats...");
              const { miningPower, miningEfficiency } = await getUserStats(sanitizeInput(userId));
              setMiningPower(miningPower);
              setMiningEfficiency(miningEfficiency);
            }
          })
          .catch((error) => console.error("Error syncing XP:", error));
        setXpToSync(0);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [tokensToSync, xpToSync, userId]);

  return (
    <div className="app">
      <Header tokens={tokens} setSection={setSection} level={level} xp={xp} />
      {currentSection === "miner" && <Miner mineTokens={mineTokens} />}
      {currentSection === "upgradable" && (
        <Upgradable
          tokens={tokens}
          setTokens={setTokens}
          userId={sanitizeInput(userId)}
          setMiningPower={setMiningPower}
          setMiningEfficiency={setMiningEfficiency}
          setAutoMiningRate={setAutoMiningRate} 
        />
      )}
      {currentSection === "my-upgrades" && <MyUpgrades userId={sanitizeInput(userId)} />}
      {currentSection === "stats" && (
        <Stats tokens={tokens} miningPower={miningPower} miningEfficiency={miningEfficiency} autoMiningRate={autoMiningRate} />
      )}
    </div>
  );
}

export default App;

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
  const [miningEfficiency, setMiningEfficiency] = useState(1.0);
  const [level, setLevel] = useState(1);
  const [xp, setXp] = useState(0);
  const [xpToSync, setXpToSync] = useState(0);
  const [currentSection, setSection] = useState("miner");
  const userId = 1;

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const sanitizedUserId = sanitizeInput(userId);
        const { wallet, level, xp, miningPower, miningEfficiency } = await getUserStats(sanitizedUserId);

        // Ensure values are numbers
        setTokens(Number(wallet));
        setLevel(Number(level));
        setXp(Number(xp));
        setMiningPower(Number(miningPower)); // Includes level perks + upgrades
        setMiningEfficiency(Number(miningEfficiency)); // Includes level perks + upgrades
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      }
    };

    fetchStats();
  }, [userId]);

  const mineTokens = () => {
    const earnedTokens = miningPower * miningEfficiency;

    // Prevent NaN errors
    if (isNaN(earnedTokens) || isNaN(tokens)) {
      console.error("NaN detected in tokens calculation!", { miningPower, miningEfficiency, earnedTokens });
      return;
    }

    setTokens((prev) => Number(prev) + earnedTokens);
    console.log(earnedTokens);
    setTokensToSync((prev) => Number(prev) + earnedTokens);

    // Local XP update first
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
    const interval = setInterval(() => {
        if (tokensToSync > 0) {
            updateWallet(sanitizeInput(userId), sanitizeInput(tokensToSync));
            setTokensToSync(0);
        }
        if (xpToSync > 0) {
            gainXp(sanitizeInput(userId), sanitizeInput(xpToSync))
                .then(async ({ level, xp, leveledUp }) => {
                    setLevel(level);
                    setXp(xp);

                    // ✅ If the user leveled up, fetch full stats
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
        />
      )}
      {currentSection === "my-upgrades" && <MyUpgrades userId={sanitizeInput(userId)} />}
      {currentSection === "stats" && <Stats tokens={tokens} miningPower={miningPower} miningEfficiency={miningEfficiency} />}
    </div>
  );
}

export default App;

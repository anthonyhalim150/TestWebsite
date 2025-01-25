import React, { useState } from "react";
import Header from "./components/Header";
import Miner from "./components/Miner";
import Upgrade from "./components/Upgrade";

function App() {
  const [tokens, setTokens] = useState(0);
  const [miningPower, setMiningPower] = useState(1);

  const mineTokens = () => {
    setTokens(tokens + miningPower);
  };

  const upgradeMiningPower = () => {
    const upgradeCost = 10 * miningPower; // Cost increases with mining power
    if (tokens >= upgradeCost) {
      setTokens(tokens - upgradeCost);
      setMiningPower(miningPower + 1);
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

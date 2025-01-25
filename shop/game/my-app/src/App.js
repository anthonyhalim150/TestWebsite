import React, { useState } from "react";
import Header from "./components/Header";
import Miner from "./components/Miner";
import Upgrade from "./components/Upgrade";
import './App.css';

function App() {
  const [tokens, setTokens] = useState(0);
  const [miningPower, setMiningPower] = useState(0.01);//Sets mining power to one

  const mineTokens = () => {
    setTokens(tokens + miningPower);
  };

  const upgradeMiningPower = () => {
    const upgradeCost = 7 * miningPower; // Cost increases with mining power
    if (tokens >= upgradeCost) {
      setTokens(tokens - upgradeCost);
      setMiningPower(miningPower + 0.01);
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

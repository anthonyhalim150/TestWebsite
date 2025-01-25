import React from "react";

function Upgrade({ miningPower, upgradeMiningPower }) {
  const upgradeCost = 10 * miningPower;

  return (
    <div className="upgrade">
      <h2>Upgrade Mining Power</h2>
      <p>Current Power: {miningPower.toFixed(2)}</p>
      <p>Upgrade Cost: {upgradeCost.toFixed(2)} tokens</p>
      <button onClick={upgradeMiningPower} className="upgrade-button">
        Upgrade
      </button>
    </div>
  );
}

export default Upgrade;

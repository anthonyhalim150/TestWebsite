import React from "react";

function Miner({ mineTokens }) {
  return (
    <div className="miner">
      <h2>Click to Mine Tokens</h2>
      <button onClick={mineTokens} className="mine-button">
        Mine
      </button>
    </div>
  );
}

export default Miner;

import React from "react";
import { sanitizeInput } from "../utils/auth";

function Stats({ tokens, miningPower, miningEfficiency, autoMiningRate }) {
  return (
    <div className="stats">
      <h2>User Stats</h2>
      <p><strong>Tokens:</strong> {sanitizeInput(tokens.toFixed(2))}</p>
      <p><strong>Mining Power:</strong> {sanitizeInput(miningPower)}</p>
      <p><strong>Mining Efficiency:</strong> x{1+sanitizeInput(parseFloat(miningEfficiency.toFixed(2)))}</p>
      <p><strong>Auto-Mining Rate:</strong> {sanitizeInput(autoMiningRate)} tokens/5 sec</p>
    </div>
  );
}

export default Stats;

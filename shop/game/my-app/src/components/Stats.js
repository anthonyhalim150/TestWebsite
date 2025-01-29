import React from "react";
import "../styles/components/Stats.css"; // Import styling (create if necessary)
import {sanitizeInput} from "../utils/auth";


function Stats({ tokens, miningPower, miningEfficiency }) {
  return (
    <div className="stats">
      <h2>User Stats</h2>
      <p><strong>Tokens:</strong> {sanitizeInput(tokens.toFixed(2))}</p>
      <p><strong>Mining Power:</strong> {sanitizeInput(miningPower)}</p>
      <p><strong>Mining Efficiency:</strong> x {sanitizeInput(miningEfficiency.toFixed(2))}</p>
    </div>
  );
}

export default Stats;

import React, { useState, useEffect } from "react";
import axios from "axios";

function Upgradable({ tokens, setTokens, userId }) {
  const [upgradable, setUpgradable] = useState([]);

  useEffect(() => {
    const fetchUpgradable = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/api/upgrades-not-owned?userId=${userId}`);
        setUpgradable(response.data.upgradable || []);
      } catch (error) {
        console.error("Error fetching upgradable:", error);
      }
    };

    fetchUpgradable();
  }, [userId]);

  const handlePurchase = async (upgrade) => {
    if (tokens < upgrade.cost) {
      alert("Not enough tokens!");
      return;
    }

    try {
      await axios.post("http://localhost:8080/api/purchase-upgrade", {
        userId,
        upgradeId: upgrade.id,
      });

      setTokens(tokens - upgrade.cost);

      // Remove the purchased upgrade from the upgradable list
      setUpgradable((prev) => prev.filter((u) => u.id !== upgrade.id));
    } catch (error) {
      console.error("Error purchasing upgrade:", error);
      alert("Failed to purchase upgrade. Please try again.");
    }
  };

  return (
    <div className="upgrade">
      <h2>Upgradable</h2>
      <div className="upgrade-list">
        {upgradable.map((upgrade) => (
          <div key={`upgradable-${upgrade.id}`} className="upgrade-item">
            <h3>{upgrade.name}</h3>
            <p>{upgrade.description}</p>
            <p>Cost: {upgrade.cost} tokens</p>
            <p>Power Increase: {upgrade.mining_power_increase}</p>
            <button
              onClick={() => handlePurchase(upgrade)}
              disabled={tokens < upgrade.cost}
            >
              Buy
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Upgradable;

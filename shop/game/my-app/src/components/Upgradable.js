import React, { useState, useEffect } from "react";
import axios from "axios";

function Upgradable({ tokens, setTokens, userId }) {
  const [upgradable, setUpgradable] = useState([]);
  const [loadingUpgrades, setLoadingUpgrades] = useState({}); // Track loading state for each upgrade

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

    // Set loading state for this upgrade
    setLoadingUpgrades((prev) => ({ ...prev, [upgrade.id]: true }));

    try {
      await axios.post("http://localhost:8080/api/purchase-upgrade", {
        userId,
        upgradeId: upgrade.id,
      });

      setTokens(tokens - upgrade.cost);

      // Update the list locally by removing the purchased upgrade
      setUpgradable((prev) => prev.filter((u) => u.id !== upgrade.id));
    } catch (error) {
      console.error("Error purchasing upgrade:", error);
      alert("Failed to purchase upgrade. Please try again.");
    } finally {
      // Reset loading state for this upgrade
      setLoadingUpgrades((prev) => ({ ...prev, [upgrade.id]: false }));
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
              disabled={tokens < upgrade.cost || loadingUpgrades[upgrade.id]}
            >
              {loadingUpgrades[upgrade.id] ? "Owned" : "Buy"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Upgradable;

import React, { useState, useEffect } from "react";
import axios from "axios";

function MyUpgrades({ userId }) {
  const [myUpgrades, setMyUpgrades] = useState([]);

  useEffect(() => {
    const fetchMyUpgrades = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/api/upgrades-owned?userId=${userId}`);
        setMyUpgrades(response.data.myUpgrades || []);
      } catch (error) {
        console.error("Error fetching my upgrades:", error);
      }
    };

    fetchMyUpgrades();
  }, [userId]);

  return (
    <div className="my-upgrades">
      <h2>My Upgrades</h2>
      <div className="upgrade-list">
        {myUpgrades.map((upgrade) => (
          <div key={`owned-${upgrade.id}`} className="upgrade-item">
            <h3>{upgrade.name}</h3>
            <p>{upgrade.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MyUpgrades;

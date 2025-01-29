import axios from "axios";

const BASE_URL = "http://localhost:8080/api"; // Update if needed

// Fetch upgrades the user does not own

export const fetchUserUpgrades = async (userId) => {
    try {
      const response = await axios.get(`${BASE_URL}/upgrades-owned`, {
        params: { userId },
      });
      return response.data.myUpgrades || [];
    } catch (error) {
      console.error("Error fetching my upgrades:", error);
      throw error;
    }
  };
  
export const fetchUpgradesNotOwned = async (userId) => {
  try {
    const response = await axios.get(`${BASE_URL}/upgrades-not-owned?userId=${userId}`);
    return response.data.upgradable || [];
  } catch (error) {
    console.error("Error fetching upgradable:", error);
    throw error;
  }
};

// Purchase an upgrade
export const purchaseUpgrade = async (userId, upgradeId) => {
  try {
    await axios.post(`${BASE_URL}/purchase-upgrade`, {
      userId,
      upgradeId,
    });
  } catch (error) {
    console.error("Error purchasing upgrade:", error);
    throw error;
  }
};


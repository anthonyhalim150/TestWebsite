import axios from "axios";

export const updateWallet = async (userId, tokens) => {
  try {
    const response = await axios.post("http://localhost:8080/api/update-wallet", { userId, tokens });
    return response.data;
  } catch (error) {
    console.error("Error updating wallet:", error);
    throw error;
  }
};

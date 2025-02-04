import axios from "axios";
import { sanitizeInput } from "../utils/auth";

const BASE_URL = "http://localhost:8080/api";

export const fetchLuckyBoxes = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/lucky-boxes`);
    return response.data.boxes || [];
  } catch (error) {
    console.error("Error fetching lucky boxes:", error);
    throw error;
  }
};

export const rollLuckyBox = async (userId, boxId) => {
  try {
    const response = await axios.post(`${BASE_URL}/roll-lucky-box`, {
      userId: sanitizeInput(userId),
      boxId: sanitizeInput(boxId),
    });

    return response.data;
  } catch (error) {
    console.error("Error rolling lucky box:", error);
    throw error;
  }
};

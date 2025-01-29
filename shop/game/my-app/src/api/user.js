import axios from "axios";
import { sanitizeInput } from "../utils/auth";

const BASE_URL = "http://localhost:8080/api"; // Adjust if necessary


export const getUserStats = async (userId) => {
    try {
        const sanitizedUserId = sanitizeInput(userId); // Sanitize user ID
        const response = await axios.get(`${BASE_URL}/get-stats-user`, {
            params: { userId: sanitizedUserId },
        });
        if (response.data.success) {
            return {
                wallet: sanitizeInput(parseFloat(response.data.wallet)), // Ensure the result is a number
                miningPower: sanitizeInput(parseInt(response.data.miningPower, 10)) || 1, // Ensure miningPower is an integer
                miningEfficiency: sanitizeInput(parseFloat(response.data.miningEfficiency)) || 1,
            };
        } else {
            throw new Error(response.data.message || "Failed to fetch user stats.");
        }
    } catch (error) {
        console.error("Error fetching user stats:", error);
        throw error;
    }
};


// Update wallet balance
export const updateWallet = async (userId, tokensToSync) => {
    try {
        const sanitizedUserId = sanitizeInput(userId); // Sanitize user ID
        const sanitizedAmount = sanitizeInput(tokensToSync); // Sanitize amount
        const response = await axios.post(`${BASE_URL}/update-wallet`, {
            userId: sanitizedUserId,
            tokensToSync: sanitizedAmount,
        });

        if (response) {
            return response.data.message; // Return success message
        } else {
            throw new Error(response.data.message || "Failed to update wallet.");
        }
    } catch (error) {
        console.error("Error updating wallet:", error);
        throw error;
    }
};

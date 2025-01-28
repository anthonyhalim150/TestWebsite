import axios from "axios";
import { sanitizeInput } from "../utils/auth";

const BASE_URL = "http://localhost:8080/api"; // Adjust if necessary

// Get wallet balance
export const getWalletBalance = async (userId) => {
    try {
        const sanitizedUserId = sanitizeInput(userId); // Sanitize user ID
        const response = await axios.get(`${BASE_URL}/get-wallet-user`, {
            params: { userId: sanitizedUserId },
        });

        if (response.data.success) {
            return parseFloat(response.data.wallet); // Ensure the result is a number
        } else {
            throw new Error(response.data.message || "Failed to fetch wallet balance.");
        }
    } catch (error) {
        console.error("Error fetching wallet balance:", error);
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

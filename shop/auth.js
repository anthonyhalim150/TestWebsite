let cachedUserID = null;
const API_URL = 'https://anthonyhalim-150-723848267249.us-central1.run.app';
const API_URL_USER = 'https://users-723848267249.us-central1.run.app';


function getCookie(name) {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? decodeURIComponent(match[2]) : null;
}


// Function to fetch and cache userID securely
async function getUserID() {
    if (cachedUserID) {
        return cachedUserID; // Return cached userID if available
    }

    try {
        const response = await fetch("https://anthonyhalim-150-723848267249.us-central1.run.app/me", {
            method: "GET",
            credentials: "include", // Include cookies for authentication
        });

        if (response.ok) {
            const data = await response.json();
            const userID = sanitizeInput(data.user.id);
            cachedUserID = userID; // Cache the sanitized userID
            return cachedUserID;
        } else {
            console.error("Failed to fetch user ID: User not authenticated");
            return null;
        }
    } catch (error) {
        console.error("Error fetching user ID:", error);
        return null;
    }
}

// Function to ensure user is authenticated
async function ensureAuthenticated(path) {
    const userID = await getUserID();
    if (!userID && redirectOnFail) {
        console.error("User not authenticated. Redirecting to login.");
        window.location.href = sanitizeURL(path); // Redirect safely
    }
    return userID;
}

// Utility function to sanitize input and prevent XSS
function sanitizeInput(input) {
    const div = document.createElement("div");
    div.textContent = input;
    return div.innerHTML;
}

// Utility function to sanitize URLs
function sanitizeURL(url) {
    try {
        const sanitizedURL = new URL(url, window.location.origin);
        return sanitizedURL.href;
    } catch (e) {
        console.error("Invalid URL:", e);
        return "/";
    }
}
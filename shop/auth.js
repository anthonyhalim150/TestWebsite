// auth.js
let cachedUserID = null;

// Function to fetch and cache userID
async function getUserID() {
    if (cachedUserID) {
        return cachedUserID; // Return cached userID if available
    }

    try {
        const response = await fetch("https://anthonyhalim-150-723848267249.us-central1.run.app/me", {
            method: "GET",
            credentials: "include", // Include cookies
        });

        if (response.ok) {
            const data = await response.json();
            cachedUserID = data.user.id; // Cache the userID
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
async function ensureAuthenticated(redirectOnFail = true) {
    const userID = await getUserID();
    if (!userID && redirectOnFail) {
        console.error("User not authenticated. Redirecting to login.");
        window.location.href = "login.html"; // Redirect to login if not authenticated
    }
    return userID;
}

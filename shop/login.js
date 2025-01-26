document.getElementById("login_form").addEventListener("submit", async (event) => {
    event.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;

    try {
        const response = await fetch(`${API_URL}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
            credentials: "include", // Ensures cookies are included
        });

        if (response.ok) {
            alert("Login successful!");
            await checkLoginStatus(); // Verify user status after login
        } else {
            const result = await response.json();
            document.getElementById("login_message").innerText = `Login failed: ${result.error}`;
        }
    } catch (error) {
        console.error("Error during login:", error);
        document.getElementById("login_message").innerText = "Error connecting to server.";
    }
});

async function checkLoginStatus() {
    try {
        const response = await fetch(`${API_URL}/me`, {
            method: "GET",
            credentials: "include", // Include cookies
        });

        if (response.ok) {
            await response.json();
            window.location.href = "./index.html"; // Redirect to the dashboard
        } else {
            alert("User not verified. Please log in again.");
        }
    } catch (error) {
        console.error("Error checking login status:", error);
    }
}

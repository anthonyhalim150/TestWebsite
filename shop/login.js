document.getElementById('login_form').addEventListener('submit', async (event) => {
    event.preventDefault();

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const result = await response.json();

        if (result.success) {
            alert('Login successful!');
            localStorage.setItem('userID', result.userID); // Save user ID (or token if available)
            localStorage.setItem('username', username); // Save username
            localStorage.setItem('role', result.role);
            localStorage.setItem('token', result.token); // Store the token in localStorage after login
            window.location.href = './index.html'; // Redirect to shop or dashboard
        } else {
            document.getElementById('login_message').innerText = `Login failed: ${result.error}`;
        }
    } catch (error) {
        console.error('Error during login:', error);
        document.getElementById('login_message').innerText = 'Error connecting to server.';
    }
});

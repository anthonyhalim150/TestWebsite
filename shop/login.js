document.getElementById('login_form').addEventListener('submit', async (event) => {
    event.preventDefault();

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;

    const API_URL = 'http://localhost:3000/login';
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const result = await response.json();

        if (result.success) {
            alert('Login successful!');
            window.location.href = 'shop.html'; // Redirect to shop or dashboard
        } else {
            document.getElementById('login_message').innerText = `Login failed: ${result.error}`;
        }
    } catch (error) {
        console.error('Error during login:', error);
        document.getElementById('login_message').innerText = 'Error connecting to server.';
    }
});

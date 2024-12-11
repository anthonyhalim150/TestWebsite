document.getElementById('sign-up-form').addEventListener('submit', async (event) => {
    event.preventDefault();

    // Extract form values
    const username = document.getElementById('username').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirm_password = document.getElementById("confirm_password").value;

    if (password !== confirm_password) {
        alert("Passwords do not match!");
        return;
    }


    // Create the user object
    const user = { username, email, password };

    // Define API URL (update nnti klo hosted on a server)
    const API_URL = 'http://localhost:3000/signup';

    try {
        // Send data to the server
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(user),
        });

        // Process server response
        const result = await response.json();
        console.log('Server response:', result);
        if (response.ok && result.success) {
            alert(`Account created successfully for ${username}!`);
            document.getElementById('signup_message').innerText = 'Sign-Up Successful!';
            window.location.href = 'index.html';
            document.getElementById('signupForm').reset(); // Reset form
        } else {
            document.getElementById('signup_message').innerText = 'Sign-Up Failed: ' + (result.error || 'Unknown error.');
        }
    } catch (error) {
        console.error('Error connecting to server:', error);
        document.getElementById('signup_message').innerText = 'Error connecting to server. Please try again later.';
    }
});

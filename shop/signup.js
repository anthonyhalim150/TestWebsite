document.getElementById('signupForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const user = { username, email, password };

    try {
        const response = await fetch('http://localhost:3000/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(user)
        });
        const result = await response.json();
        if (result.success) {
            document.getElementById('signupMessage').innerText = 'Sign-Up Successful!';
        } else {
            document.getElementById('signupMessage').innerText = 'Sign-Up Failed: ' + result.error;
        }
    } catch (error) {
        document.getElementById('signupMessage').innerText = 'Error connecting to server.';
    }
});
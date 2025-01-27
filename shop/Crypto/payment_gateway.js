
async function get_balance() {
    const userID = localStorage.getItem('userID');
    const amount = sessionStorage.getItem('transaction_amount');
    const formattedTotal = `${parseFloat(amount).toLocaleString('en-US') || 0} CSP`
    document.getElementById('current-payable').textContent = formattedTotal;
    try {
        const response = await fetch(`${API_URL_USER}/get-wallet-user?userID=${encodeURIComponent(userID)}`);
        if (response.ok) {
            const data = await response.json();
            if (data.success) {
                document.getElementById('current-balance').textContent = `${parseFloat(data.wallet).toLocaleString('en-US') || 0} CSP`;
            } else {
                console.error('Error fetching wallet:', data.error);
                document.getElementById('current-balance').textContent = 'Error loading balance';
            }
        } else {
            console.error('Request failed:', response.status, response.statusText);
            document.getElementById('current-balance').textContent = 'Error loading balance';
        }
    } catch (error) {
        console.error('Error fetching wallet:', error);
        document.getElementById('current-balance').textContent = 'Error loading balance';
    }
}

// Redirect to the dashboard for wallet recharge
function redirectToDashboard() {
    window.location.href = '../Dashboard/index.html';
}

// Confirm the payment
async function confirmPayment() {
    const paymentMethod = document.querySelector('input[name="payment-method"]:checked');
    const amount = sessionStorage.getItem('transaction_amount');
    if (!paymentMethod) {
        alert('Please select a payment method.');
        return;
    }

    if (paymentMethod.value === 'csp') {
        window.location.href = 'crypto_pay.html';
        return;
    }

    if (isNaN(amount) || amount <= 0) {
        alert('Invalid payment amount.');
        return;
    }

    const response = await fetch(`${API_URL_USER}/wallet-checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userID: localStorage.getItem('userID'), amount: amount}),
    });

    const result = await response.json();

    if (result.success) {
        sessionStorage.setItem('payment_status', 'success');
        window.location.href = '../cart.html';
    } else {
        sessionStorage.setItem('payment_status', 'failed');
        alert(result.message || 'Payment failed.');
    }
}

// Handle the back button
function handleBack() {
    sessionStorage.setItem('payment_status', 'failed');
    window.location.href = '../cart.html';
}

// Load the wallet balance on page load
document.addEventListener('DOMContentLoaded', get_balance);

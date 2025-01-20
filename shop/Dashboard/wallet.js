const API_URL = "https://anthonyhalim-150-723848267249.us-central1.run.app";
const API_URL_USER = 'https://users-723848267249.us-central1.run.app';
function check_address_form(){
    const address_form = document.getElementById('address-form');
    if(address_form){
        address_form.addEventListener('submit', async function (event) {
            event.preventDefault(); // Prevent the default form submission

            const walletAddress = document.getElementById('crypto-wallet').value.trim();
            const userID = localStorage.getItem('userID'); // Assuming userID is stored in localStorage

            // Validate the input
            if (!walletAddress) {
                alert('Please enter your wallet address.');
                return;
            }

            if (!userID) {
                alert('User ID is missing. Please log in again.');
                return;
            }

            try {
                const response = await fetch(`${API_URL_USER}/update-address`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ userID, walletAddress }),
                });

                const result = await response.json();

                if (result.success) {
                    alert('Wallet address updated successfully!');
                    get_address(userID);
                } else {
                    alert('Failed to update wallet address: ' + result.error);
                }
            } catch (error) {
                console.error('Error updating wallet address:', error);
                alert('An error occurred. Please try again.');
            }
        });
    }
}

function check_deposit_form(){
    const deposit_form = document.getElementById('deposit-form');
    if(deposit_form){
        deposit_form.addEventListener('submit', async function (event) {
            event.preventDefault(); 

            const deposit_amount = document.getElementById('deposit-amount').value.trim();
            const userID = localStorage.getItem('userID'); 
            if (!deposit_amount) {
                alert('Please enter how much you want to deposit!');
                return;
            }

            if (!userID) {
                alert('User ID is missing. Please log in again.');
                return;
            }
            sessionStorage.clear();
            const serverSecret = "OneTwoThreeOneTwoThrees"; 
            const currentTime = new Date().toISOString();
            const note = btoa(`${userID}:${serverSecret}:${currentTime}`); // Simple Base64 encoding (replace with a secure hash if needed)
            const owner_address = "AHBYUBQCHEMEFS3FGV57MGLHNXTLN2SAFFYGEDB2ZVEAOT3MA5KFSA7WEU"

            sessionStorage.setItem('address', owner_address)
            sessionStorage.setItem('transaction_amount', deposit_amount);
            sessionStorage.setItem('note', note);
            sessionStorage.setItem('type', 'deposit');
            window.location.href = '../Crypto/crypto_pay.html';
        })

    }
}

function monitorPaymentStatus() {
    const interval = setInterval(() => {
      const paymentStatus = sessionStorage.getItem("payment_status");
        
      if (paymentStatus === "success") {
        clearInterval(interval);
        confirm_deposit();
      } else if (paymentStatus === "failed") {
        alert("Payment failed. Please try again.");
        sessionStorage.clear(); 
        clearInterval(interval); 
      }
      clearInterval(interval); 
    }, 500);
}

async function confirm_deposit() {
    const recipientAddress = "AHBYUBQCHEMEFS3FGV57MGLHNXTLN2SAFFYGEDB2ZVEAOT3MA5KFSA7WEU"; 
    const note = sessionStorage.getItem('note');
    const assetId = 732664447; // Your CSP asset ID
    const amount = sessionStorage.getItem('transaction_amount');
    const txid = sessionStorage.getItem('txid'); // Ensure transaction ID is fetched from session storage
    if (!txid || !amount || !note || !recipientAddress) {
        alert("Missing required transaction details. Please try again.");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/check-transaction`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                txid, // Transaction ID
                amount, // Amount in micro-units
                assetId, // Asset ID
                recipientAddress, // Recipient address
                orderId: `order_${note} DO NOT CHANGE THIS AS IT CONFIRMS YOUR TRANSACTION!`, // Include the note (or the expected value)
            }),
        });

        const data = await response.json();

        if (data.completed) {
            const userID = localStorage.getItem('userID');

            if (!userID) {
                alert('You must be logged in!');
                window.location.href = '../index.html'; // Fixed syntax for redirection
                return;
            }

            try {
                const walletResponse = await fetch(`${API_URL_USER}/update-wallet`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userID, amount }),
                });

                const result = await walletResponse.json();

                if (result.success) {
                    alert('Deposit Successful!');
                    get_balance(userID);
                    sessionStorage.clear();
                } else {
                    alert('Deposit failed: ' + result.error);
                    sessionStorage.clear();
                }
            } catch (error) {
                console.error('Error during deposit:', error);
                alert('An error occurred during deposit. Please try again.');
                sessionStorage.clear();
            }
        } else {
            alert("Server error/Data did not match expected values!");
            sessionStorage.clear();
        }
    } catch (error) {
        console.error("Error during transaction verification:", error);
        alert("An error occurred while verifying the transaction. Please try again.");
        sessionStorage.clear();
    }
}

// Function to fetch and update wallet balance
async function get_balance(userID) {
    try {
        const response = await fetch(`${API_URL_USER}/get-wallet?userID=${encodeURIComponent(userID)}`);
        if (response.ok) {
            const data = await response.json();
            if (data.success) {
                document.getElementById('current-balance').textContent = `${data.wallet || 0} CSP`;
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

// Function to fetch and update wallet address
async function get_address(userID) {
    try {
        const response = await fetch(`${API_URL_USER}/get-address?userID=${encodeURIComponent(userID)}`);
        if (response.ok) {
            const data = await response.json();
            if (data.success) {
                document.getElementById('current-address').textContent = data.address || 'Not available';
            } else {
                console.error('Error fetching address:', data.error);
                document.getElementById('current-address').textContent = 'Error loading address';
            }
        } else {
            console.error('Request failed:', response.status, response.statusText);
            document.getElementById('current-address').textContent = 'Error loading address';
        }
    } catch (error) {
        console.error('Error fetching address:', error);
        document.getElementById('current-address').textContent = 'Error loading address';
    }
}


document.addEventListener('DOMContentLoaded', () => {
    const userID = localStorage.getItem('userID'); // Assume userID is stored in localStorage

    if (!userID) {
        console.error('UserID is not available.');
        return alert('User is not logged in.');
    }
    get_balance(userID);
    get_address(userID);
    check_address_form();
    check_deposit_form();
    monitorPaymentStatus();
});


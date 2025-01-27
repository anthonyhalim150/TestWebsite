function check_address_form() {
    const address_form = document.getElementById('address-form');
    if (address_form) {
        address_form.addEventListener('submit', async function (event) {
            event.preventDefault(); // Prevent the default form submission

            const walletAddress = document.getElementById('crypto-wallet').value.trim();
            const userID = await getCookie(); // Securely retrieve userID

            // Validate the input
            if (!walletAddress) {
                alert('Please enter your wallet address.');
                return;
            }


            try {
                const response = await fetch(`${API_URL_USER}/update-address-user`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ userID, walletAddress }),
                    credentials: 'include', // Include cookies for authentication
                });

                const result = await response.json();

                if (result.success) {
                    alert('Wallet address updated successfully!');
                    get_address();
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

function check_deposit_form() {
    const deposit_form = document.getElementById('deposit-form');
    if (deposit_form) {
        deposit_form.addEventListener('submit', async function (event) {
            event.preventDefault();

            const deposit_amount = parseFloat(
                document.getElementById('deposit-amount').value.replace(/,/g, '').trim()
            );
            const userID = await getCookie(); // Securely retrieve userID

            if (!deposit_amount) {
                alert('Please enter how much you want to deposit!');
                return;
            }

            const serverSecret = "OneTwoThreeOneTwoThrees";
            const currentTime = new Date().toISOString();
            const note = btoa(`${userID}:${serverSecret}:${currentTime}`);
            const owner_address = "AHBYUBQCHEMEFS3FGV57MGLHNXTLN2SAFFYGEDB2ZVEAOT3MA5KFSA7WEU";

            try {
                // Send data to the server to store in cookies
                const response = await fetch(`${API_URL}/start-transaction`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        address: owner_address,
                        transaction_amount: deposit_amount,
                        note,
                        type: 'deposit',
                    }),
                    credentials: 'include', // Include cookies
                });

                const result = await response.json();

                if (result.success) {
                    window.location.href = sanitizeURL("/shop/Crypto/crypto_pay.html"); // Redirect safely
                } else {
                    alert('Failed to initiate transaction: ' + result.error);
                }
            } catch (error) {
                console.error('Error initiating transaction:', error);
                alert('An error occurred. Please try again.');
            }
        });
    }
}

function check_withdraw_form() {
    const withdraw_form = document.getElementById('withdraw-form');
    if (withdraw_form) {
        withdraw_form.addEventListener('submit', async function (event) {
            event.preventDefault();

            const withdraw_amount = parseFloat(document.getElementById('withdraw-amount').value.replace(/,/g, '').trim());

            if (!withdraw_amount) {
                alert('Please enter a valid amount!');
                return;
            }

            const userID = await getCookie(); // Securely retrieve userID


            try {
                const response = await fetch(`${API_URL_USER}/withdraw-user`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        userID,
                        amount: withdraw_amount,
                    }),
                    credentials: 'include', // Include cookies for authentication
                });

                const result = await response.json();
                if (response.ok) {
                    alert(`Withdrawal Successful!`);
                    get_balance();
                } else {
                    alert(`Withdrawal failed: ${result.error || result.message}`);
                }
            } catch (error) {
                console.error("Error during withdrawal:", error);
                alert("An error occurred. Please try again.");
            }
        });
    }
}



async function confirm_deposit() {
    try {
        // Fetch transaction details from the server
        const transactionDetailsResponse = await fetch(`${API_URL}/get-transaction-details`, {
            method: "GET",
            credentials: "include", // Include HttpOnly cookies
        });

        if (!transactionDetailsResponse.ok) {
            throw new Error("Failed to fetch transaction details from the server.");
        }

        const { txid, transaction_amount, note, recipient_address } = await transactionDetailsResponse.json();

        if (!txid || !transaction_amount || !note || !recipient_address) {
            return;
        }

        const assetId = 732664447; // Your CSP asset ID
        const asset_decimal = 2;
        const amount = parseFloat(transaction_amount) * Math.pow(10, asset_decimal);

        // Validate the transaction using the details
        const response = await fetch(`${API_URL}/check-transaction`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                txid,
                amount,
                assetId,
                recipientAddress: recipient_address,
                orderId: `order_${note} DO NOT CHANGE THIS AS IT CONFIRMS YOUR TRANSACTION!`,
            }),
            credentials: "include", // Include HttpOnly cookies
        });

        const data = await response.json();

        if (data.completed) {
            const userID = await getCookie(); // Securely retrieve userID using await getCookie()

            const converted_amount = parseFloat(amount) / Math.pow(10, asset_decimal);

            // Update the user's wallet balance
            const walletResponse = await fetch(`${API_URL_USER}/update-wallet-user`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userID, amount: converted_amount }),
                credentials: "include", // Include HttpOnly cookies
            });

            const result = await walletResponse.json();

            if (result.success) {
                alert("Deposit Successful!");
                get_balance(); // Update user balance
            } else {
                alert("Deposit failed: " + result.error);
            }
        } else {
            alert("Server error/Data did not match expected values!");
        }
    } catch (error) {
    }
}


// Function to fetch and update wallet balance
async function get_balance() {
    const userID = await getCookie(); // Securely retrieve userID

    try {
        const response = await fetch(`${API_URL_USER}/get-wallet-user?userID=${encodeURIComponent(userID)}`, {
            method: 'GET',
            credentials: 'include', // Include cookies for authentication
        });
        if (response.ok) {
            const data = await response.json();
            if (data.success) {
                document.getElementById('current-balance').textContent = `${parseFloat(data.wallet).toLocaleString('en-US') || 0} CSP`;
                return parseFloat(data.wallet);
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
async function get_address() {
    const userID = await getCookie(); // Securely retrieve userID

    try {
        const response = await fetch(`${API_URL_USER}/get-address-user?userID=${encodeURIComponent(userID)}`, {
            method: 'GET',
            credentials: 'include', // Include cookies for authentication
        });
        if (response.ok) {
            const data = await response.json();
            if (data.success) {
                document.getElementById('current-address').textContent = data.address || 'Not available';
                return data.address || 'Not available';
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

// Function to format deposit and withdrawal amounts with commas and decimals
function format_amount() {
    const depositInput = document.getElementById("deposit-amount");
    const withdrawInput = document.getElementById("withdraw-amount");

    function formatWithCommas(value) {
        return value.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    if (depositInput) {
        depositInput.addEventListener("input", (event) => {
            let value = event.target.value.replace(/,/g, ''); // Remove commas
            if (!isNaN(value) && value !== "") {
                event.target.value = formatWithCommas(value); // Add commas back
            }
        });

        depositInput.addEventListener("blur", (event) => {
            let value = event.target.value.replace(/,/g, ''); // Remove commas for processing
            if (value === "" || isNaN(value)) {
                event.target.value = ""; // Clear invalid input
            } else {
                event.target.value = parseFloat(value).toLocaleString('en-US', { 
                    minimumFractionDigits: 2, 
                    maximumFractionDigits: 2 
                });
            }
        });
    }

    if (withdrawInput) {
        withdrawInput.addEventListener("input", (event) => {
            let value = event.target.value.replace(/,/g, ''); // Remove commas
            if (!isNaN(value) && value !== "") {
                event.target.value = formatWithCommas(value); // Add commas back
            }
        });

        withdrawInput.addEventListener("blur", (event) => {
            let value = event.target.value.replace(/,/g, ''); // Remove commas for processing
            if (value === "" || isNaN(value)) {
                event.target.value = ""; // Clear invalid input
            } else {
                event.target.value = parseFloat(value).toLocaleString('en-US', { 
                    minimumFractionDigits: 2, 
                    maximumFractionDigits: 2 
                });
            }
        });
    }
}


document.addEventListener('DOMContentLoaded', () => {
    get_balance();
    get_address();
    check_address_form();
    check_deposit_form();
    check_withdraw_form();
    format_amount();
    confirm_deposit();
});

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
            const response = await fetch('/update-wallet', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userID, walletAddress }),
            });

            const result = await response.json();

            if (result.success) {
                alert('Wallet address updated successfully!');
            } else {
                alert('Failed to update wallet address: ' + result.error);
            }
        } catch (error) {
            console.error('Error updating wallet address:', error);
            alert('An error occurred. Please try again.');
        }
    });
}
const deposit_form = document.getElementById('deposit-form');
if(deposit_form){
    deposit_form.addEventListener('submit', async function (event) {
        event.preventDefault(); // Prevent the default form submission

        const deposit_amount = document.getElementById('deposit-amount').value.trim();
        const userID = localStorage.getItem('userID'); // Assuming userID is stored in localStorage

        // Validate the input
        if (!deposit_amount) {
            alert('Please enter how much you want to deposit!');
            return;
        }

        if (!userID) {
            alert('User ID is missing. Please log in again.');
            return;
        }

        try {
            const response = await fetch('/update-wallet', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userID, walletAddress }),
            });

            const result = await response.json();

            if (result.success) {
                alert('Wallet address updated successfully!');
            } else {
                alert('Failed to update wallet address: ' + result.error);
            }
        } catch (error) {
            console.error('Error updating wallet address:', error);
            alert('An error occurred. Please try again.');
        }
    });
}

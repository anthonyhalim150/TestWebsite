// Import QRCode library
const qrCodeCanvas = document.getElementById("qr-code");
const transactionStatus = document.getElementById("transaction-status");
const backToHomeButton = document.getElementById("back-to-home");
const API_URL = "https://anthonyhalim-150-723848267249.us-central1.run.app";

const recipientAddress = "LOF7AOSWGGOXJQXKIP4TVLL2643C2H2EKWB2XZ6FWZZYPVWHXKS4WUUZVQ"; // Replace with your recipient address
const transactionAmount = sessionStorage.getItem('transaction_amount');
const note = sessionStorage.getItem('note');
const assetId = 732664447; // Your CSP asset ID
const amount = 10; // Amount to transfer in micro-units (1 CSP = 100 micro-units)

// Generate QR code with payment details
function generateQRCode() {
  const paymentDetails = {
    recipient: recipientAddress,
    assetID: assetId,
    amount_in: amount,
    note: `order_${note} DO NOT CHANGE THIS AS IT CONFIRMS YOUR TRANSACTION!`,
  };
  // Create a JSON string for the QR code
  const qrCodeData = `algorand://${paymentDetails.recipient}?amount=${amount}&asset=${paymentDetails.assetID}&note=${encodeURIComponent(paymentDetails.note)}`;

  // Generate and display the QR code
  const qr = new QRious({
    element: qrCodeCanvas,
    size: 200,
    value: qrCodeData,
  });

  if (qr) {
    transactionStatus.textContent = "Scan the QR code to pay.";
  } else {
    transactionStatus.textContent = "Failed to generate QR code. Please try again.";
  }
}


async function monitorTransaction(txid) {
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
    const userID = localStorage.getItem('userID');

    if (!userID) {
        alert('You must be logged in to checkout.');
        return;
    }
    const data = await response.json();
    if (data.completed) {
      try {
        const response = await fetch(`${API_URL}/checkout`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userID })
        });
        const result = await response.json();

        if (result.success) {
          transactionStatus.textContent = `Transaction confirmed! Amount: ${data.amount} CSP. Redirecting...`;
          transactionStatus.classList.add("success");
        } else {
            alert('Checkout failed: ' + result.error);
        }
      } 
      catch (error) {
          console.error('Error during checkout:', error);
          alert('An error occurred during checkout. Please try again.');
      }

      // Redirect after confirmation
      setTimeout(() => {
        window.location.href = "../index.html";
      }, 3000);
    } else if (data.error) {
      transactionStatus.textContent = `Error: ${data.error}`;
      transactionStatus.classList.add("error");
    } else {
      transactionStatus.textContent = "Waiting for payment...";
    }
  } catch (error) {
    console.error("Error checking transaction status:", error);
    transactionStatus.textContent = "Error verifying transaction. Please try again.";
  }
}


async function getLatestTransactionId() {
  const indexerUrl = 'https://testnet-idx.4160.nodely.dev/v2/accounts';

  try {
    const response = await fetch(`${indexerUrl}/${recipientAddress}/transactions?limit=1`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.transactions && data.transactions.length > 0) {
      const latestTransaction = data.transactions[0];
      return latestTransaction.id; // Return the transaction ID
    } else {
      console.warn('No transactions found for the recipient address.');
      return null;
    }
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return null;
  }
}


// Poll for transaction status every 5 seconds
async function startTransactionMonitoring() {
  try {
    const txid = await getLatestTransactionId(); // Replace with actual function to get the txid
    if (txid) {
      await monitorTransaction(txid);
    }
  } catch (error) {
    console.error("Error monitoring transaction:", error);
  }
}

setInterval(startTransactionMonitoring, 5000);

// Redirect to home when button is clicked
backToHomeButton.addEventListener("click", () => {
  window.location.href = "../index.html";
});

// Call the QR code generation function when the page loads
generateQRCode();

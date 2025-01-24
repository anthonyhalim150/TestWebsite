// Import QRCode library
const qrCodeCanvas = document.getElementById("qr-code");
const transactionStatus = document.getElementById("transaction-status");
const backToHomeButton = document.getElementById("back-to-home");
const API_URL = "https://anthonyhalim-150-723848267249.us-central1.run.app";

const recipientAddress = sessionStorage.getItem('address'); // Replace with your recipient address
const note = sessionStorage.getItem('note');
const assetId = 732664447; // Your CSP asset ID
const asset_decimal = 2;
const amount = parseFloat(sessionStorage.getItem('transaction_amount')) * Math.pow(10, asset_decimal);

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
        txid, 
        amount, 
        assetId, 
        recipientAddress, 
        orderId: `order_${note} DO NOT CHANGE THIS AS IT CONFIRMS YOUR TRANSACTION!`, // Include the note (or the expected value) to double check
      }),
    });
    const userID = localStorage.getItem('userID');

    if (!userID) {
        alert('You must be logged in!');
        window.location.href('../index.html');
    }
    const data = await response.json();
    if (data.completed) {
      // Redirect after confirmation
      setTimeout(() => {
        transactionStatus.textContent = `Transaction confirmed! Amount: ${data.amount} CSP. Redirecting...`;
        transactionStatus.classList.add("success");
        const homeButton = document.getElementById("back-to-home");
        const type = sessionStorage.getItem('type');
        if (type === 'cart'){
          if (homeButton) {
            homeButton.style.display = "none";
          }
          sessionStorage.clear();
          sessionStorage.setItem("payment_status", "success");
          window.location.href = "../cart.html";
        }
        else if (type === 'deposit'){
          if (homeButton) {
            homeButton.style.display = "none";
          }
          sessionStorage.setItem("payment_status", "success");
          sessionStorage.setItem("txid", txid);
          window.location.href = "../Dashboard/wallet.html";
        }
      }, 1500);

    } 
    else if (data.error ==  "Transaction details do not match the expected values.") {
      sessionStorage.setItem("payment_status", "failed");
      transactionStatus.textContent = "Waiting for payment...";
    } 
    else {
      sessionStorage.setItem("payment_status", "failed");
      transactionStatus.textContent = "Waiting for payment...";
    }
  } 
  catch (error) {
    sessionStorage.setItem("payment_status", "failed");
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
    const txid = await getLatestTransactionId(); 
    if (txid) {
      await monitorTransaction(txid);
    }
  } catch (error) {
    console.error("Error monitoring transaction:", error);
  }
}

setInterval(startTransactionMonitoring, 2000);

// Redirect to home when button is clicked
backToHomeButton.addEventListener("click", () => {
  const type = sessionStorage.getItem('type');
  confirm("Are you sure to cancel payment? If you have just paid, do not leave the page and wait to be redirected!");
  if (type === 'cart'){
    sessionStorage.clear();
    sessionStorage.setItem("payment_status", "failed");
    window.location.href = "../cart.html";
  }
  else if (type === 'deposit'){
    sessionStorage.clear();
    sessionStorage.setItem("payment_status", "failed");
    window.location.href = "../Dashboard/wallet.html";
  }
});

// Call the QR code generation function when the page loads
generateQRCode();

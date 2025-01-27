// Import QRCode library
const qrCodeCanvas = document.getElementById("qr-code");
const transactionStatus = document.getElementById("transaction-status");
const backToHomeButton = document.getElementById("back-to-home");
const API_URL = "https://anthonyhalim-150-723848267249.us-central1.run.app";

async function fetchTransactionDetails() {
  try {
      const response = await fetch(`${API_URL}/get-transaction-details`, {
          method: "GET",
          credentials: "include", // Include cookies in the request
      });

      if (!response.ok) {
          throw new Error("Failed to fetch transaction details.");
      }

      const { address, transaction_amount, note} = await response.json();

      // Use the details to generate the QR code
      generateQRCode(address, transaction_amount, note);
  } catch (error) {
      console.error("Error fetching transaction details:", error);
      alert("Failed to retrieve transaction details. Please try again.");
  }
}
// Generate QR code with payment details
function generateQRCode(address, amount, note) {
  const paymentDetails = {
      recipient: address,
      assetID: assetId,
      amount_in: parseFloat(amount) * Math.pow(10, asset_decimal),
      note: `order_${note} DO NOT CHANGE THIS AS IT CONFIRMS YOUR TRANSACTION!`,
  };
  const qrCodeData = `algorand://${paymentDetails.recipient}?amount=${paymentDetails.amount_in}&asset=${paymentDetails.assetID}&note=${encodeURIComponent(paymentDetails.note)}`;

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
      // Fetch transaction details from cookies
      const transactionDetailsResponse = await fetch(`${API_URL}/get-transaction-details`, {
          method: "GET",
          credentials: "include", // Include cookies in the request
      });

      if (!transactionDetailsResponse.ok) {
          throw new Error("Failed to fetch transaction details from cookies.");
      }

      const { address: recipientAddress, transaction_amount, note } = await transactionDetailsResponse.json();
      const amount = parseFloat(transaction_amount) * Math.pow(10, asset_decimal);

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
              orderId: `order_${note} DO NOT CHANGE THIS AS IT CONFIRMS YOUR TRANSACTION!`, // Include the note
          }),
      });
      const data = await response.json();

      if (data.completed) {
          // Redirect after confirmation
              transactionStatus.textContent = `Transaction confirmed! Amount: ${amount} CSP. Redirecting...`;
              transactionStatus.classList.add("success");
              const homeButton = document.getElementById("back-to-home");

              // Use type from cookies
              const type = sessionStorage.getItem('type');

              if (type === "cart") {
                  if (homeButton) {
                      homeButton.style.display = "none";
                  }
                  window.location.href = "../cart.html";
              } 
              else if (type === "deposit") {
                  if (homeButton) {
                      homeButton.style.display = "none";
                  }
                  window.location.href = "../Dashboard/wallet.html";
              }
      } else if (data.error === "Transaction details do not match the expected values.") {
          transactionStatus.textContent = "Waiting for payment...";
      } else {
          transactionStatus.textContent = "Waiting for payment...";
      }
  } catch (error) {
      sessionStorage.setItem("payment_status", "failed");
      console.error("Error checking transaction status:", error);
      transactionStatus.textContent = "Error verifying transaction. Please try again.";
  }
}



async function getLatestTransactionId() {
  const transactionDetailsResponse = await fetch(`${API_URL}/get-transaction-details`, {
      method: "GET",
      credentials: "include", // Include cookies in the request
  });

  if (!transactionDetailsResponse.ok) {
      throw new Error("Failed to fetch transaction details.");
  }

  const { address: recipientAddress } = await transactionDetailsResponse.json();

  const indexerUrl = "https://testnet-idx.4160.nodely.dev/v2/accounts";

  try {
      const response = await fetch(`${indexerUrl}/${recipientAddress}/transactions?limit=1`, {
          method: "GET",
      });

      if (!response.ok) {
          throw new Error(`Network response was not ok: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.transactions && data.transactions.length > 0) {
          const latestTransaction = data.transactions[0];
          return latestTransaction.id; // Return the transaction ID
      } else {
          console.warn("No transactions found for the recipient address.");
          return null;
      }
  } catch (error) {
      console.error("Error fetching transactions:", error);
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
    window.location.href = "../cart.html";
  }
  else if (type === 'deposit'){
    window.location.href = "../Dashboard/wallet.html";
  }
});

document.addEventListener("DOMContentLoaded", fetchTransactionDetails);

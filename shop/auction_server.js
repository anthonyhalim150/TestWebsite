const express = require("express");
const mysql = require("mysql2"); // For MySQL (use sqlite3 if using SQLite)
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Database connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root", // Replace with your MySQL username
  password: "Vvs319338", // Replace with your MySQL password
  database: "ecommerce", // Replace with your database name
});

// Connect to the database
db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err);
    process.exit(1);
  }
  console.log("Connected to the database.");
});

// Routes

// Fetch all auction items
app.get("/auction", (req, res) => {
  const query = "SELECT * FROM auction_items WHERE is_expired = FALSE";
  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching auction items:", err);
      res.status(500).json({ error: "Database query failed" });
    } else {
      res.json(results);
    }
  });
});

app.post("/bids", (req, res) => {
  let { auction_item_id, user_id, bid_amount } = req.body;//change this to const later
  user_id = 1; //delete this later
  const sql = `
    INSERT INTO BIDS (auction_item_id, user_id, bid_amount)
    VALUES (?, ?, ?)
    ON DUPLICATE KEY UPDATE bid_amount = VALUES(bid_amount);
  `;

  db.query(sql, [auction_item_id, user_id, bid_amount], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Error placing bid." });
    }
    res.json({ message: "Bid placed successfully." });
  });
});

// Cancel a bid
app.delete("/bids", (req, res) => {
  let { auction_item_id, user_id } = req.query;//change this to const later

  user_id = 1; //delete this later
  const sql = "DELETE FROM BIDS WHERE auction_item_id = ? AND user_id = ?";
  db.query(sql, [auction_item_id, user_id], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Error canceling bid." });
    }
    res.json({ message: "Bid canceled successfully." });
  });
});

// Fetch the highest bid for a specific auction item
app.get("/highest-bid", (req, res) => {
  const { auction_item_id } = req.query;

  if (!auction_item_id) {
    return res.status(400).json({ message: "Auction item ID is required." });
  }

  const sql = "SELECT MAX(bid_amount) AS highestBid FROM BIDS WHERE auction_item_id = ?";

  db.query(sql, [auction_item_id], (err, results) => {
    if (err) {
      console.error("Error fetching the highest bid:", err);
      return res.status(500).json({ error: "Database query failed" });
    }

    const highestBid = results[0]?.highestBid || 0; // Default to 0 if no bids exist
    res.json({ highestBid });
  });
});


// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

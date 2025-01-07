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
  const query = "SELECT * FROM auction_items";
  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching auction items:", err);
      res.status(500).json({ error: "Database query failed" });
    } else {
      res.json(results);
    }
  });
});

// Add a new auction item
app.post("/auction", (req, res) => {
  const { item_name, starting_price, time } = req.body;

  if (!item_name || !starting_price || !time) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const query = "INSERT INTO auction_items (item_name, starting_price, time) VALUES (?, ?, ?)";
  db.query(query, [item_name, starting_price, time], (err, result) => {
    if (err) {
      console.error("Error adding auction item:", err);
      res.status(500).json({ error: "Database query failed" });
    } else {
      res.status(201).json({ message: "Item added successfully", itemID: result.insertId });
    }
  });
});

// Delete an auction item
app.delete("/auction/:id", (req, res) => {
  const { id } = req.params;

  const query = "DELETE FROM auction_items WHERE itemID = ?";
  db.query(query, [id], (err, result) => {
    if (err) {
      console.error("Error deleting auction item:", err);
      res.status(500).json({ error: "Database query failed" });
    } else if (result.affectedRows === 0) {
      res.status(404).json({ error: "Item not found" });
    } else {
      res.json({ message: "Item deleted successfully" });
    }
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

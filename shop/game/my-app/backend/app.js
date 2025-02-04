const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const logger = require("./middleware/loggerMiddleware");
const { authenticateToken } = require("./middleware/authMiddleware");
const errorHandler = require("./middleware/errorHandlerMiddleware");
const userRoutes = require("./routes/userRoutes");
const upgradeRoutes = require("./routes/upgradeRoutes");
const equipmentRoutes = require("./routes/equipmentRoutes.js");
const luckyBoxRoutes = require("./routes/luckyBoxRoutes.js");

const app = express();


// Apply middleware
app.use(bodyParser.json()); // Parse JSON requests
app.use(cors({ origin: "http://localhost:3000" }));
app.use(logger); // Log requests


app.get("/", (req, res) => {
    res.send("Welcome to the API!");
  });
  
// Routes
app.use("/api", userRoutes); // Add authentication middleware if needed
// app.use("/api", authenticateToken, userRoutes);
app.use("/api", upgradeRoutes);
app.use("/api", equipmentRoutes);
app.use("/api", luckyBoxRoutes);

// Error handling middleware (should come last)
app.use(errorHandler);

module.exports = app;

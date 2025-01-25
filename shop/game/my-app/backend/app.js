const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const logger = require("./middleware/loggerMiddleware");
const { authenticateToken } = require("./middleware/authMiddleware");
const errorHandler = require("./middleware/errorHandlerMiddleware");
const userRoutes = require("./routes/userRoutes");

const app = express();

// Apply middleware
app.use(bodyParser.json()); // Parse JSON requests
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(logger); // Log requests

// Routes
app.use("/api", userRoutes); // Add authentication middleware if needed
// app.use("/api", authenticateToken, userRoutes);

// Error handling middleware (should come last)
app.use(errorHandler);

module.exports = app;

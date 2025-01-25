const express = require("express");
const { updateUserWallet } = require("./controllers/userController");
const router = express.Router();

router.post("/api/update-wallet", updateUserWallet);

module.exports = router;
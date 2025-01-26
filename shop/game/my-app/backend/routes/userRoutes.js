const express = require("express");
const { updateUserWallet } = require("../controllers/userController");
const router = express.Router();

router.post("/update-wallet", updateUserWallet);
  
router.get("/wallet/:userId", getWalletBalance);

module.exports = router;
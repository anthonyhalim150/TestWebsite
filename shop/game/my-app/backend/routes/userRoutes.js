const express = require("express");
const { updateUserWallet, getWalletBalance } = require("../controllers/userController");
const router = express.Router();

router.post("/update-wallet", updateUserWallet);
router.get("/get-wallet-user", getWalletBalance);

module.exports = router;
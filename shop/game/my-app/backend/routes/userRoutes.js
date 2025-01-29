const express = require("express");
const { updateUserWallet, getStats } = require("../controllers/userController");
const router = express.Router();

router.post("/update-wallet", updateUserWallet);
router.get("/get-stats-user", getStats);

module.exports = router;
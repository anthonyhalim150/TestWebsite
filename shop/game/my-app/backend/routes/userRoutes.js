const express = require("express");
const { updateUserWallet, getUserStats, gainXp } = require("../controllers/userController");
const router = express.Router();

router.post("/update-wallet", updateUserWallet);
router.get("/get-stats-user", getUserStats);
router.post("/gain-xp", gainXp);

module.exports = router;
const { updateWallet, getUserStats } = require("../entities/userEntity");
const { sanitizeInput } = require("../utils/auth"); // Import sanitization

exports.updateUserWallet = async (req, res) => {
  console.log("Controller hit: updateUserWallet");
  const { userId, tokensToSync } = req.body;

  if (!userId || !tokensToSync) {
    console.error("Validation failed: Missing userId or tokens.");
    return res.status(400).json({ message: "Missing userId or tokens." });
  }

  try {
    console.log(`Updating wallet for userId: ${userId}, tokens: ${tokensToSync}`);
    await updateWallet(sanitizeInput(userId), sanitizeInput(tokensToSync));
    res.status(200).json({ message: "Wallet updated successfully." });
  } catch (error) {
    console.error("Error in updateUserWallet:", error);
    res.status(500).json({ message: "Error updating wallet." });
  }
};

exports.getStats = async (req, res) => {
  let { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ success: false, message: "User ID is required." });
  }

  try {
    userId = sanitizeInput(userId);

    const { wallet, miningPower, miningEfficiency } = await getUserStats(userId); // Ensure function matches entity layer
    res.status(200).json({ success: true, wallet, miningPower, miningEfficiency });
  } catch (error) {
    console.error("Error fetching user stats:", error);
    res.status(500).json({ success: false, message: "Error fetching user stats." });
  }
};
const { updateWallet, getUserStats, addXpAndCheckLevel } = require("../entities/userEntity");
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

exports.getUserStats = async (req, res) => {
  const { userId } = req.query;

  if (!userId) {
      return res.status(400).json({ success: false, message: "User ID is required." });
  }

  try {
      const sanitizedUserId = sanitizeInput(userId);
      const userStats = await getUserStats(sanitizedUserId);
      res.status(200).json({ success: true, ...userStats });
  } catch (error) {
      console.error("Error fetching user stats:", error);
      res.status(500).json({ success: false, message: "Error fetching user stats." });
  }
};


exports.gainXp = async (req, res) => {
  const { userId, xpGained } = req.body;

  if (!userId || xpGained === undefined) {
      return res.status(400).json({ success: false, message: "User ID and XP amount are required." });
  }

  try {
      const sanitizedUserId = sanitizeInput(userId);
      const sanitizedXp = sanitizeInput(xpGained);
      const userStats = await addXpAndCheckLevel(sanitizedUserId, sanitizedXp);

      res.status(200).json({ success: true, ...userStats });
  } catch (error) {
      console.error("Error updating XP:", error);
      res.status(500).json({ success: false, message: "Error updating XP." });
  }
};


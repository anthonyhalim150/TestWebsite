const { updateWallet, getWalletBalance } = require("../entities/userEntity"); //Gets the result of the query, basically the function, but split fetch and the function.

exports.updateUserWallet = async (req, res) => {
  console.log("Controller hit: updateUserWallet");
  const { userId, tokensToSync } = req.body;

  if (!userId || !tokensToSync) {
    console.error("Validation failed: Missing userId or tokens.");
    return res.status(400).json({ message: "Missing userId or tokens." });
  }

  try {
    console.log(`Updating wallet for userId: ${userId}, tokens: ${tokensToSync}`);
    await updateWallet(userId, tokensToSync);
    res.status(200).json({ message: "Wallet updated successfully." });
  } catch (error) {
    console.error("Error in updateUserWallet:", error);
    res.status(500).json({ message: "Error updating wallet." });
  }
};

exports.getWalletBalance = async (req, res) => {
  const { userId } = req.query;

  if (!userId) {
      return res.status(400).json({ success: false, message: "User ID is required." });
  }

  try {
      const balance = await getWalletBalance(userId);
      res.status(200).json({ success: true, wallet: balance });
  } catch (error) {
      console.error("Error fetching wallet balance:", error);
      res.status(500).json({ success: false, message: "Error fetching wallet balance." });
  }
};


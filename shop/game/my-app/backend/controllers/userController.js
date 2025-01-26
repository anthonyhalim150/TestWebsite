const { updateWallet } = require("../entities/userEntity"); //Gets the result of the query, basically the function, but split fetch and the function.

exports.updateUserWallet = async (req, res) => {
  console.log("Controller hit: updateUserWallet");
  const { userId, tokens } = req.body;

  if (!userId || !tokens) {
    console.error("Validation failed: Missing userId or tokens.");
    return res.status(400).json({ message: "Missing userId or tokens." });
  }

  try {
    console.log(`Updating wallet for userId: ${userId}, tokens: ${tokens}`);
    await updateWallet(userId, tokens);
    res.status(200).json({ message: "Wallet updated successfully." });
  } catch (error) {
    console.error("Error in updateUserWallet:", error);
    res.status(500).json({ message: "Error updating wallet." });
  }
};

exports.getWalletBalance = async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
      return res.status(400).json({ message: "Missing userId." });
  }

  try {
      const [rows] = await db.execute("SELECT wallet FROM USERS WHERE id = ?", [userId]);
      if (rows.length > 0) {
          res.status(200).json({ wallet: rows[0].wallet });
      } else {
          res.status(404).json({ message: "User not found." });
      }
  } catch (error) {
      console.error("Error fetching wallet balance:", error);
      res.status(500).json({ message: "Error fetching wallet balance." });
  }
};

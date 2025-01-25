const { updateWallet } = require("../entities/userEntity"); //Gets the result of the query, basically the function, but split fetch and the function.

exports.updateUserWallet = async (req, res) => {
  const { userId, tokens } = req.body;

  if (!userId || !tokens) {
    return res.status(400).json({ message: "Missing userId or tokens." });
  }

  try {
    await updateWallet(userId, tokens);
    res.status(200).json({ message: "Wallet updated successfully." });
  } catch (error) {
    console.error("Error updating wallet:", error);
    res.status(500).json({ message: "Error updating wallet." });
  }
};

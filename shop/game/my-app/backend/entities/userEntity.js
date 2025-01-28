const db = require("../db");//The Query

exports.updateWallet = async (userId, tokensToSync) => {
  const query = "UPDATE USERS SET wallet = wallet + ? WHERE id = ?";
  await db.execute(query, [tokensToSync, userId]);
};

exports.getWalletBalance = async (userId) => {
  const query = "SELECT wallet FROM USERS WHERE id = ?";
  const [rows] = await db.execute(query, [userId]);
  return rows[0]?.wallet || 0; // Return 0 if no wallet is found
};
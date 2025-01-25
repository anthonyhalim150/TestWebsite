const db = require("../db");//The Query

exports.updateWallet = async (userId, tokens) => {
  const query = "UPDATE USERS SET wallet = wallet + ? WHERE id = ?";
  await db.execute(query, [tokens, userId]);
};

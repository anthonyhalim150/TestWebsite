const db = require("../db");
const { sanitizeInput } = require("../utils/auth"); // Import sanitization function

exports.updateWallet = async (userId, tokensToSync) => {
  const query = "UPDATE USERS SET wallet = wallet + ? WHERE id = ?";
  await db.execute(query, [sanitizeInput(tokensToSync), sanitizeInput(userId)]);
};

exports.getUserStats = async (userId) => {
  const walletQuery = "SELECT wallet FROM USERS WHERE id = ?";
  const upgradesQuery = `
      SELECT SUM(u.mining_power_increase) AS totalMiningPower
      FROM USER_UPGRADES uu
      JOIN UPGRADES u ON uu.upgrade_id = u.id
      WHERE uu.user_id = ?
  `;
  const [walletRows] = await db.execute(walletQuery, [sanitizeInput(userId)]);
  const [upgradeRows] = await db.execute(upgradesQuery, [sanitizeInput(userId)]);

  const wallet = walletRows[0]?.wallet || 0;
  const miningPower = upgradeRows[0]?.totalMiningPower || 1;

  return { wallet, miningPower };
};

const db = require("../db");
const { sanitizeInput } = require("../utils/auth"); // Import sanitization function

exports.updateWallet = async (userId, tokensToSync) => {
  const query = "UPDATE USERS SET wallet = wallet + ? WHERE id = ?";
  await db.execute(query, [sanitizeInput(tokensToSync), sanitizeInput(userId)]);
};


exports.getUserStats = async (userId) => {
  const query = `
      SELECT u.level, u.xp, u.wallet, 
             COALESCE(SUM(up.mining_power_increase), 0) AS totalUpgradePower,
             COALESCE(SUM(up.mining_efficiency_increase), 1.0) AS totalUpgradeEfficiency,
             COALESCE(lp.mining_power_boost, 0) AS levelPowerBoost,
             COALESCE(lp.mining_efficiency_boost, 0.0) AS levelEfficiencyBoost
      FROM USERS u
      LEFT JOIN USER_UPGRADES uu ON u.id = uu.user_id
      LEFT JOIN UPGRADES up ON uu.upgrade_id = up.id
      LEFT JOIN LEVEL_PERKS lp ON u.level = lp.level
      WHERE u.id = ?
      GROUP BY u.id;
  `;

  const [rows] = await db.execute(query, [sanitizeInput(userId)]);

  if (!rows.length) throw new Error("User not found");

  return {
      level: sanitizeInput(Number(rows[0].level)),
      xp: sanitizeInput(Number(rows[0].xp)),
      wallet: sanitizeInput(Number(rows[0].wallet)),
      miningPower: sanitizeInput(Number(rows[0].totalUpgradePower) + Number(rows[0].levelPowerBoost)),
      miningEfficiency: sanitizeInput(Number(rows[0].totalUpgradeEfficiency) + Number(rows[0].levelEfficiencyBoost)),
  };
};



exports.addXpAndCheckLevel = async (userId, xpGained) => {
  const connection = await db.getConnection();
  try {
      await connection.beginTransaction();

      // Fetch current level, XP, and wallet
      const [userRows] = await connection.query(
          "SELECT level, xp, wallet FROM USERS WHERE id = ?",
          [sanitizeInput(userId)]
      );

      if (!userRows.length) throw new Error("User not found");

      let { level, xp, wallet } = userRows[0];
      xp += xpGained;
      let rewards = [];
      let leveledUp = false;

      // Level-Up Check
      while (true) {
          const [levelData] = await connection.query(
              "SELECT xp_required FROM LEVELS WHERE level = ?",
              [level + 1]
          );

          if (!levelData.length || xp < levelData[0].xp_required) break;

          xp -= levelData[0].xp_required;
          level += 1;
          leveledUp = true;

          // Fetch perks for the new level
          const [perks] = await connection.query(
              "SELECT tokens_reward FROM LEVEL_PERKS WHERE level = ?",
              [level]
          );

          if (perks.length) {
              wallet += perks[0].tokens_reward;
              rewards.push(perks[0]); // Store rewards to return
          }
      }

      // Update user level and XP
      await connection.query(
          "UPDATE USERS SET level = ?, xp = ?, wallet = ? WHERE id = ?",
          [level, xp, wallet, sanitizeInput(userId)]
      );

      await connection.commit();
      return { level, xp, wallet, rewards, leveledUp };
  } catch (error) {
      await connection.rollback();
      throw error;
  } finally {
      connection.release();
  }
};

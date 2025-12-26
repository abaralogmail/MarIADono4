import SqliteManager from '../SqliteManager.js';
import { Op } from 'sequelize';

const getStartOfMonth = () => {
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  startOfMonth.setHours(0, 0, 0, 0);
  return startOfMonth;
};

const generateWeeklyBotMessageReport = async () => {
  let sqliteManager;
  try {
    sqliteManager = await SqliteManager.getInstance();
    const ConversationsLog = sqliteManager.models.ConversationsLog;

    const startOfMonth = getStartOfMonth();
    const endOfMonth = new Date(); // Today's date

    console.log(`Generating weekly report of bot messages between ${startOfMonth.toISOString()} and ${endOfMonth.toISOString()}`);

    // Weekly grouping using ISO week (Year-Week)
    const weekExpr = sqliteManager.sequelize.fn("strftime", "%Y-%W", sqliteManager.sequelize.col("date"));

    const messagesByWeek = await ConversationsLog.findAll({
      attributes: [
        [weekExpr, "week"],
        "role",
        [sqliteManager.sequelize.fn("COUNT", sqliteManager.sequelize.col("id")), "messageCount"],
      ],
      where: {
        date: {
          [Op.gte]: startOfMonth.toISOString().split("T")[0],
          [Op.lte]: endOfMonth.toISOString().split("T")[0],
        },
      },
      group: ["week", "role"],
      order: [
        [sqliteManager.sequelize.col("week"), "DESC"],
        [sqliteManager.sequelize.col("messageCount"), "DESC"],
      ],
    });

    console.log("\n--- Weekly Bot Message Report (by week) ---");
    if (messagesByWeek.length > 0) {
      messagesByWeek.forEach((row) => {
        const week = row.dataValues.week;
        const role = row.dataValues.role;
        const count = row.dataValues.messageCount;
        console.log(`Week: ${week}, Role: ${role || 'N/A'}, Messages Sent: ${count}`);
      });
    } else {
      console.log("No messages sent for any role this week.");
    }
    console.log("-----------------------------------");
  } catch (error) {
    console.error("Error generating weekly bot message report:", error);
  } finally {
    if (sqliteManager) {
      await sqliteManager.cleanup();
    }
  }
};

generateWeeklyBotMessageReport();

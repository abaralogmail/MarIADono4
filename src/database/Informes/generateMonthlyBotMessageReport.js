const SqliteManager = require("../SqliteManager");
const { Op } = require("sequelize");

const getStartOfMonth = () => {
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  startOfMonth.setHours(0, 0, 0, 0);
  return startOfMonth;
};

const generateMonthlyBotMessageReport = async () => {
  let sqliteManager;
  try {
    sqliteManager = await SqliteManager.getInstance();
    const ConversationsLog = sqliteManager.models.ConversationsLog;

    const startOfMonth = getStartOfMonth();
    const endOfMonth = new Date(); // Today's date

    console.log(`Generating report for messages sent by bot between ${startOfMonth.toISOString()} and ${endOfMonth.toISOString()}`);

    const messagesByBot = await ConversationsLog.findAll({
      attributes: [
        "botName",
        [sqliteManager.sequelize.fn("COUNT", sqliteManager.sequelize.col("id")), "messageCount"],
      ],
      where: {
        date: {
          [Op.gte]: startOfMonth.toISOString().split('T')[0], // Only date part
        },
        role: "bot", // Assuming 'bot' is the role for messages sent by the bot
      },
      group: ["botName"],
      order: [[sqliteManager.sequelize.col("messageCount"), "DESC"]],
    });

    console.log("\n--- Monthly Bot Message Report ---");
    if (messagesByBot.length > 0) {
      messagesByBot.forEach((bot) => {
        console.log(`Bot: ${bot.botName || 'N/A'}, Messages Sent: ${bot.dataValues.messageCount}`);
      });
    } else {
      console.log("No messages sent by bots this month.");
    }
    console.log("-----------------------------------");
  } catch (error) {
    console.error("Error generating monthly bot message report:", error);
  } finally {
    if (sqliteManager) {
      await sqliteManager.cleanup();
    }
  }
};

generateMonthlyBotMessageReport();

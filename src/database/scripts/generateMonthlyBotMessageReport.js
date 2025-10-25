const SqliteManager = require("../SqliteManager");
const { Op, Sequelize } = require("sequelize");

const generateMonthlyBotMessageReport = async () => {
  let sqliteManager;
  try {
    sqliteManager = await SqliteManager.getInstance();
    const ConversationsLog = sqliteManager.models.ConversationsLog;

    console.log(`Generating monthly bot message report grouped by BotName, Month, and Role...`);

    const report = await ConversationsLog.findAll({
      attributes: [
        'botName',
        [Sequelize.fn('strftime', '%Y-%m', Sequelize.col('date')), 'monthYear'],
        'role',
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'messageCount']
      ],
      group: ['botName', 'monthYear', 'role'],
      order: [
        ['botName', 'ASC'],
        ['monthYear', 'ASC'],
        ['role', 'ASC']
      ],
      raw: true // Get raw data, not Sequelize instances
    });

    console.log("\n--- Monthly Bot Message Report ---");
    if (report.length > 0) {
      report.forEach(row => {
        console.log(`Bot: ${row.botName}, Month: ${row.monthYear}, Role: ${row.role}, Messages: ${row.messageCount}`);
      });
    } else {
      console.log("No messages found to generate a grouped report.");
    }
    console.log("------------------------------------");

  } catch (error) {
    console.error("Error generating monthly bot message report:", error);
  } finally {
    if (sqliteManager) {
      await sqliteManager.cleanup();
    }
  }
};

generateMonthlyBotMessageReport();

import SqliteManager from '../SqliteManager.js';
import { Op, Sequelize } from 'sequelize';

const generateWeeklyBotMessageReport = async (groupByBotNameArg) => {
  const groupByBotName = groupByBotNameArg === undefined ? true : String(groupByBotNameArg).toLowerCase() === 'true';
  let sqliteManager;
  try {
    sqliteManager = await SqliteManager.getInstance();
    const ConversationsLog = sqliteManager.models.ConversationsLog;

    let attributes = [
      [Sequelize.fn('strftime', '%Y-%W', Sequelize.col('date')), 'weekYear'],
      'role',
      [Sequelize.fn('COUNT', Sequelize.col('id')), 'messageCount']
    ];
    let group = ['weekYear', 'role'];
    let order = [
      ['weekYear', 'ASC'],
      ['role', 'ASC']
    ];

    if (groupByBotName) {
      attributes.unshift('botName');
      group.unshift('botName');
      order.unshift(['botName', 'ASC']);
      console.log(`Generating weekly bot message report grouped by BotName, Week, and Role...`);
    } else {
      console.log(`Generating weekly bot message report grouped by Week and Role...`);
    }

    const report = await ConversationsLog.findAll({
      attributes: attributes,
      group: group,
      order: order,
      raw: true // Get raw data, not Sequelize instances
    });

    console.log("\n--- Weekly Bot Message Report ---");
    if (report.length > 0) {
      report.forEach(row => {
        const botName = groupByBotName ? `Bot: ${row.botName}, ` : '';
        console.log(`${botName}Week: ${row.weekYear}, Role: ${row.role}, Messages: ${row.messageCount}`);
      });
    } else {
      console.log("No messages found to generate a grouped report.");
    }
    console.log("------------------------------------\n");

  } catch (error) {
    console.error("Error generating weekly bot message report:", error);
  } finally {
    if (sqliteManager) {
      await sqliteManager.cleanup();
    }
  }
};

generateWeeklyBotMessageReport(process.argv[2]);

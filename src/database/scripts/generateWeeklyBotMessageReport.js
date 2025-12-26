import SqliteManager from '../SqliteManager.js';
import { Op } from 'sequelize';

const getStartOfWeek = () => {
  const today = new Date();
  const dayOfWeek = today.getDay(); // Sunday - 0, Monday - 1, ..., Saturday - 6
  const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Adjust to Monday
  const startOfWeek = new Date(today.setDate(diff));
  startOfWeek.setHours(0, 0, 0, 0);
  return startOfWeek;
};

const generateWeeklyBotMessageReport = async () => {
  let sqliteManager;
  try {
    sqliteManager = await SqliteManager.getInstance();
    const ConversationsLog = sqliteManager.models.ConversationsLog;

    console.log(`Generating report for all messages in the database`);

    const totalMessages = await ConversationsLog.count({});

    console.log("\n--- Total Message Report ---");
    if (totalMessages > 0) {
      console.log(`Total Messages in Database: ${totalMessages}`);
    } else {
      console.log("No messages found in the database.");
    }
    console.log("-----------------------------------");
  } catch (error) {
    console.error("Error generating total message report:", error);
  } finally {
    if (sqliteManager) {
      await sqliteManager.cleanup();
    }
  }
};

generateWeeklyBotMessageReport();

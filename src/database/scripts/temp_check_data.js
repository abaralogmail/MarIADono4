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

const checkData = async () => {
  let sqliteManager;
  try {
    sqliteManager = await SqliteManager.getInstance();
    const ConversationsLog = sqliteManager.models.ConversationsLog;
    const startOfWeek = getStartOfWeek();

    console.log('Checking for bot messages from:', startOfWeek.toISOString());

    const messages = await ConversationsLog.findAll({
      where: {
        role: 'bot',
        date: {
          [Op.gte]: startOfWeek.toISOString().split('T')[0],
        },
      },
    });

    console.log('Found messages:', messages.map(m => m.toJSON()));
  } catch (error) {
    console.error('Error checking data:', error);
  } finally {
    if (sqliteManager) {
      await sqliteManager.cleanup();
    }
  }
};

checkData();

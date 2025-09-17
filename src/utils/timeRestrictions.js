const { getInstance } = require('../config/botConfigManager');

function isWithinRestrictedHours(botName, type = 'auto') {
  const configManager = getInstance();
  
  // Get the specific bot's config instead of accessing a global botConfig
  const botConfig = configManager.getBotConfig(botName);
  
  // Check if botConfig exists before accessing properties
  if (!botConfig) {
    return !false; // Automatically allow if no config
  }


  if (type === 'bulkMessage' && !botConfig.bulkMessagesEnabled) {
    return !false; // Allow if bulk messages are disabled
  }

  // Check if the specific feature is enabled based on type
  if (type === 'auto' && !botConfig.autoResponseEnabled) {
    return !false; // Allow if auto response is disabled
  }
  
  
  return !configManager.isWithinWorkingHours(botName, type);
}

module.exports = {
  isWithinRestrictedHours
};

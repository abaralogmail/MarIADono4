const fs = require('fs');
const path = require('path');
const dest = path.join(__dirname, '..', 'src', 'utils', 'timeRestrictions.js');
const content = `import { getInstance } from '../config/botConfigManager.js';

function isWithinRestrictedHours(botName, type = 'auto') {
  const configManager = getInstance();

  // Get the specific bot config instead of accessing a global botConfig
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

// Named export for compatibility with imports that expect a named export
export { isWithinRestrictedHours };

// Default export kept for backward compatibility
export default {
  isWithinRestrictedHours,
};
`;
fs.writeFileSync(dest, content, { encoding: 'utf8' });
console.log('WROTE', dest);

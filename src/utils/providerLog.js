const fs = require('fs');
const path = require('path');
const getHistoryFromProvider = require('../utils/getHistoryFromProvider');


function ensureDirectoryExists(filePath) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

async function logProvider(provider) {
  const now = new Date();
  now.setHours(now.getHours() - 3);

  const providerData = {
    timestamp: now.toISOString(),
    providerName: provider.name,
    providerState: provider.state,
    providerInfo: provider,
  };

  //console.log(JSON.stringify(providerData, null, 2));

  const filePathProviderLogs = path.resolve(__dirname, '../../Logs/Provider_logs.json');
  ensureDirectoryExists(filePathProviderLogs);

  let logs = [];

  if (fs.existsSync(filePathProviderLogs)) {
    try {
      const fileContent = fs.readFileSync(filePathProviderLogs, 'utf8');
      logs = fileContent ? JSON.parse(fileContent) : [];
    } catch (error) {
      console.error('Error reading existing provider log JSON file:', error);
    }
  }

  logs.push(providerData);

  try {
    fs.writeFileSync(filePathProviderLogs, JSON.stringify(logs, null, 2), 'utf8');
  } catch (error) {
    console.error('Error writing to provider log JSON file:', error);
  }
}

function saveLastProvider(provider) {
  const filePathLastProvider = path.resolve(__dirname, '../../Logs/last_provider.json');
  ensureDirectoryExists(filePathLastProvider);

  try {
    fs.writeFileSync(filePathLastProvider, JSON.stringify(provider, null, 2), 'utf8');
  } catch (error) {
    console.error('Error writing to last provider JSON file:', error);
  }
}

async function logMessageProvider(provider) {
  const now = new Date();
  now.setHours(now.getHours() - 3);

  const filePathProviderLogs = path.resolve(__dirname, '../../Logs/messageProvider_logs.json');
  ensureDirectoryExists(filePathProviderLogs);

  let logs = [];

  if (fs.existsSync(filePathProviderLogs)) {
    try {
      const fileContent = fs.readFileSync(filePathProviderLogs, 'utf8');
      logs = fileContent ? JSON.parse(fileContent) : [];
    } catch (error) {
      console.error('Error reading existing provider log JSON file:', error);
    }
  }

  getHistoryFromProvider(provider, message)
  // Create log messages array from provider store messages

  const messageLogs = message.map((message, index) => ({
    id: index,
    content: message.message,
    providerName: provider.providerName,
    state: provider.state,
    timestamp: now.toISOString()
  }));

  logs.push(...messageLogs);

  try {
    fs.writeFileSync(filePathProviderLogs, JSON.stringify(logs, null, 2), 'utf8');
  } catch (error) {
    console.error('Error writing to provider log JSON file:', error);
  }
}

module.exports = { logProvider, saveLastProvider, logMessageProvider };
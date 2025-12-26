import fs from 'fs';
import path from 'path';
import getHistoryFromProvider from './getHistoryFromProvider.js';


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

  // Retrieve messages from provider
  let messages = [];
  try {
    messages = await getHistoryFromProvider(provider) || [];
  } catch (err) {
    console.error('Error getting history from provider:', err);
  }

  // Create log messages array from provider store messages
  const messageLogs = messages.map((msg, index) => ({
    id: index,
    content: msg.message || msg.content || JSON.stringify(msg),
    providerName: provider.providerName || provider.name,
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

export default { logProvider, saveLastProvider, logMessageProvider };

// Named exports for compatibility
export { logProvider, saveLastProvider, logMessageProvider };
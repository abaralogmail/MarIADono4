import BulkMessageManager from './bulkMessageManager.js';
import { getBotFilePath } from '../utils/botFileMapping.js';

// This function is the entry point called from flowPrincipal
async function sendBulkMessages(botName, provider) {
    // Get the excel file path from the bot config
    const excelFilePath = getBotFilePath(botName);

    if (!excelFilePath) {
        console.error(`Cannot start bulk messages: Excel file path not found for bot ${botName}.`);
        return;
    }

    try {
        // Create an instance of the manager for this bot and provider
        const manager = new BulkMessageManager(provider);

        // Start the sending process (it handles its own state and checks)
        await manager.startSending();

    } catch (error) {
        console.error(`Failed to initialize or start BulkMessageManager for ${botName}:`, error);
    }
}

export default sendBulkMessages;

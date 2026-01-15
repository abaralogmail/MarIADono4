import fs from 'fs';
const fsPromises = fs.promises;

export async function getHistoryConversation_log(clientId, botName) {
    const filePath = './Logs/conversations_log.json';
    
    try {
        // Read the JSON file
        const fileContent = await fsPromises.readFile(filePath, 'utf8');
        
        // Parse the JSON content
        const data = JSON.parse(fileContent);
        
        // Initialize an array to store client history
        const clientHistory = [];
        
        // Iterate over each item in the data
        for (const item of data) {
            // Check if the message is from the specified client and bot
            if (item.from === clientId && item.botName === botName) {
                // Add the item to the client history
                clientHistory.push(item);
            }
        }

        // Sort the history by date and time in descending order
        clientHistory.sort((a, b) => {
            const dateA = new Date(`${a.date} ${a.time}`);
            const dateB = new Date(`${b.date} ${b.time}`);
            return dateB - dateA;
        });

        // Return only the last 10 messages
        return clientHistory.slice(0, 10);
    } catch (error) {
        console.error('Error reading or parsing JSON file:', error);
        throw error;
    }
}

// Named export for compatibility
export default { getHistoryConversation_log };
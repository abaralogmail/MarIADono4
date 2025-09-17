const fs = require('fs').promises;

async function getClientHistory(clientId) {
    const filePath = './Logs/conversations_log.json';
    
    try {
        // Read the JSON file
        const fileContent = await fs.readFile(filePath, 'utf8');
        
        // Parse the JSON content
        const data = JSON.parse(fileContent);
        
        // Initialize an array to store client history
        const clientHistory = [];
        
        // Iterate over each item in the data
        for (const item of data) {
            //si item.body no es null, entonces lo agrega al array
            if (item.from === clientId && item.body !== null)  {
                clientHistory.push({
                    timestamp: new Date(item.date),
                    message: item.body,
                    role: item.role
                });
            }
        }

        // Sort the history by timestamp in descending order
        clientHistory.sort((a, b) => b.timestamp - a.timestamp);

        // Return only the last 10 messages
        return clientHistory.slice(0, 10);
    } catch (error) {
        console.error('Error reading or parsing JSON file:', error);
        throw error;
    }
}
module.exports = { getClientHistory };

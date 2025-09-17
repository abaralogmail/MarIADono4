const fs = require('fs');
const path = require('path');

function getDailyBulkMessageStats(botName) {
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const filePath = path.resolve(__dirname, '../../Logs/conversations_log.json');
    
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    // Debugging: Log the first few rows to see what they look like
    //console.log('First few rows:', data.slice(0, 5));

    let messageCount = 0;

    // Itera sobre las filas desde la última hasta la primera
    for (let i = data.length - 1; i >= 0; i--) {
        const row = data[i];
        const rowDate = new Date(`${row.date}T${row.time}`);

        if (rowDate >= last24Hours && 
            row.role === 'BulkMessage' && 
            row.botName === botName) {
            messageCount++;
        }
    }

    return {
        botName: botName,
        messageCount: messageCount
    };
}

module.exports = { getDailyBulkMessageStats };

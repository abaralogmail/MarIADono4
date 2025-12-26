import fs from 'fs';

const fsPromises = fs.promises;

export async function getClientHistory(clientId) {
    const filePath = './Logs/conversations_log.json';

    try {
        const fileContent = await fsPromises.readFile(filePath, 'utf8');
        const data = JSON.parse(fileContent);

        const clientHistory = [];
        for (const item of data) {
            if (item.from === clientId && item.body != null) {
                clientHistory.push({
                    timestamp: new Date(item.date),
                    message: item.body,
                    role: item.role ?? null,
                });
            }
        }

        clientHistory.sort((a, b) => b.timestamp - a.timestamp);
        return clientHistory.slice(0, 10);
    } catch (error) {
        console.error('Error reading or parsing JSON file:', error);
        return [];
    }
}

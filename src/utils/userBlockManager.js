import fs from 'fs';
const fsPromises = fs.promises;
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let blockedUsers = new Set();
const blockedUsersFile = path.join(__dirname, '../../mensajes/blocked_users.json');

async function loadBlockedUsers() {
    try {
        const data = await fsPromises.readFile(blockedUsersFile, 'utf8');
        blockedUsers = new Set(JSON.parse(data));
    } catch (error) {
        console.log('No existing blocked users file found. Starting with an empty set.');
    }
}

async function saveBlockedUsers() {
    await fsPromises.writeFile(blockedUsersFile, JSON.stringify([...blockedUsers]));
}

async function isUserBlocked(userId) {
    if (blockedUsers.size === 0) {
        await loadBlockedUsers();
    }
    return blockedUsers.has(userId);
}

async function blockUser(userId) {
    if (blockedUsers.size === 0) {
        await loadBlockedUsers();
    }
    blockedUsers.add(userId);
    await saveBlockedUsers();
}

async function unblockUser(userId) {
    if (blockedUsers.size === 0) {
        await loadBlockedUsers();
    }
    blockedUsers.delete(userId);
    await saveBlockedUsers();
}

export default {
    loadBlockedUsers,
    saveBlockedUsers,
    isUserBlocked,
    blockUser,
    unblockUser
};

// Named exports for compatibility
export {
    loadBlockedUsers,
    saveBlockedUsers,
    isUserBlocked,
    blockUser,
    unblockUser
};

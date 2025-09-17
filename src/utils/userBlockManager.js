const fs = require('fs').promises;
const path = require('path');

let blockedUsers = new Set();
const blockedUsersFile = path.join(__dirname, '../../mensajes/blocked_users.json');

async function loadBlockedUsers() {
    try {
        const data = await fs.readFile(blockedUsersFile, 'utf8');
        blockedUsers = new Set(JSON.parse(data));
    } catch (error) {
        console.log('No existing blocked users file found. Starting with an empty set.');
    }
}

async function saveBlockedUsers() {
    await fs.writeFile(blockedUsersFile, JSON.stringify([...blockedUsers]));
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

module.exports = {
    loadBlockedUsers,
    saveBlockedUsers,
    isUserBlocked,
    blockUser,
    unblockUser
};

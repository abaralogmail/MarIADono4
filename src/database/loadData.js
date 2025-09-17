// src/database/loadData.js
const { init, query } = require('./db');
const blockedUsersData = require('../mensajes/blocked_users.json');
const userThreadsData = require('../mensajes/userThreads.json');

async function loadData() {
  await init();

  for (const user of blockedUsersData) {
    await query('INSERT INTO blocked_users (user_id, reason) VALUES (?, ?)', [user.user_id, user.reason]);
  }

  for (const thread of userThreadsData) {
    await query('INSERT INTO user_threads (user_id, thread_id, content) VALUES (?, ?, ?)', [thread.user_id, thread.thread_id, thread.content]);
  }
}

loadData().catch(console.error);

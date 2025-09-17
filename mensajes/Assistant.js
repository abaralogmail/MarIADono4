const { Configuration, OpenAIApi, OpenAI } = require('openai');
require('dotenv/config');
const fs = require('fs').promises;
const path = require('path');
const { logger } = require('./../src/utils/logger');


// Reemplaza 'your-api-key' con tu clave API de OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Mapeo para almacenar los hilos de conversación de los usuarios
//const userThreads = {"5493812010781":"thread_tWAdefP1xDPko4qOoicTKhZj"};
let userThreads = {};

// Path to the storage file
//const STORAGE_FILE = path.join(__dirname, 'mensajes', 'userThreads.json');
const STORAGE_FILE = './userThreads.json';

// Function to get or create a thread for a user
let userThreadsLoaded = false;


async function chatWithAssistant(ctx, customAssistantId = null) {
  try {
    const userId = ctx.from;
    const threadId = await getOrCreateThread(ctx);
    await listarMensajes(threadId);

    // Check for active runs
    const activeRuns = await openai.beta.threads.runs.list(threadId, { status: 'in_progress' });
    if (activeRuns.data.length > 0) {
      console.log('There is an active run. Waiting for completion...');
      await waitForRunCompletion(threadId, activeRuns.data[0].id);
    }

    // Create a message in the thread
    await openai.beta.threads.messages.create(threadId, {
      role: 'user',
      content: ctx.body
    });

    // Use the custom assistant_id if provided, otherwise use the default
    const assistantId = customAssistantId || process.env.ASSISTANT_ID;
    //const assistantId = process.env.ASSISTANT_ID;

    if (!assistantId) {
      throw new Error('Assistant ID is not set. Please check your environment variables.');
    }

    // Create and run the assistant
    const run = await openai.beta.threads.runs.create(threadId, {
      assistant_id: assistantId
    });


    // Wait for the run to complete
    const runStatus = await waitForRunCompletion(threadId, run.id);

    // If run failed, cancelled, or expired, return early
    if (["failed", "cancelled", "expired"].includes(runStatus.status)) {
      console.log(`Run status is '${runStatus.status}'. Unable to complete the request.`);
      return `Ceridono Refrigeración - atiende Julieta de 8.30 a 12.30hs`;
    }

    // Get the assistant's response
    const messages = await openai.beta.threads.messages.list(threadId);
    const lastAssistantMessage = messages.data
      .filter(message => message.run_id === run.id && message.role === "assistant")
      .pop();

    return lastAssistantMessage
      ? lastAssistantMessage.content[0].text.value
      : "No response received from the assistant.";

  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

async function addContextAssistant(ctx) {
  try {
    const userId = ctx.from;
    const threadId = await getOrCreateThread(ctx);

    // Create a message in the thread without running the assistant
    await openai.beta.threads.messages.create(threadId, {
      role: 'user',
      content: ctx.body
    });

    //console function, fecha, hora y mensaje
    //console.log('Context added successfully');
    return "Context added successfully";

  } catch (error) {
    console.error('Error adding context:', error);
    throw error;
  }
}



// Load userThreads from file
async function loadUserThreads() {
  try {
    const data = await fs.readFile(STORAGE_FILE, 'utf8');
    userThreads = JSON.parse(data);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      console.error('Error loading user threads:', error);
    }
    userThreads = {};
  }
}

// Save userThreads to file
async function saveUserThreads() {
  try {
    await fs.writeFile(STORAGE_FILE, JSON.stringify(userThreads));
  } catch (error) {
    console.error('Error saving user threads:', error);
  }
}

// Function to create a new thread
async function createThread() {
  try {
    const thread = await openai.beta.threads.create();
    return thread.id; // Return the new thread ID
  } catch (error) {
    console.error('Error creating thread:', error);
    throw error;
  }
}


async function getOrCreateThread(ctx) {
  if (!userThreadsLoaded) {
    await loadUserThreads();
    userThreadsLoaded = true;
  }

  if (!userThreads[ctx.from]) {
    userThreads[ctx.from] = await createThread();
    await saveUserThreads();
  }

  return userThreads[ctx.from];
}

async function listarMensajes(threadId) {
  try {
    const allMessages = await openai.beta.threads.messages.list(threadId);
    //  console.log(`Messages in thread ${threadId}:`);
    console.log(`Total messages in thread ${threadId}:`, allMessages.data.length);

    /*allMessages.data.forEach((message, index) => {
      console.log(`Message ${index + 1}:`);
      console.log(`Role: ${message.role}`);
      console.log(`Content: ${JSON.stringify(message.content)}`);
      console.log(`Created at: ${new Date(message.created_at * 1000).toLocaleString()}`);
      console.log('---');
    });*/
    return allMessages.data;
  } catch (error) {
    console.error('Error listing messages:', error);
    throw error;
  }
}


async function waitForRunCompletion(threadId, runId, maxWaitTime = 40000) {
  const startTime = Date.now();
  let runStatus;

  do {
    await new Promise(resolve => setTimeout(resolve, 2000));
    runStatus = await openai.beta.threads.runs.retrieve(threadId, runId);

    if (["completed", "failed", "cancelled", "expired"].includes(runStatus.status)) {
      return runStatus;
    }

    if (Date.now() - startTime > maxWaitTime) {
      console.log('Run is taking too long. Proceeding with caution.');
      return { status: "timeout", message: "Run timed out" };
    }
  } while (true);
}


module.exports = { chatWithAssistant, getOrCreateThread, addContextAssistant };





import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
//const PostgreSQLManager = await import("../database/PostgreSQLManager.js");
import SqliteManager from "../database/SqliteManager.js";
import MessageData from "./MessageData.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function ensureDirectoryExists(filePath) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function fileExists(filePath) {
  try {
    fs.accessSync(filePath, fs.constants.F_OK);
    return true;
  } catch (err) {
    return false;
  }
}

function logFormattedMessageData(messageData) {
  // Formatear messageData antes de mostrarlo en consola
  const data = {
    _from: messageData.from,
    _role: messageData.role,
    _body: messageData.body,
    _date: messageData.date,
    _time: messageData.time,
    _messageId: messageData.messageId,
    _pushName: messageData.pushName,
    _botName: messageData.botName,
  };

  const message =
    `📩` +
    `\x1b[32m ${data._date}|\x1b[0m` +
    `\x1b[32m${data._time}|\x1b[0m` +
    `\x1b[32m${data._from}|\x1b[0m` +
    `\x1b[32m${data._role}|\x1b[0m` +
    `\x1b[32m${data._botName}|\x1b[0m` +
    `\x1b[32m${data._pushName}:\x1b[0m` +
    `\x1b[32m${data._body}\x1b[0m`;

  console.log(message);
}

function formatToFileMessageData(message) {
  const now = new Date();
  now.setHours(now.getHours() - 3);

  return {
    date: now.toISOString().split("T")[0],
    time: now.toISOString().split("T")[1].split(".")[0],
    from: message.from,
    role: message.role,
    pushName: message.pushName,
    body: message.body,
    messageId: message.messageId,
    etapaEmbudo: message.etapaEmbudo || "",
    interesCliente: message.interesCliente || "",
    botName: message.botName,
  };
}

function logMessageToFile(messageData) {
  const filePath = path.resolve(__dirname, "../../Logs/conversations_log.json");
  ensureDirectoryExists(filePath);

  let logs = [];
  if (fileExists(filePath)) {
    try {
      const fileContent = fs.readFileSync(filePath, "utf8");
      if (fileContent && fileContent.trim() !== "") {
        try {
          logs = JSON.parse(fileContent);
          if (!Array.isArray(logs)) {
            console.error(
              "Existing log file is not an array, creating new array"
            );
            logs = [];
          }
        } catch (parseError) {
          console.error("Error parsing existing log JSON file:", parseError);
          const backupPath = `${filePath}.backup.${Date.now()}`;
          fs.copyFileSync(filePath, backupPath);
          console.log(`Created backup of corrupted log file at ${backupPath}`);
          logs = [];
        }
      }
    } catch (error) {
      console.error("Error reading existing log JSON file:", error);
    }
  }
  logs.push(formatToFileMessageData(messageData));
  try {
    fs.writeFileSync(filePath, JSON.stringify(logs, null, 2), "utf8");
  } catch (error) {
    console.error("Error writing to log JSON file:", error);
  }
}

async function logMessageToDB(messageData) {
  const saveData = {
    from: messageData.from,
    role: messageData.role,
    pushName: messageData.pushName,
    body: messageData.body,
    messageId: messageData.messageId,
    etapaEmbudo: messageData.etapaEmbudo,
    interesCliente: messageData.interesCliente,
    botName: messageData.botName,
  };

  // Save to both databases in parallel
  const savePromises = [];

  // PostgreSQL save
  /*savePromises.push(
    PostgreSQLManager.getInstance()
      .then(db => db.saveConversation(saveData))
      .catch(error => {
        console.error("Error saving message to PostgreSQL:", error);
      })
  );*/

  // SQLite save
  savePromises.push(
    SqliteManager.getInstance()
      .then(db => db.saveConversation(saveData))
      .catch(error => {
        console.error("Error saving message to SQLite:", error);
      })
  );

  // Wait for both saves to complete
  await Promise.allSettled(savePromises);
}

async function logMessage(messageData) {
  // Validate messageData
  if (!messageData || !messageData.from) {
    console.warn("⚠️ Invalid messageData provided to logMessage");
    return;
  }

  // Try to log to file (independent of database)
  try {
    await logMessageToFile(messageData);
  } catch (fileError) {
    console.error("❌ File logging failed:", fileError.message);
    // Continue execution - file logging failure shouldn't stop database logging
  }

  // Try to log to database (independent of file)
  try {
    await logMessageToDB(messageData);
  } catch (dbError) {
    console.error("❌ Database logging failed:", dbError.message);
    // Continue execution - database logging failure shouldn't stop the main flow
  }

  // Both logging attempts completed (successfully or with errors logged)
  // Show the complete messageData in the console

  // Mostrar el messageData formateado en una sola línea
  logFormattedMessageData(messageData);

  console.log(`📝 Mensaje loggueado correctamente: ${messageData.from}`);
}
export { logMessage };

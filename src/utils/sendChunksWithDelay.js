const fs = require("fs").promises;
const BLOCKED_USERS_FILE = "mensajes/blocked_users.json";
const path = require("path");
const { logMessage } = require("./messageLogger");
const { isUserBlocked, saveBlockedUsers } = require("./userBlockManager");
const MessageData = require("./MessageData");

const sendChunksWithDelay = async (
  largeResponse,
  delay,
  messageData,
  provider
) => {
  let i = 0;

  //    const chunks =  largeResponse.split(/【\d+:\d+†source】/g);

  /*if (typeof largeResponse !== 'string') {
        largeResponse = String(largeResponse);
    }*/

  if (typeof largeResponse === "object") {
    largeResponse = JSON.stringify(largeResponse);
  }
  //const chunks = largeResponse.split(/(?<!\d)\.\s+/g);
  const chunks = largeResponse;
  messageData.body = largeResponse;

  // Preparar el mensaje con la opción detectLinks
  const messageOptions = {
    text: messageData.body,
    detectLinks: true, // Habilitar la detección de enlaces
  };

  // Enviar el mensaje
  //const sendResult = await provider.sendMessage(`${messageData.from}@c.us`,messageOptions);

  const sendResult = await provider.sendText(`${messageData.from}@c.us`, messageData.body);

  messageData.messageId = sendResult.key.id;
  await logMessage(messageData);
  //console.log('Mensaje enviado con ID:', sendResult.key.id);

  /*
    const sendChunk = async () => {
        if (i < chunks.length && !(await isUserBlocked(messageData.from))) {
            // Remove the 【X:X†source】 format from the chunk
            //const cleanedChunk = chunks[i].replace(/【\d+:\d+†source】/g, '');
            const cleanedChunk = chunks;
            flowDynamic([{ body: cleanedChunk, to: messageData.from }]);
            //      console.log(`${ctx.from}|${ctx.role}: ${cleanedChunk}`);
            // Log the message to a file

            // Log the message to a file
            //     console.log(`${now.toISOString().split('T')[0]}|${now.toISOString().split('T')[1].split('.')[0]}|${ctx.from}|['Assistant']: ${chunks[i]}`);

            i++;
            setTimeout(sendChunk, delay);
        }
    }
    sendChunk();*/
};

module.exports = { sendChunksWithDelay, logMessage };

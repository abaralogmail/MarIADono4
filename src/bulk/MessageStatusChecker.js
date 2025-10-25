const DatabaseQueries = require("../database/DatabaseQueries");

class MessageStatusChecker {
  constructor(provider) {
    this.provider = provider;
  }

  // Verificar estado de un mensaje específico
  async checkMessageStatus({ messageid, remoteJid }) {
    try {
      const messages = this.provider.store.messages || {};
      const userMessages = messages[remoteJid]?.array ?? [];
      /*
      for (let i = 0; i < userMessages.length; i++) {
        const message = userMessages[i];

        const messageText = message.message?.extendedTextMessage?.text;
        console.log("Message ID:", message.key.id);
        console.log("Message Body:", messageText ?? "No text available");
        console.log("Message status:", message.status);

        if (message.key.id === messageid) {
          return message.status;
        }
      }*/

      const varMessage = userMessages.find((msg) => msg.key.id === messageid);
      console.log("varMessage:", varMessage);
      if (varMessage) {
        return {
          status: varMessage.status,
        };
      }
      return null;
    } catch (error) {
      console.error("Error checking message status:", error, {
        messageid,
        remoteJid,
      });
      return null;
    }
  }
  // Verificar estados de todos los mensajes
  async getAllMessageStatusesHoy() {
    try {
      // Step 1: Get today's message count from the database
      const mensageshoy = await DatabaseQueries.mensajesBulkEnviadosHoy();
     
      console.log(`Messages sent today: ${mensageshoy.length}`);

      // Step 2: Access all messages from the provider
      //const messages = this.provider.store.messages;
      // Step 3: Iterate through each message and check its status
      const messageStatuses = await Promise.all(
        mensageshoy.map(async (message) => {
          //Utils remoteJid
          const remoteJid = `${message.from}@s.whatsapp.net`;

          const messageid = message.messageid;

          const status = await this.checkMessageStatus({
            messageid: messageid,
            remoteJid: remoteJid,
          });
          return {
            id: message.id,
            status: status ?? message.status,
            timestamp: `${message.date}T${message.time}`,
            from: message.from,
            to: message.to,
            body: message.body,
          };
        })
      );

  // Filtrar solo aquellos estados que no son nulos
      const messageStatusesNonNull = messageStatuses.filter(msg => msg.status && msg.status.status !== null);
     // const messageStatusesIsInteger = messageStatuses.filter(msg => Number.isInteger(msg.status));
      //console.log("Filtered message statuses (non-null):", messageStatusesIsInteger);
      // messageStatuses.filter(message => message.status !== null);
      return messageStatusesNonNull;

    } catch (error) {
      console.error("Error getting all message statuses:", error);
      return [];
    }
  }

  // Verificar mensajes pendientes
  async getPendingMessages() {
    try {
      const messages = this.provider.vendor.store.messages;
      return messages.filter(
        (message) => message.status === "pending" || message.status === "sent"
      );
    } catch (error) {
      console.error("Error getting pending messages:", error);
      return [];
    }
  }
}
module.exports = MessageStatusChecker; // Use `module.exports`, not `exports`

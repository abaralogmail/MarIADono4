const getHistoryFromProvider = async (provider, chatId, limit = 10) => {
  try {
    // Ensure provider.store.messages exists and is not empty before accessing chatId
    if (!provider || !provider.store || !provider.store.messages || Object.keys(provider.store.messages).length === 0) {
      return [];
    }

    const messagesProvider = provider.store.messages[chatId];

    // Check if messageProvider exists and is not empty
    if (!messagesProvider || !messagesProvider.array || messagesProvider.array.length === 0) {
      return [];
    }

    // Sort messages by timestamp (newest first) and limit the number
    const sortedMessages = [...messagesProvider.array]
      .sort((a, b) => b.messageTimestamp - a.messageTimestamp)
      .slice(0, limit);

    const formattedMessages = sortedMessages.map(message => {
      const messageDate = new Date(message.messageTimestamp * 1000);
      messageDate.setHours(messageDate.getHours() - 3);
      
      const date = messageDate.toISOString().split('T')[0];
      const time = messageDate.toISOString().split('T')[1].split('.')[0];
  
      return {
          from: removeJidSuffix(message.key.remoteJid),
          role: message.key.fromMe ? 'outgoing' : 'incoming',
          body: message.message?.conversation || message.message?.extendedTextMessage?.text || 'Multimedia message',
          date,
          time,
          messageId: message.key.id,
          pushName: message.pushName,
          etapaEmbudo: 'Sin Clasificar',
          interesCliente: message.status,
          botName: provider.globalVendorArgs.name,
          mediaType: null,
          mediaUrl: null,
          mediaBuffer: null,
          aiResponses: [],
          mediaFilePath: null,
          chatHistory: []
      }
    });
/*
    formattedMessages.forEach(msg => {
      console.log('Message:', msg)
    });
*/
    return formattedMessages;
  } catch (error) {
    console.log('Error loading chat history:', error);
    return [];
  }
}



// Function to remove the suffix from remoteJid
function removeJidSuffix(jid) {
  if (!jid.includes('@')) return jid;
  const [id, suffix] = jid.split('@');
  return id;
}

export default getHistoryFromProvider;

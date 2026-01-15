import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getHistoryConversation_log } from './clientHistoryFromJson.js';
import getHistoryFromProvider from './getHistoryFromProvider.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const aggregateChatHistory = async (provider, messageData) => {
    const remoteJid = `${messageData.from}@s.whatsapp.net`;

    // Create a mapping of bot names to branch information
    const branchInfo = {
        'bot': { name: 'Casa Central', address: 'Juan Bautista Alberdi 1079, Salta Capital', phone: '5493875218575' },
        'BotOfertasTucuman': { name: 'MarIADono Tucumán', address: 'Don Bosco 1608, Tucumán', phone: '5493813638101' },
        'BotAugustoTucuman': { name: 'Augusto', address: 'direccion de prueba', phone: '5493812488449' },
        'BotConsultasWeb': { name: 'Tucumán y Web', address: 'Don Bosco 1608, Tucumán', phone: '5493813638101'  },
        'BotJujuy': { name: 'Sucursal Jujuy', address: 'Av. Éxodo Jujeño 743, San Salvador de Jujuy', phone: '5493885712603' },
        'BotRamiro': { name: 'Ramiro Salta', address: 'Av. San Martín 251, Salta Capital', phone: '5493872255083' },
        // Add other bots and their details as needed
    };

 // Ensure messageData.from is a string
   /* if (typeof messageData.from !== 'string') {
        throw new TypeError(`Expected messageData.from to be a string, got ${typeof messageData.from}`);
    }*/

    // Log to debug the incoming phone number
    //console.log("Incoming phone number:", messageData.from);

    // Get branch details based on the bot name
    const branch = branchInfo[messageData.botName] || { name: 'Unknown', address: 'N/A', phone: 'N/A' };
  
    // Identify province from incoming number
    const province = getProvinceFromPhoneNumber(messageData.from);

    // Get messages from various sources
    const providerMessages = await getHistoryFromProvider(provider, remoteJid);
    const fileMessages = getFileMessages(remoteJid);
    const historyConversation_log = await getHistoryConversation_log(messageData.from, messageData.botName);

    const mergedMessages = mergeMessagesWithPriority(historyConversation_log, providerMessages);

    // Format each message and filter out nulls (those without conversation)
    //const formattedMessages = mergedMessages.map(message => formatMessageWithBranch(message, branch)).filter(m => m !== null);
     // Formatear cada mensaje y filtrar los nulos (aquellos sin conversación)
    const formattedMessages = mergedMessages.map(formatMessage).filter(m => m !== null);

    // Add client and bot information at the start
    const clientInfo = `Bot: ${messageData.botName} | Provincia: ${province}`;
    const initialInfo = `${clientInfo}\nSucursal: ${branch.name}, Address: ${branch.address}`;

    // Process the final history with client info at the beginning
    const recentHistory = `${initialInfo}\n\n${processHistory(formattedMessages, 15)}`;
    //const recentHistory = `${processHistory(mergedMessages, 15)}`;
    return recentHistory;
};

const provincePrefixes = {
    '549387': 'Salta',           // +54 387 Salta
    '549381': 'Tucumán',         // +54 381 San Miguel de Tucumán
    '549388': 'Jujuy',           // +54 388 Jujuy
    '54911': 'Buenos Aires',     // +54 11 Ciudad Autónoma de Buenos Aires y alrededores
    '549351': 'Córdoba',         // +54 351 Córdoba
    '549341': 'Rosario',         // +54 341 Santa Fe (Rosario)
    '549261': 'Mendoza',         // +54 261 Mendoza
    '549223': 'Mar del Plata',   // +54 223 Mar del Plata
    '549342': 'Santa Fe',        // +54 342 Santa Fe
    '549264': 'San Juan',        // +54 264 San Juan
    '549299': 'Neuquén',         // +54 299 Neuquén
    '549379': 'Corrientes',      // +54 379 Corrientes
    '549362': 'Resistencia',     // +54 362 Resistencia
    '549385': 'Santiago del Estero', // +54 385 Santiago del Estero
    // Agrega más prefijos según sea necesario
};


const getProvinceFromPhoneNumber = (phoneNumber) => {
    // Convert phoneNumber to string explicitly
    const phoneNumberStr = String(phoneNumber);

    
    // Extract prefix (assuming the number is in the format 549XXXXXXXX)
    const prefix = phoneNumberStr.slice(0, 6); // "549xxx"

    // Return the corresponding province or 'Desconocido'
    const province = provincePrefixes[prefix];
    if (province) {
        return province;
    } else {
        console.log(`Unknown prefix: ${prefix}. Returning 'Desconocido'.`);
        return 'Desconocido';
    }
};
// Modify formatMessage to include branch data
const formatMessageWithBranch = (message, branch) => {
    const date = message.date;
    const time = message.time;
    const role = message.role;
    const body = message.body;
    const pushName = message.pushName;

    return {
        text: `${date}|${time}|${role}||${pushName}|${body}|Sucursal: ${branch.name}, Address: ${branch.address}, Phone: ${branch.phone}`
    };
};


// Function to merge messages with priority to historyConversation_log
const mergeMessagesWithPriority = (historyConversation_log, providerMessages) => {
    // Create a map to store messages by messageId
    const messageMap = new Map();
    
    // First add provider messages to the map
    providerMessages.forEach(message => {
        if (message.messageId) {
            messageMap.set(message.messageId, message);
        }
    });
    
    // Then add historyConversation_log messages, overwriting any duplicates
    // This gives priority to historyConversation_log messages
    historyConversation_log.forEach(message => {
        if (message.messageId) {
            messageMap.set(message.messageId, message);
        }
    });
    
    // Convert the map values back to an array
    return Array.from(messageMap.values());
};


// Función para obtener los mensajes del provider
const getMessageProvider = (provider, remoteJid) => {
    const messagesFromStore = provider.store.messages[remoteJid] || {};


    // Se chequea que la propiedad "array" sea un arreglo, sino se retorna un arreglo vacío
    return Array.isArray(messagesFromStore.array) ? messagesFromStore.array : [];
};

// Función para obtener los mensajes del archivo local (Baileys_store)
const getFileMessages = (remoteJid) => {
    const filePath = path.join(__dirname, '../../mensajes/BotAugustoTucuman-Baileys_store.json');
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        const messages = JSON.parse(data);
        return messages.messages[remoteJid] || [];
    } catch (error) {
        console.error('Error leyendo el archivo:', error);
        return [];
    }
};

// Función para formatear el historial de cliente obtenido desde el JSON externo (clientHistory)
const formatClientHistory = (clientHistory) => {
    return clientHistory.map(msg => ({
        messageTimestamp: new Date(`${msg.date} ${msg.time}`),
        role: msg.role,
        message: { conversation: msg.body },
        pushName: msg.pushName // Added pushName as requested

    }));
};

// Función para determinar la dirección del mensaje
const determineDirection = (message) => {
    // Por defecto se asigna incoming
    let direction = 'incoming';
    if (message.role && message.role === 'BulkMessage') {
        direction = message.role;
    } else if (message.key && message.key.fromMe) {
        direction = 'outgoing';
    }
    return direction;
};

// Función para formatear un mensaje, obteniendo la fecha, hora y dirección
const formatMessage = (message) => {
    // Si el mensaje no tiene conversación, se retorna null para luego filtrar
  //  if (!message?.message?.conversation) return null;
    
    //const timestamp = new Date(message.messageTimestamp);
    //const auxformattedDate = timestamp.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric'});
    const date = message.date;
    const time = message.time;
    const role = message.role;
    const body = message.body;
    const pushName = message.pushName;
    
    return {
        
        text: `${date}|${time}|${role}||${pushName}|${body}`
    };
};

// Función para ordenar, limitar y unir el historial de mensajes
const processHistory = (history, limit = 15) => {
    // Ordenar descendiente por timestamp
//    history.sort((a, b) => b.timestamp - a.timestamp);
    // Tomar los mensajes más recientes, invertir el orden y unir en un solo string
    return history.slice(0, limit)
                  .reverse()
                  .map(entry => entry.text)
                  .join('\n');
};

export default aggregateChatHistory;

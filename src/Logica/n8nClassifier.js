import ExcelJS from 'exceljs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const OllamaFunnelClassifier = require('../../mensajes/OllamaFunnelClassifier.js');
import { getClientHistory } from '../utils/clientHistoryFromExcel.js';
import N8nWebhookListener from './N8nWebhookListener.js';


class N8nClassifier {
    // Constructor que inicializa con un límite máximo de clasificaciones
    constructor(maxClassifications = 50) {
        this.maxClassifications = maxClassifications;
        this.webhookListener = new N8nWebhookListener('http://localhost:5678/webhook/WebhookAuth',
        process.env.N8N_WEBHOOK_USERNAME, 
        process.env.N8N_WEBHOOK_PASSWORD);

        //this.webhookListener = new N8nWebhookListener('',process.env.N8N_WEBHOOK_TOKEN);
    }
   
    // Lee el archivo Excel y obtiene la primera hoja
    async readExcelFile(filePath) {
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.readFile(filePath);
        return workbook.getWorksheet(1);
    }

     // Extrae las filas del Excel y las convierte en objetos manejables
    // Mapea: ID cliente, timestamp, mensaje y rol
    getRowsFromWorksheet(worksheet) {
        const rows = [];
        const messageCountByClient = new Map();
        const MAX_MESSAGES_PER_CLIENT = 15;
    
        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber > 1) {
                const clientId = row.getCell(1).value;
                const etapaEmbudo = row.getCell(10).value;
                const role = row.getCell(2).value;
                
                if (!messageCountByClient.has(clientId)) {
                    messageCountByClient.set(clientId, 0);
                }
    
                if (!etapaEmbudo && 
                    role !== 'BulkMessage' && 
                    messageCountByClient.get(clientId) < MAX_MESSAGES_PER_CLIENT) {
                    
                    // Ensure proper date parsing
                    const timestamp = new Date(row.getCell(4).value);
                    
                    rows.push({
                        rowNumber,
                        clientId: clientId,
                        timestamp: timestamp,
                        message: row.getCell(3).value,
                        role: role
                    });
                    
                    messageCountByClient.set(clientId, messageCountByClient.get(clientId) + 1);
                }
            }
        });
        
        // Sort by timestamp descending (newest first)
        return rows.sort((a, b) => {
            // Compare timestamps in reverse order
            return b.timestamp.getTime() - a.timestamp.getTime();
        });
    }
    
    
    // Agrupa las conversaciones por cliente respetando el límite máximo
    // Mantiene un orden cronológico de los mensajes
    groupConversationsByClient(rows) {
        const conversationsByClient = new Map();
        let classificationCount = 0;

        for (const row of rows) {
            if (classificationCount < this.maxClassifications) {
                if (!conversationsByClient.has(row.clientId)) {
                    conversationsByClient.set(row.clientId, []);
                    classificationCount++;
                }
                conversationsByClient.get(row.clientId).push({
                    timestamp: row.timestamp,
                    message: row.message,
                    role: row.role,
                    rowNumber: row.rowNumber
                });
            }
        }
        return conversationsByClient;
    }

    // Construye un string formateado con la conversación completa
    // Formato: "rol: mensaje\nrol: mensaje"
    buildConversationString(conversations) {
        return conversations
            .map(conv => `${conv.role}: ${conv.message}`)
            .join('\n');
    }

   // Método principal de clasificación y actualización
    // - Procesa cada conversación por cliente
    // - Envía al webhook de n8n para clasificación
    // - Actualiza el Excel con la etapa del embudo (columna 10)
    async classifyAndUpdateExcel(worksheet, conversationsByClient) {
        const classifications = new Map();
        const ETAPA_EMBUDO_COLUMN = 10;
    
        for (const [clientId, conversations] of conversationsByClient) {
            const conversationString = this.buildConversationString(conversations);
            const webhookData = {
                clientId,
                conversationString,
                conversations: conversations.map(conv => ({
                    message: conv.message,
                    timestamp: conv.timestamp,
                    role: conv.role
                }))
            };
    
            const response = await this.webhookListener.sendWebhook(webhookData.conversationString);
            const funnelStage = response;
    
            // Update Excel rows for this client
            conversations.forEach(conv => {
                worksheet.getCell(conv.rowNumber, ETAPA_EMBUDO_COLUMN).value = funnelStage;
            });
            
            // Write the updated rows immediately
            await worksheet.workbook.xlsx.writeFile('./Logs/conversations_log.xlsx');
    
            classifications.set(clientId, {
                stage: funnelStage,
                lastInteraction: conversations[0].timestamp
            });
    
            console.log(`Client ${clientId} - Stage: ${funnelStage} - Excel updated`);
        }
    
        return classifications;
    }
     
        async classifyMessageData(messageData) {
            try {
                // Get client history for context
                const clientHistory = await getClientHistory(messageData.from);
                
                // Build conversation string including history
                const conversationString = clientHistory
                    .map(msg => `${msg.role}: ${msg.message}`)
                    .join('\n');
    
                // Add current message
                const fullConversation = `${conversationString}\n${messageData.role}: ${messageData.body}`;
    
                // Send to n8n webhook for classification
                const funnelStage = await this.webhookListener.sendWebhook(fullConversation);
    
                // Update the messageData with classification
                return funnelStage;
    
           
    
            } catch (error) {
                console.error('Error classifying message:', error);
                throw error;
            }
        }
    
    

    // Método principal que orquesta todo el proceso
    // - Lee el Excel
    // - Procesa las conversaciones
    // - Clasifica y actualiza
    // - Guarda los cambios
    async classifyAllConversations() {
        const filePath = './Logs/conversations_log.xlsx';
        
        try {
            const worksheet = await this.readExcelFile(filePath);
            const rows = this.getRowsFromWorksheet(worksheet);
            const conversationsByClient = this.groupConversationsByClient(rows);
            const classifications = await this.classifyAndUpdateExcel(worksheet, conversationsByClient);
            
            await worksheet.workbook.xlsx.writeFile(filePath);
            console.log('Excel file updated successfully with funnel stages from n8n');
            
            return classifications;
        } catch (error) {
            console.error('Error processing Excel file:', error);
            throw error;
        }
    }
}

export default N8nClassifier;

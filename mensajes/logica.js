// ESM module — use import instead of require
//const { NotionWorkspaceAssistant } = require('./Logica/NotionWorkspaceAssistant');
import AnythingLLM from '../src/Logica/AnythingLLM.js';
import ExcelJS from 'exceljs';
import OllamaFunnelClassifier from './OllamaFunnelClassifier.js';
import n8nClassifier from '../src/Logica/n8nClassifier.js';

import { chatWithAssistant, getOrCreateThread } from './Assistant.js';

const classifierN8n = new n8nClassifier();
const ollamaClassifier = new OllamaFunnelClassifier();

async function getClientHistory(clientId) {
    const filePath = './Logs/conversations_log.xlsx';
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);
    const worksheet = workbook.getWorksheet(1);

    const clientHistory = [];
    worksheet.eachRow((row, rowNumber) => {
        if (rowNumber > 1 && row.getCell(1).value === clientId) {
            clientHistory.push({
                timestamp: row.getCell(1).value,
                message: row.getCell(3).value,
                role: row.getCell(6).value
            });
        }
    });

    return clientHistory;
}



const run = async (ctx, history) => {
    const data = {
        question: history[history.length - 1].content,
        // context: history,
        overrideConfig: {
            sessionId: ctx.from,
            returnSourceDocuments: true,
        },
    };
    console.log('chat_history:', history);
    // Placeholder: implement query to LLM
    return { text: 'ok', data };
};


async function logicaMensajes(ctx) {
    //const threadId = await getOrCreateThread(ctx);
    
   // const classifier = new OllamaFunnelClassifier(getClientHistory);
   /* const funnelStage  = await classifier.classifyCustomer(ctx);
    ctx.etapaEmbudo = funnelStage;
    console.log(`funnelStage:`, funnelStage.text);*/

   // let assistantResponse = await chatWithAssistant(ctx);
    //classifyMessageData SalesFunnelClassifier
    const conversationClassifier = new n8nClassifier('http://localhost:5678/webhook/Webhook');
    // Direct call to classifier instance
    ctx.etapaEmbudo = await classifierN8n.classifyMessageData(ctx);
        
    
    
    //ctx.etapaEmbudo = await chatWithAssistant(ctx,process.env.ASSISTANT_ID_2);
    //console.log("ctx.etapaEmbudo: ", ctx.etapaEmbudo);
   // const summary = await ollamaClassifier.summarizeText(assistantResponse);
    //console.log("Summary: ", summary);
    
   /*
    let customPrompt = "Responde 1 si el texto es positivo o 0 si es negativo: {text}";
    const result = await classifier.processCustomPromptNum(customPrompt,summary);
    */
    //console.log("Respuesta: "+result)
    //+" /nSummary :"+summary);
    
 //   if (result == 1) {
        //let emojiPrompt = "agregar emojis al siguiente texto sin aclarar nada: {text}";
        //resu lt = await classifier.processCustomPrompt(emojiPrompt, summary  );
        //const textWithEmojis = await classifier.agregarEmojiText(summary);
      // textWithEmojis = summary;
       // console.log("textWithEmojis: ", textWithEmojis)
        assistantResponse = 'summary';
   // }
    return assistantResponse;
  }

    // Expose helpers to flows
    async function executeNotionAssistant(ctx) {
        // Placeholder integration with Notion assistant — for now delegate to chatWithAssistant
        return chatWithAssistant(ctx);
    }

    async function chatWithAnythingllm(ctx) {
        const apiKey = process.env.ANYTHINGLLM_API_KEY;
        const apiUrl = process.env.ANYTHINGLLM_API_URL ?? 'http://localhost:61575/api';
        const anything = new AnythingLLM(apiKey, apiUrl);
        // call instance method if exists
        if (typeof anything.chatWithAnythingllm === 'function') {
            return anything.chatWithAnythingllm(ctx);
        }
        // fallback: ejecutarPrompt
        return anything.ejecutarPrompt(ctx.body ?? '');
    }

    export { run, getClientHistory, logicaMensajes, executeNotionAssistant, chatWithAnythingllm };




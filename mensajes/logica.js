//const { NotionWorkspaceAssistant } = require('./Logica/NotionWorkspaceAssistant');
const { ejecutarPrompt, listarModelos } = require('../src/Logica/AnythingLLM');
const { chatWithAssistant, getOrCreateThread } = require('./Assistant');
//const SalesFunnelClassifier = require('./Logica/salesFunnelClassifier');
//const ExcelJS = require('exceljs');
const OllamaFunnelClassifier = require('./OllamaFunnelClassifier');
const n8nClassifier = require('../src/Logica/n8nClassifier');


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

    data = {
        "question": history[history.length - 1].content,
        //     "context": history,
        "overrideConfig": {
            "sessionId": ctx.from,
            "returnSourceDocuments": true
        }
    };
    console.log("chat_history:", history)
    return queryResponse.text;
}


async function logicaMensajes(ctx) {
    //const threadId = await getOrCreateThread(ctx);
    
   // const classifier = new OllamaFunnelClassifier(getClientHistory);
   /* const funnelStage  = await classifier.classifyCustomer(ctx);
    ctx.etapaEmbudo = funnelStage;
    console.log(`funnelStage:`, funnelStage.text);*/

   // let assistantResponse = await chatWithAssistant(ctx);
    //classifyMessageData SalesFunnelClassifier
    const conversationClassifier = new n8nClassifier('http://localhost:5678/webhook/Webhook');
    //Direct call to classifier instance
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
        assistantResponse = "summary";
   // }
    return assistantResponse;
  }

module.exports = { run, getClientHistory, logicaMensajes };




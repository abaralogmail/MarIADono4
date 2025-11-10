const { createBot, createProvider, createFlow, addKeyword, EVENTS, gotoFlow } = require('@bot-whatsapp/bot')
const QRPortalWeb = require('@bot-whatsapp/portal')
const BaileysProvider = require('@bot-whatsapp/provider/baileys')
const JsonFileAdapter = require('@bot-whatsapp/database/json')
const express = require('express')
const { initializeServices, closeAllServices } = require('./src/services/initServices')
const sendBulkMessages = require('./mensajes/sendBulkMessages.js')
const { chatWithAssistant } = require('./mensajes/Assistant')
const { loadBlockedUsers, saveBlockedUsers, sendChunksWithDelay, logMessage } = require('./src/utils/sendChunksWithDelay')
const { logicaMensajes } = require('./mensajes/logica')
const OllamaFunnelClassifier = require('./mensajes/OllamaFunnelClassifier')

// Import flows
const flowVoice = require('./src/flows/flowVoice')
const flowMedia = require('./src/flows/flowMedia')
const flowPrincipal = require('./src/flows/flowPrincipal')
const flowEnviarMensaje = require('./src/flows/flowEnviarMensaje.js')
const updateVectorStoreFlow = require('./src/flows/flowUpdateVectorStore.js')
const flowAsistente = require('./src/flows/flowAsistente.js')
const { flowDesactivar, flowActivar } = require('./src/flows/flowOperador.js')
const flowTest = require('./src/flows/flowTest.js')
const flowEnviarDeudas = require('./src/flows/flowEnviarDeudas')
//const flowFileUpdate = require('./src/flows/flowFileUpdate.js')



const main = async () => {
    // Create Express app
    const app = express()

    // Initialize all services
    /*const serviceInitializer = new ServiceInitializer()
    serviceInitializer.initializeWebServer(app)*/
    initializeServices(app)

    const path = require('path');
    app.use(express.static(path.join(__dirname, 'src', 'public')));
    
    // Start web server
    const PORT = process.env.PORT || 4152; // O el puerto que hayas definido

    
    app.listen(PORT, () => {
        console.log(`Dashboard available at http://localhost:${PORT}/dashboard`)
    })

   
}


const BotCursosSalta = async () => {
    const BotName = 'bot'
    const adapterDB = new JsonFileAdapter()
    const adapterFlow = createFlow([flowEnviarMensaje, flowTest, flowMedia, flowVoice, flowDesactivar, flowActivar, flowAsistente, updateVectorStoreFlow, flowPrincipal, flowEnviarDeudas])
    const adapterProvider = createProvider(BaileysProvider, { name: BotName })
    

    createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    })

    QRPortalWeb({ name: BotName, port: 6001 })
}


const BotAdministracionSalta = async () => {
    const BotName = 'BotAdministracionSalta'
    const adapterDB = new JsonFileAdapter()
    const adapterFlow = createFlow([flowEnviarMensaje, flowTest, flowMedia, flowVoice, flowDesactivar, flowActivar, flowAsistente, updateVectorStoreFlow, flowPrincipal, flowEnviarDeudas])
    const adapterProvider = createProvider(BaileysProvider, { name: BotName })

    const bot = createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    })

    QRPortalWeb({ name: BotName, port: 6003 })
}


const BotOfertasTucuman = async () => {
    const BotName = 'BotOfertasTucuman'
    const adapterDB = new JsonFileAdapter()
    const adapterFlow = createFlow([flowEnviarMensaje, flowTest, flowMedia, flowVoice, flowDesactivar, flowActivar, flowAsistente, updateVectorStoreFlow, flowPrincipal, flowEnviarDeudas])
    const adapterProvider = createProvider(BaileysProvider, { name: BotName })

    const bot = createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    })

    QRPortalWeb({ name: BotName, port: 6002 })
//    simulateEvent(adapterProvider);

}

const BotAugustoTucuman = async () => {
    const BotName = 'BotAugustoTucuman'
    const adapterDB = new JsonFileAdapter()
    const adapterFlow = createFlow([flowEnviarMensaje, flowTest, flowMedia, flowVoice, flowDesactivar, flowActivar, flowAsistente, updateVectorStoreFlow, flowPrincipal, flowEnviarDeudas])
    const adapterProvider = createProvider(BaileysProvider, { name: BotName })

    const bot = createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    })

    QRPortalWeb({ name: BotName, port: 6009 })
    
}

const BotConsultasWeb = async () => {
    const BotName = 'BotConsultasWeb'
    const adapterDB = new JsonFileAdapter()
    const adapterFlow = createFlow([flowEnviarMensaje, flowTest, flowMedia, flowVoice, flowDesactivar, flowActivar, flowAsistente, updateVectorStoreFlow, flowPrincipal, flowEnviarDeudas])
    const adapterProvider = createProvider(BaileysProvider, { name: BotName })

    const bot = createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    })

    QRPortalWeb({ name: BotName, port: 6004 })
}

const BotRamiro = async () => {
    const BotName = 'BotRamiro()'
    const adapterDB = new JsonFileAdapter()
    const adapterFlow = createFlow([flowEnviarMensaje, flowTest, flowMedia, flowVoice, flowDesactivar, flowActivar, flowAsistente, updateVectorStoreFlow, flowPrincipal, flowEnviarDeudas])
    const adapterProvider = createProvider(BaileysProvider, { name: BotName })

    const bot = createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    })

    QRPortalWeb({ name: BotName, port: 6007 })
}

const BotJujuy = async () => {
    const BotName = 'BotJujuy'
    const adapterDB = new JsonFileAdapter()
    const adapterFlow = createFlow([flowEnviarMensaje, flowTest, flowMedia, flowVoice, flowDesactivar, flowActivar, flowAsistente, updateVectorStoreFlow, flowPrincipal, flowEnviarDeudas])
    const adapterProvider = createProvider(BaileysProvider, { name: BotName })

    const bot = createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    })

    QRPortalWeb({ name: BotName, port: 6008 })
}


const BotRoly = async () => {
    const BotName = 'BotRoly'
    const adapterDB = new JsonFileAdapter()
    const adapterFlow = createFlow([flowEnviarMensaje, flowTest, flowMedia, flowVoice, flowDesactivar, flowActivar, flowAsistente, updateVectorStoreFlow, flowPrincipal, flowEnviarDeudas])
    const adapterProvider = createProvider(BaileysProvider, { name: BotName })

    const bot = createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    })

    QRPortalWeb({ name: BotName, port: 6010 })
}


const BotFranco = async () => {
    const BotName = 'BotFranco'
    const adapterDB = new JsonFileAdapter()
    const adapterFlow = createFlow([flowEnviarMensaje, flowTest, flowMedia, flowVoice, flowDesactivar, flowActivar, flowAsistente, updateVectorStoreFlow, flowPrincipal, flowEnviarDeudas])
    const adapterProvider = createProvider(BaileysProvider, { name: BotName })

    const bot = createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    })

    QRPortalWeb({ name: BotName, port: 6011 })
}


const BotMetan = async () => {
    const BotName = 'BotMetan'
    const adapterDB = new JsonFileAdapter()
    const adapterFlow = createFlow([flowEnviarMensaje, flowTest, flowMedia, flowVoice, flowDesactivar, flowActivar, flowAsistente, updateVectorStoreFlow, flowPrincipal, flowEnviarDeudas])
    const adapterProvider = createProvider(BaileysProvider, { name: BotName })

    const bot = createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    })

    QRPortalWeb({ name: BotName, port: 6012 })
}


// ... existing code ...

// Reemplaza el bloque de arranques múltiples por un despachador de un solo bot:
//// main()
//// BotCursosSalta()  //BotName: bot - tel: 3875218575
//// BotAugustoTucuman() // BotName: BotAugustoTucuman - tel: 381248-8449
//// ... resto de invocaciones comentadas ...

// Inicia solo un bot por proceso según la variable de entorno BOT
const startSingleBot = async () => {
  const target = (process.env.BOT || 'BotAugustoTucuman');

  switch (target) {
    case 'cursossalta':
    case 'botcursossalta':
    case 'BotAugustoTucuman':
      await main();
      await BotAugustoTucuman();
      break;
/*

    case 'bot':
      await main();
      await BotCursosSalta();
      break;

  
    case 'ofertastucuman':
      await main();
      await BotOfertasTucuman();
      break;


    case 'consultasweb':
      await main();
      await BotConsultasWeb();
      break;

      
    case 'roly':
      await main();
      await BotRoly();
      break;

    case 'franco':
      await main();
      await BotFranco();
      break;

    case 'metan':
      await main();
      await BotMetan();
      break;

      /*
    case 'ramiro':
      await main();
      await BotRamiro();
      break;

    case 'jujuy':
      await main();
      await BotJujuy();
      break;*/

  /*case 'administracionsalta':
      await main();
      await BotAdministracionSalta();
      break;*/

    default:
      console.error(
        'Env var BOT no establecida o inválida. Usa uno de: CursosSalta, AdministracionSalta, OfertasTucuman, AugustoTucuman, ConsultasWeb, Ramiro, Jujuy, Roly, Franco, Metan'
      );
      process.exit(1);
  }
};

startSingleBot();

// ... rest of code ...

process.on('message', async (msg) => {
  if (msg === 'shutdown') {
    console.log('Closing all connections...');
    await closeAllServices();
    console.log('All connections closed. Shutting down.');
    process.exit(0);
  }
});
import { createBot, createProvider, createFlow } from '@builderbot/bot'
import QRPortalWeb from '@bot-whatsapp/portal'
import BaileysProvider from '@bot-whatsapp/provider/baileys'
import JsonFileAdapter from '@bot-whatsapp/database/json'
import express from 'express'
import { initializeServices, closeAllServices } from './src/services/initServices.js'
import sendBulkMessages from './mensajes/sendBulkMessages.js'
import { chatWithAssistant } from './mensajes/Assistant.js'
import sendChunksWithDelay from './src/utils/sendChunksWithDelay.js'
import { logicaMensajes } from './mensajes/logica.js';
import OllamaFunnelClassifier from './mensajes/OllamaFunnelClassifier.js';

// Import flows
import flowVoice from './src/flows/flowVoice.js'
import flowMedia from './src/flows/flowMedia.js'
import flowPrincipal from './src/flows/flowPrincipal.js'
import flowEnviarMensaje from './src/flows/flowEnviarMensaje.js'
import updateVectorStoreFlow from './src/flows/flowUpdateVectorStore.js'
import flowAsistente from './src/flows/flowAsistente.js'
import { flowDesactivar, flowActivar } from './src/flows/flowOperador.js'
import flowTest from './src/flows/flowTest.js'
import flowEnviarDeudas from './src/flows/flowEnviarDeudas.js'
//const flowFileUpdate = require('./src/flows/flowFileUpdate.js')



const main = async () => {
    // Create Express app
    const app = express()

    // Initialize all services
    /*const serviceInitializer = new ServiceInitializer()
    serviceInitializer.initializeWebServer(app)*/
    initializeServices(app)

    import path from 'path';
    import { fileURLToPath } from 'url';
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
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
    const BotName = 'BotRamiro'
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

const BotSaltaMostrador = async () => {
    const BotName = 'BotSaltaMostrador'
    const adapterDB = new JsonFileAdapter()
    const adapterFlow = createFlow([flowEnviarMensaje, flowTest, flowMedia, flowVoice, flowDesactivar, flowActivar, flowAsistente, updateVectorStoreFlow, flowPrincipal, flowEnviarDeudas])
    const adapterProvider = createProvider(BaileysProvider, { name: BotName })

    const bot = createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    })

    QRPortalWeb({ name: BotName, port: 6013 })
}


const BotColo = async () => {
    const BotName = 'BotColo'
    const adapterDB = new JsonFileAdapter()
    const adapterFlow = createFlow([flowEnviarMensaje, flowTest, flowMedia, flowVoice, flowDesactivar, flowActivar, flowAsistente, updateVectorStoreFlow, flowPrincipal, flowEnviarDeudas])
    const adapterProvider = createProvider(BaileysProvider, { name: BotName })

    const bot = createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    })

    QRPortalWeb({ name: BotName, port: 6014 })
}



main()
//BotCursosSalta()  //BotName: bot - tel: 3875218575
//BotOfertasTucuman() // BotName:BotOfertasTucuman - tablet July - tel: 381363-8101
//BotAdministracionSalta()
BotAugustoTucuman() // BotName: BotAugustoTucuman - tel: 381248-8449


//BotConsultasWeb()// BotName: BotConsultasWeb - tel: 381590-8557
//BotRamiro() // BotName: BotRamiro() - tel: 387225-5083
//BotJujuy() // BotName: BotJujuy - tel: 388571-2603
//BotRoly() // BotName: BotRoly - tel: 5493813690061
//BotFranco() // BotName: BotFranco - tel: 
//BotMetan() // BotName: BotMetan - tel: +549387 6621962
//BotSaltaMostrador() // BotName: BotSaltaMostrador - tel: +54 9 387 521-8221
//BotColo() // BotName: BotSaltaMostrador - tel: +54 9 3814739666


process.on('message', async (msg) => {
  if (msg === 'shutdown') {
    console.log('Closing all connections...');
    await closeAllServices();
    console.log('All connections closed. Shutting down.');
    process.exit(0);
  }
});
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import express from 'express'
import { createBot, createProvider, createFlow, addKeyword, utils, MemoryDB } from '@builderbot/bot'
import { BaileysProvider} from '@builderbot/provider-baileys'
import { initializeServices, closeAllServices } from './src/services/initServices.js'
import sendBulkMessages from './mensajes/sendBulkMessages.js'
import { chatWithAssistant } from './mensajes/Assistant.js'
import sendChunksPkg from './src/utils/sendChunksWithDelay.js'
const { loadBlockedUsers, saveBlockedUsers, sendChunksWithDelay, logMessage } = sendChunksPkg
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { logicaMensajes } = require('./mensajes/logica.js');
const OllamaFunnelClassifier = require('./mensajes/OllamaFunnelClassifier.js');

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


const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const main = async () => {
    // Create Express app
    const app = express()

    // Initialize all services
    /*const serviceInitializer = new ServiceInitializer()
    serviceInitializer.initializeWebServer(app)*/
    initializeServices(app)

    app.use(express.static(join(__dirname, 'src', 'public')));
    
    // Start web server
    const PORT = process.env.PORT || 4152; // O el puerto que hayas definido

    
    app.listen(PORT, () => {
        console.log(`Dashboard available at http://localhost:${PORT}/dashboard`)
    })

   
}

// Global error handlers to surface auth or other startup errors with full stacks
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason && reason.stack ? reason.stack : reason);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err && err.stack ? err.stack : err);
  // keep default behavior minimal but ensure process exits to avoid corrupted state
  process.exit(1);
});


const BotCursosSalta = async () => {
    const BotName = 'bot'
    const adapterDB = new MemoryDB()
    const adapterFlow = createFlow([flowEnviarMensaje, flowTest, flowMedia, flowVoice, flowDesactivar, flowActivar, flowAsistente, updateVectorStoreFlow, flowPrincipal, flowEnviarDeudas])
    const adapterProvider = createProvider(BaileysProvider, { name: BotName })
    

    const { handleCtx, httpServer } = await createBot({
      flow: adapterFlow,
      provider: adapterProvider,
      database: adapterDB,
    })

    // start provider http server (BuilderBot style)
    httpServer(6001)
    QRPortalWeb({ name: BotName, port: 6001 })
}


const BotAdministracionSalta = async () => {
    const BotName = 'BotAdministracionSalta'
    const adapterDB = new MemoryDB()
    const adapterFlow = createFlow([flowEnviarMensaje, flowTest, flowMedia, flowVoice, flowDesactivar, flowActivar, flowAsistente, updateVectorStoreFlow, flowPrincipal, flowEnviarDeudas])
    const adapterProvider = createProvider(BaileysProvider, { name: BotName })

    const { handleCtx, httpServer } = await createBot({
      flow: adapterFlow,
      provider: adapterProvider,
      database: adapterDB,
    })

    httpServer(6003)
    QRPortalWeb({ name: BotName, port: 6003 })
}


const BotOfertasTucuman = async () => {
    const BotName = 'BotOfertasTucuman'
    const adapterDB = new MemoryDB()
    const adapterFlow = createFlow([flowEnviarMensaje, flowTest, flowMedia, flowVoice, flowDesactivar, flowActivar, flowAsistente, updateVectorStoreFlow, flowPrincipal, flowEnviarDeudas])
    const adapterProvider = createProvider(BaileysProvider, { name: BotName })

    const { handleCtx, httpServer } = await createBot({
      flow: adapterFlow,
      provider: adapterProvider,
      database: adapterDB,
    })

    httpServer(6002)
    QRPortalWeb({ name: BotName, port: 6002 })
//    simulateEvent(adapterProvider);

}



const BotConsultasWeb = async () => {
    const BotName = 'BotConsultasWeb'
    const adapterDB = new MemoryDB()
    const adapterFlow = createFlow([flowEnviarMensaje, flowTest, flowMedia, flowVoice, flowDesactivar, flowActivar, flowAsistente, updateVectorStoreFlow, flowPrincipal, flowEnviarDeudas])
    const adapterProvider = createProvider(BaileysProvider, { name: BotName })

    const { handleCtx, httpServer } = await createBot({
      flow: adapterFlow,
      provider: adapterProvider,
      database: adapterDB,
    })

    httpServer(6004)
    QRPortalWeb({ name: BotName, port: 6004 })
}

const BotRamiro = async () => {
    const BotName = 'BotRamiro()'
    const adapterDB = new MemoryDB()
    const adapterFlow = createFlow([flowEnviarMensaje, flowTest, flowMedia, flowVoice, flowDesactivar, flowActivar, flowAsistente, updateVectorStoreFlow, flowPrincipal, flowEnviarDeudas])
    const adapterProvider = createProvider(BaileysProvider, { name: BotName })

    const { handleCtx, httpServer } = await createBot({
      flow: adapterFlow,
      provider: adapterProvider,
      database: adapterDB,
    })

    httpServer(6007)
    QRPortalWeb({ name: BotName, port: 6007 })
}

const BotJujuy = async () => {
    const BotName = 'BotJujuy'
    const adapterDB = new MemoryDB()
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
    const adapterDB = new MemoryDB()
    const adapterFlow = createFlow([flowEnviarMensaje, flowTest, flowMedia, flowVoice, flowDesactivar, flowActivar, flowAsistente, updateVectorStoreFlow, flowPrincipal, flowEnviarDeudas])
    const adapterProvider = createProvider(BaileysProvider, { name: BotName })

    const { handleCtx, httpServer } = await createBot({
      flow: adapterFlow,
      provider: adapterProvider,
      database: adapterDB,
    })

    httpServer(6010)
    QRPortalWeb({ name: BotName, port: 6010 })
}


const BotFranco = async () => {
    const BotName = 'BotFranco'
    const adapterDB = new MemoryDB()
    const adapterFlow = createFlow([flowEnviarMensaje, flowTest, flowMedia, flowVoice, flowDesactivar, flowActivar, flowAsistente, updateVectorStoreFlow, flowPrincipal, flowEnviarDeudas])
    const adapterProvider = createProvider(BaileysProvider, { name: BotName })

    const { handleCtx, httpServer } = await createBot({
      flow: adapterFlow,
      provider: adapterProvider,
      database: adapterDB,
    })

    httpServer(6011)
    QRPortalWeb({ name: BotName, port: 6011 })
}


const BotMetan = async () => {
    const BotName = 'BotMetan'
    const adapterDB = new MemoryDB()
    const adapterFlow = createFlow([flowEnviarMensaje, flowTest, flowMedia, flowVoice, flowDesactivar, flowActivar, flowAsistente, updateVectorStoreFlow, flowPrincipal, flowEnviarDeudas])
    const adapterProvider = createProvider(BaileysProvider, { name: BotName })

    const { handleCtx, httpServer } = await createBot({
      flow: adapterFlow,
      provider: adapterProvider,
      database: adapterDB,
    })

    httpServer(6012)
    QRPortalWeb({ name: BotName, port: 6012 })
}

const BotAugustoTucuman1 = async () => {
    const BotName = 'BotAugustoTucuman'
    const adapterDB = new MemoryDB()
    const adapterFlow = createFlow([flowEnviarMensaje, flowTest, flowMedia, flowVoice, flowDesactivar, flowActivar, flowAsistente, updateVectorStoreFlow, flowPrincipal, flowEnviarDeudas])
    const adapterProvider = createProvider(BaileysProvider, { name: BotName })
    adapterProvider.initHttpServer(6009)

    const { handleCtx, httpServer } = await createBot({
      flow: adapterFlow,
      provider: adapterProvider,
      database: adapterDB,
    })
    
    //httpServer(+PORT)

    httpServer(6009)
    //QRPortalWeb({ name: BotName, port: 6009 })
    
}

const BotAugustoTucuman = async () => {
    const adapterFlow = createFlow([flowEnviarMensaje, flowTest, flowMedia, flowVoice, flowDesactivar, flowActivar, flowAsistente, updateVectorStoreFlow, flowPrincipal, flowEnviarDeudas])
    
    const adapterProvider = createProvider(BaileysProvider, { version: [2, 3000, 1027934701] })
    const adapterDB = new MemoryDB()

    const { handleCtx, httpServer } = await createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    })

    adapterProvider.server.post(
        '/v1/messages',
        handleCtx(async (bot, req, res) => {
            const { number, message, urlMedia } = req.body
            await bot.sendMessage(number, message, { media: urlMedia ?? null })
            return res.end('sended')
        })
    )

    adapterProvider.server.post(
        '/v1/register',
        handleCtx(async (bot, req, res) => {
            const { number, name } = req.body
            await bot.dispatch('REGISTER_FLOW', { from: number, name })
            return res.end('trigger')
        })
    )

    adapterProvider.server.post(
        '/v1/samples',
        handleCtx(async (bot, req, res) => {
            const { number, name } = req.body
            await bot.dispatch('SAMPLES', { from: number, name })
            return res.end('trigger')
        })
    )

    adapterProvider.server.post(
        '/v1/blacklist',
        handleCtx(async (bot, req, res) => {
            const { number, intent } = req.body
            if (intent === 'remove') bot.blacklist.remove(number)
            if (intent === 'add') bot.blacklist.add(number)

            res.writeHead(200, { 'Content-Type': 'application/json' })
            return res.end(JSON.stringify({ status: 'ok', number, intent }))
        })
    )

    adapterProvider.server.get(
        '/v1/blacklist/list',
        handleCtx(async (bot, req, res) => {
            const blacklist = bot.blacklist.getList()
            res.writeHead(200, { 'Content-Type': 'application/json' })
            return res.end(JSON.stringify({ status: 'ok', blacklist }))
        })
    )

    httpServer(+PORT)
}



// ... existing code ...

// Reemplaza el bloque de arranques múltiples por un despachador de un solo bot:
//// main()
//// BotCursosSalta()  //BotName: bot - tel: 3875218575
//// BotAugustoTucuman() // BotName: BotAugustoTucuman - tel: 381248-8449
//// ... resto de invocaciones comentadas ...

// Determine target from CLI arg, then env, then default
const startSingleBot = async () => {
  const cliArg = (typeof process.argv[2] !== 'undefined' && process.argv[2]) ? process.argv[2] : null;
  const targetFromEnv = (process.env.BOT || 'BotAugustoTucuman');
  const target = cliArg || targetFromEnv;

  // Dispatch to the correct bot based on the target
  switch (target) {
    case 'cursossalta':
    case 'botcursossalta':
    case 'BotAugustoTucuman':
      await main();
      await BotAugustoTucuman();
      break;
    case 'BotOfertasTucuman':
      await main();
      await BotOfertasTucuman();
      break;
    case 'BotAdministracionSalta':
      await main();
      await BotAdministracionSalta();
      break;
    case 'BotCursosSalta':
      await main();
      await BotCursosSalta();
      break;
    case 'BotConsultasWeb':
      await main();
      await BotConsultasWeb();
      break;
    case 'BotRamiro':
      await main();
      await BotRamiro();
      break;
    case 'BotJujuy':
      await main();
      await BotJujuy();
      break;
    case 'BotRoly':
      await main();
      await BotRoly();
      break;
    case 'BotFranco':
      await main();
      await BotFranco();
      break;
    case 'BotMetan':
      await main();
      await BotMetan();
      break;
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
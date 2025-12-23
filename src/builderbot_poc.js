'use strict';

const { createBot, createProvider, createFlow, addKeyword, MemoryDB, BaileysProvider } = require('@builderbot/bot');

const adapterDB = new MemoryDB();

const flowHello = addKeyword(['hello','hi'])
  .addAnswer(['Hello BuilderBot PoC']);

const adapterFlow = createFlow([flowHello]);

const adapterProvider = createProvider(BaileysProvider);
adapterProvider.initHttpServer(3000);

const main = async () => {
  try {
    await createBot({
      flow: adapterFlow,
      provider: adapterProvider,
      database: adapterDB
    });
    console.log('PoC started');
  } catch (err) {
    console.error('PoC error', err);
  }
};

main();
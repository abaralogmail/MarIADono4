import MessageStatusChecker from '../bulk/MessageStatusChecker';


async function testProviderVendor(provider, ctx) {
  if (!provider || !provider.vendor) {
    console.error("Invalid provider or provider.vendor");
    return;
  }
  try {
    // En tu código principal
    provider.initBailey();

   

    // Verificar estado de un mensaje específico
    //ctx messageId
   // const status = await statusChecker.checkMessageStatus(ctx);
    //console.log("Message status:", status);

    // Obtener todos los estados
          // Step 1: Get today's message count from the database
      

    // Obtener todos los estados de los mensajes
    const statusChecker = new MessageStatusChecker(provider);
    const allStatuses = await statusChecker.getAllMessageStatusesHoy();
    console.log("All message statuses:", allStatuses);
    // Verificar mensajes pendientes
    //const pendingMessages = await statusChecker.getPendingMessages();

    const vendor = provider.vendor;
    auxCatalog = await vendor.getCatalog({ jid: ctx.key.remoteJid, limit: 10, cursor: null });
    console.log(auxCatalog);
    auxStatus = await vendor.fetchStatus(ctx.key.remoteJid);
    console.log(auxStatus);
    auxCatalog.products.forEach(product => {
        console.log(product.name);
        console.log(product.imageUrls.original);
        downloadImage(product.imageUrls.original, product.name);
    });
    
    /* provider.vendor.store.messages.forEach(message => {
        console.log(`Message ID: ${message.id}`);   
        console.log(`Message Body: ${message.body}`);
        console.log(`Message from: ${message.from}`);
        console.log(`Message to: ${message.to}`);   
        console.log(`Message timestamp: ${message.timestamp}`);
        console.log(`Message type: ${message.type}`);
        console.log(`Message status: ${message.status}`);
        console.log(`Message quoted: ${message.quoted ? 'Yes' : 'No'}`);
    });*/
    /*
    const functionNames = Object.getOwnPropertyNames(Object.getPrototypeOf(vendor))
        .filter(fn => typeof vendor[fn] === 'function' && fn !== 'constructor');

    console.log(`Found ${functionNames.length} functions on provider.vendor:`, functionNames);

    for (const fnName of functionNames) {
      
            console.log(`Calling ${fnName}...`);
            // Try calling with no args, or with dummy args if you know them
            const result = vendor[fnName].length === 0
                ? await vendor[fnName]()
                : await vendor[fnName]();

            //console.log(`Result from ${fnName}:`, result);*/
  } catch (error) {
    console.error(`Error calling :`, error);
  }
  //}
}

export default { testProviderVendor };

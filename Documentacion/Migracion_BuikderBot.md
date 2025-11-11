Migrating from bot-whatsapp to builderbot: A Simple Guide
=========================================================

builderbot is the next evolution of bot-whatsapp, maintaining 99% compatibility while introducing significant improvements. This guide will walk you through the straightforward migration process.

[Key Differences](https://www.builderbot.app/en/tutorials/migrate-to-builderbot#key-differences)
------------------------------------------------------------------------------------------------

1.  **Name Change**: From bot-whatsapp to builderbot
2.  **Enhanced Language Support**: Now includes TypeScript in addition to JavaScript
3.  **Improved Features**: New functionalities while maintaining familiar concepts

-   [![leifermendez](https://www.builderbot.app/_next/image?url=https%3A%2F%2Favatars.githubusercontent.com%2Fu%2F15802366%3Fv%3D4&w=64&q=75)](https://github.com/leifermendez)leifermendez

* * * *

[Easy Migration Steps](https://www.builderbot.app/en/tutorials/migrate-to-builderbot#easy-migration-steps)
----------------------------------------------------------------------------------------------------------

### Update Dependencies

First, install the latest builderbot core:

```
npminstall@builderbot/bot@latest
# or
pnpmadd@builderbot/bot@latest

```
CopyCopied!

### Install Your Preferred Provider

Choose and install the provider you're using:

baileysmetatwiliovenomwppconnectwhatsapp-web

```
pnpminstall@builderbot/provider-baileys@latest

```
CopyCopied!

### Update Imports

Modify your imports to use builderbot:

```
// Old
const { createBot,createProvider,createFlow,addKeyword } =require('@bot-whatsapp/bot')
// New
const { createBot,createProvider,createFlow,addKeyword,MemoryDB } =require('@builderbot/bot')

```
CopyCopied!

### Update Provider

Change the provider import and initialization:

```
// Old
constWebWhatsappProvider=require('@bot-whatsapp/provider/web-whatsapp')
// New
const { BaileysProvider } =require('@builderbot/bot')
// When initializing:
constadapterProvider=createProvider(BaileysProvider)
adapterProvider.initHttpServer(3000) // New feature in builderbot

```
CopyCopied!

### Update Database

Update your database adapter:

```
// Old
constMockAdapter=require('@bot-whatsapp/database/mock')
constadapterDB=newMockAdapter()
// New
const { MemoryDB } =require('@builderbot/bot')
constadapterDB=newMemoryDB()

```
CopyCopied!

### Review and Update Flows

While most of your flows will work as-is, consider using new features like `addAction` for more complex logic:

```
constinfoFlow=addKeyword('info')
.addAction(async (ctx, { flowDynamix }) => {
awaitflowDynamix(`Welcome ${ctx.name}`)
    })

```
CopyCopied!

[Code Comparison](https://www.builderbot.app/en/tutorials/migrate-to-builderbot#code-comparison)
------------------------------------------------------------------------------------------------

Here's a side-by-side comparison of a basic bot setup in bot-whatsapp and builderbot:

bot-whatsappbuilderbot

```
const { createBot,createProvider,createFlow,addKeyword } =require('@bot-whatsapp/bot')
constBaileysProvider=require('@bot-whatsapp/provider/baileys')
constMockAdapter=require('@bot-whatsapp/database/mock')
constflowPrincipal=addKeyword(['hola','alo'])
.addAnswer(['Hola, bienvenido a mi tienda','¿Como puedo ayudarte?'])
.addAnswer(['Tengo:','Zapatos','Bolsos','etc ...'])
constmain=async () => {
constadapterDB=newMockAdapter()
constadapterFlow=createFlow([flowPrincipal])
constadapterProvider=createProvider(BaileysProvider)
createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    })
}
main()

```
CopyCopied!

[

Final Considerations](https://www.builderbot.app/en/tutorials/migrate-to-builderbot#final-considerations)
------------------------------------------------------------------------------------------------------------

-   Migration should be relatively straightforward due to high compatibility
-   Take advantage of new builderbot features, especially if you opt to use TypeScript
-   Maintain your existing development practices and patterns, as they remain valid
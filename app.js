import { join } from 'path'
import pkg from '@builderbot/bot'
const { createBot, createProvider, createFlow, addKeyword, utils, MemoryDB: Database, EVENTS } = pkg
import { MetaProvider as Provider } from '@builderbot/provider-meta'
import 'dotenv/config'
import { spawn } from 'child_process'
import flowPrincipal from './src/flows/flowPrincipal.js';
import initServices from './src/services/initServices.js'

const PORT = process.env.PORT ?? 3000

const infoFlow = addKeyword(['info', 'ceridono', 'empresa', 'quienes'])
    .addAnswer(
        [
            'Ceridono es tu aliado regional con más de 40 años de experiencia en repuestos originales y alternativos para refrigeración domiciliaria, comercial, industrial y automotor en Tucumán, Salta y Jujuy.',
            'Distribuidores oficiales de Mahle, Whirlpool, LG, Samsung y Electrolux. Stock amplio de herramientas, gases, compresores, mangueras, caños, filtros y manifolds.',
            'Centro de Formación Profesional (matrícula CACAAV): cursos iniciales, intermedios y avanzados, online y presencial.',
            'Servicio técnico multimarca con garantía oficial y asistencia a domicilio.',
            'Visita nuestra tienda online o contactanos por WhatsApp al *381 590-8557* para asesoramiento y envíos a todo el NOA.',
        ].join('\n\n')
    )

const welcomeFlow = addKeyword(EVENTS.WELCOME)
    .addAnswer(`🙌 ¡Hola! Bienvenido a *Ceridono Refrigeración*`)
    .addAnswer(
        [
            '¿En qué podemos ayudarte? Escribe una de las opciones:',
            '👉 *repuestos* - Ver catálogo y stock',
            '👉 *cursos* - Información sobre formación y fechas',
            '👉 *contacto* - Hablar con un asesor por WhatsApp',
            '👉 *info* - Conocer más sobre Ceridono',
        ].join('\n'),
        { delay: 600, capture: true },
        async (ctx, { fallBack, gotoFlow }) => {
            const body = ctx.body.toLocaleLowerCase()
            if (!['repuestos', 'catalogo', 'cursos', 'contacto', 'info'].some(k => body.includes(k))) {
                // Si no coincide con las opciones, redirigir al flujo principal para procesar el mensaje
                return gotoFlow(flowPrincipal);
            }
            return
        }
    )

const registerFlow = addKeyword(utils.setEvent('REGISTER_FLOW'))
    .addAnswer(`Register_Flow Casa`, { capture: true }, async (ctx, { state }) => {
        await state.update({ name: ctx.body })
    })
    .addAnswer('¿Qué marca y modelo buscas o qué consulta tenés?', { capture: true }, async (ctx, { state }) => {
        await state.update({ producto: ctx.body })
    })
    .addAnswer('¿Desde qué localidad nos contactás? (Tucumán / Salta / Jujuy / Otra)', { capture: true }, async (ctx, { state }) => {
        await state.update({ ciudad: ctx.body })
    })
    .addAction(async (_, { flowDynamic, state }) => {
        await flowDynamic(
            `${state.get('name')}, gracias. Registré tu consulta sobre: ${state.get('producto')}. Nos contactaremos desde Ceridono al WhatsApp *381 590-8557* para asesorarte y coordinar envío/servicio.`
        )
    })

const repuestosFlow = addKeyword(['repuestos', 'catalogo', 'stock'])
    .addAnswer('Contamos con amplio stock de repuestos originales y alternativos para todas las marcas.')
    .addAnswer('Enviamos a todo el NOA. ¿Querés que te asesore un especialista por WhatsApp al *381 590-8557*?', { delay: 600, capture: true })

const cursosFlow = addKeyword(['cursos', 'formación', 'formacion', 'capacitacion', 'capacitación'])
    .addAnswer(
        [
            'Nuestro Centro de Formación Profesional (matrícula CACAAV) ofrece cursos iniciales, intermedios y avanzados en instalación y mantenimiento de split, aires comerciales y automotores.',
            'Modalidades: online y presencial. Hay plazas y promociones periódicas.',
            '¿Te interesa recibir información sobre fechas y aranceles? Escribe *si* para que te contactemos.',
        ].join('\n\n'),
        { capture: true }
    )

const contactoFlow = addKeyword(['contacto', 'asesor', 'asesoria', 'asesoramiento'])
    .addAnswer('Podés comunicarte con nuestro equipo de ventas y soporte por WhatsApp al *381 590-8557* (horario comercial). ¿Querés que te llame un asesor?', { capture: true })
    .addAction(async (ctx, { flowDynamic }) => {
        const body = ctx.body.toLocaleLowerCase()
        if (body.includes('si') || body.includes('sí')) {
            await flowDynamic('Perfecto. Por favor envíanos tu nombre y un horario preferido y te contactamos.')
        } else {
            await flowDynamic('Entendido. Si necesitás algo más, escribí *repuestos*, *cursos* o *info*.')
        }
    })

const samplesFlow = addKeyword(['samples', utils.setEvent('SAMPLES')])
    .addAnswer(`Te envío un ejemplo de catálogo y materiales de Ceridono.`)
    .addAnswer(`Visita nuestra tienda online o contactanos por WhatsApp al 381 590-8557.`)
    .addAnswer(`Imagen de ejemplo`, { media: 'https://picsum.photos/seed/ceridono/600/400' })
    .addAction(async (ctx, { gotoFlow }) => {
        return gotoFlow(flowPrincipal);
    })
    

const main = async () => {
    const adapterFlow = createFlow([
        
        flowPrincipal,
        welcomeFlow,
        infoFlow,
        repuestosFlow,
        cursosFlow,
        contactoFlow,
        registerFlow,
        samplesFlow
    ])
    const adapterProvider = createProvider(Provider, {
        jwtToken: process.env.META_WHATSAPP_TOKEN,
        numberId: process.env.META_PHONE_NUMBER_ID,
        verifyToken: process.env.META_VERIFY_TOKEN,
        version: process.env.META_API_VERSION ?? 'v22.0'
    })
    const adapterDB = new Database()

    const { handleCtx, httpServer } = await createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    })

    // Simple request logger to help debug 404s during tests
    adapterProvider.server.use((req, res, next) => {
        console.log(`[REQ] ${req.method} ${req.originalUrl} from ${req.ip}`)
        next()
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

    // Dump registered routes to help debug missing handlers
    try {
        const routes = []
        const router = adapterProvider.server._router
        if (router && router.stack) {
            router.stack.forEach((layer) => {
                if (layer.route && layer.route.path) {
                    const methods = Object.keys(layer.route.methods).join(',').toUpperCase()
                    routes.push(`${methods} ${layer.route.path}`)
                }
            })
        }
        console.log('[ROUTES] Registered server routes:\n' + (routes.length ? routes.join('\n') : '<none>'))
    } catch (e) {
        console.log('[ROUTES] Failed to inspect routes:', e && e.message)
    }

    httpServer(+PORT)

    // Initialize auxiliary services (databases, backups, optional n8n, auto-register)
    try {
        await initServices.initializeServices(adapterProvider.server)
    } catch (err) {
        console.error('initializeServices failed:', err)
    }

    if (process.env.RUN_TESTS_ON_START ?? 'true' === 'true') {
        try {
            const runner = spawn(process.execPath, ['src/tests/Testing_Webhook.js'], {
                env: Object.assign({}, process.env, { RUN_FROM_APP: 'true' }),
                stdio: 'inherit',
            })
            runner.on('exit', (code) => console.log(`Test runner salió con exito ${code}`))
        } catch (err) {
            console.error('Failed to start test runner:', err)
        }
    }
}

main()

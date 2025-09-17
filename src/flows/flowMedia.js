const { handlerAI } = require("../../mensajes/whisper.js");
const { addKeyword, EVENTS } = require('@bot-whatsapp/bot');
const flowPrincipal = require('./flowPrincipal.js');
const { sendChunksWithDelay } = require('../utils/sendChunksWithDelay.js');
const OllamaFunnelClassifier = require('../../mensajes/OllamaFunnelClassifier');
const { downloadMediaMessage } = require("@adiwajshing/baileys");
const { getUserConfig, checkTranscriptionEnabled } = require('../config/userConfig');
const MessageData = require("../utils/MessageData.js");
const { writeMediaMessage, readMediaFromContext } = require('../utils/readWriteMediaMessage.js');
const OpenAI = require('openai');
const N8nWebhookListener = require('../Logica/N8nWebhookListener');
const fs = require('fs');



const flowMedia = addKeyword(EVENTS.MEDIA)
    .addAction(async (ctx, { flowDynamic, gotoFlow }) => {
       /* console.log("Media: ");
        const mediaFilePath = await writeMediaMessage(ctx);
        let data = await downloadMediaMessage(ctx, "buffer");

        const mediaDescription = await describeMedia(ctx); // Pass ctx to describeMedia
        ctx.body = mediaDescription;

        const hasTranscriptionEnabled = await checkTranscriptionEnabled(ctx.from);
        if (hasTranscriptionEnabled) {
            // Send transcription to user
            await flowDynamic([{body: `🎯 Transcripción del media:\n\n${ctx.body}`}]);
        }

        // Update the context with the processed media
       // sendChunksWithDelay([ctx.body], 0, ctx, flowDynamic);
        //await flowDynamic([{ body: ctx.body, to: ctx.from }]);

*/
        // Go to flowPrincipal
        return gotoFlow(flowPrincipal);
    });

async function summarizeDescription(description, ctx) {
    try {
        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        });

        const response = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [
                {
                    role: "user",
                    content: `Por favor, resume la siguiente descripción del medio en un máximo de 100 palabras: ${description}`
                }
            ],
            max_tokens: 200
        });

        return response.choices[0].message.content;
    } catch (error) {
        console.error('Error al resumir la descripción:', error);
        throw error;
    }
}


async function describeMedia(ctx) {
    let mediaType = null;

    if (ctx.message && ctx.message.imageMessage) {
        mediaType = 'image';
    } else if (ctx.message && ctx.message.videoMessage) {
        mediaType = 'video';
    }

    if (!mediaType) {
        return 'Tipo de medio no soportado';
    }

    try {
        let description = '';

        switch (mediaType) {
            case 'image':
                // Add logic to describe the image
                description = await describeImageOpenAi(ctx);
                break;
            case 'video':
                // Add logic to describe the video
                description = `Video recibido`;
                break;
            default:
                return 'Tipo de medio no soportado';
        }

        return description;
    } catch (error) {
        console.error(`Error al analizar el medio: ${error.message}`);
        return 'Ocurrió un error al procesar el medio';
    }
}


async function describeVideo(mediaFilePath, ctx) {
    try {
        //let data = await downloadMediaMessage(ctx, "buffer");

        //const base64Video = videoBuffer.toString('base64');
        // Initialize n8n webhook listener
        const n8nWebhook = new N8nWebhookListener('http://localhost:5678/webhook/WebhookMediaDescribe');

        // Listen for webhook events
        //await n8nWebhook.listenForWebhook('87eec5d3-23b6-4439-bbce-a30256e984ab', nuevoMessageData);
        // await n8nWebhook.triggerWebhook('87eec5d3-23b6-4439-bbce-a30256e984ab', nuevoMessageData);
        //mostrar respues descripcion de video
        //const videoDescription = await n8nWebhook.triggerWebhook('87eec5d3-23b6-4439-bbce-a30256e984ab', nuevoMessageData);
        const videoDescription = await n8nWebhook.sendWebhook(mediaFilePath);
        console.log("videoDescription: ", videoDescription);
        // sendChunksWithDelay(largeResponse, 5000, nuevoMessageData, flowDynamic);

    } catch (err) {
        console.log(`[ERROR]:`, err);
    }
}

async function describeImageOpenAi(ctx) {
    try {
        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        });
        //let data = await downloadMediaMessage(ctx, "buffer");
        //const imageBuffer = fs.readFileSync(mediaFilePath);
        const imageBuffer = await downloadMediaMessage(ctx, "buffer");

        const base64Image = imageBuffer.toString('base64');

        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "user",
                    content: [
                        {
                            type: "text",
                            text: "Por favor, describe esta imagen en detalle. Incluye los elementos principales, textos, números y la composición general."
                        },
                        {
                            type: "image_url",
                            image_url: {
                                url: `data:image/jpeg;base64,${base64Image}`
                            }
                        }
                    ]
                }
            ],
            max_tokens: 500
        });

        if (ctx.message.imageMessage.caption) {
            //concatenar la descripcion de la imagen con el caption
            const respuesta = response.choices[0].message.content + "\n\n Caption:" + ctx.message.imageMessage.caption;
            return respuesta;
        }
        else {
            return response.choices[0].message.content;
        }

    } catch (error) {
        console.error('Error al analizar la imagen:', error);
        throw error;
    }
}

async function describeVideoOpenAi(videoBuffer) {
    try {
        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });

        // Convert buffer to base64
        const base64Video = videoBuffer.toString('base64');

        // Create the API request using createChatCompletion
        const response = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [
                {
                    role: "user",
                    content: `Por favor, describe este video en detalle. Incluye los elementos principales, narración, música y la trama general.`
                },
                {
                    role: "user",
                    content: base64Video,
                    name: 'video.mp4',
                    file_type: 'video/mp4'
                }
            ],
            max_tokens: 500
        });

        return response.choices[0].message.content;
    } catch (error) {
        console.error('Error al analizar el video:', error);
        throw error;
    }
}
module.exports = flowMedia;
const { downloadMediaMessage } = require("@builderbot/bot");
const { checkTranscriptionEnabled } = require('../config/userConfig');
const { writeMediaMessage } = require('./readWriteMediaMessage.js');
const OpenAI = require('openai');
const N8nWebhookListener = require('../Logica/N8nWebhookListener');
const fs = require('fs');

/**
 * Handle media message processing and description
 * @param {Object} ctx - Message context
 * @param {Function} flowDynamic - Flow dynamic function
 * @returns {Object} - Media processing result
 */
const handleMediaProcessing = async (ctx, flowDynamic) => {
    try {
        console.log("Processing media message...");
        
        // Write media to file and get file path
        const mediaFilePath = await writeMediaMessage(ctx);
        
        // Download media buffer
        const mediaBuffer = await downloadMediaMessage(ctx, "buffer");
        
        // Describe the media content
        const mediaDescription = await describeMedia(ctx);
        
        // Check if user has transcription enabled
        const hasTranscriptionEnabled = await checkTranscriptionEnabled(ctx.from);
        
        // Send description to user if enabled
        if (hasTranscriptionEnabled) {
            await flowDynamic([{
                body: `🎯 Descripción del media:\n\n${mediaDescription}`
            }]);
        }
        
        return {
            success: true,
            description: mediaDescription,
            filePath: mediaFilePath,
            buffer: mediaBuffer,
            descriptionSent: hasTranscriptionEnabled
        };
        
    } catch (error) {
        console.error('Error handling media processing:', error);
        return {
            success: false,
            error: error.message,
            description: 'Error al procesar el media',
            filePath: null,
            buffer: null,
            descriptionSent: false
        };
    }
};

/**
 * Describe media content based on type
 * @param {Object} ctx - Message context
 * @returns {string} - Media description
 */
const describeMedia = async (ctx) => {
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
                description = await describeImageOpenAi(ctx);
                break;
            case 'video':
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
};

/**
 * Describe image using OpenAI Vision API
 * @param {Object} ctx - Message context
 * @returns {string} - Image description
 */
const describeImageOpenAi = async (ctx) => {
    try {
        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        });

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

        let description = response.choices[0].message.content;

        // Add caption if exists
        if (ctx.message.imageMessage.caption) {
            description = description + "\n\nCaption: " + ctx.message.imageMessage.caption;
        }

        return description;

    } catch (error) {
        console.error('Error al analizar la imagen:', error);
        throw error;
    }
};

/**
 * Describe video using N8n webhook
 * @param {string} mediaFilePath - Path to video file
 * @param {Object} ctx - Message context
 * @returns {string} - Video description
 */
const describeVideo = async (mediaFilePath, ctx) => {
    try {
        const n8nWebhook = new N8nWebhookListener('http://localhost:5678/webhook/WebhookMediaDescribe');
        const videoDescription = await n8nWebhook.sendWebhook(mediaFilePath);
        console.log("videoDescription: ", videoDescription);
        return videoDescription;
    } catch (err) {
        console.log(`[ERROR]:`, err);
        throw err;
    }
};

/**
 * Summarize description using OpenAI
 * @param {string} description - Original description
 * @param {Object} ctx - Message context
 * @returns {string} - Summarized description
 */
const summarizeDescription = async (description, ctx) => {
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
};

module.exports = {
    handleMediaProcessing,
    describeMedia,
    describeImageOpenAi,
    describeVideo,
    summarizeDescription
};

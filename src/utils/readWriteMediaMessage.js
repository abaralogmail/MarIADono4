const { downloadMediaMessage } = require("@adiwajshing/baileys");
const fs = require('fs');


async function writeMediaMessage(ctx) {
    //console.log("Message structure:", JSON.stringify(ctx.message, null, 2));
    
    if (!ctx.message.imageMessage && !ctx.message.videoMessage) {
        console.error('No media message found in the context.');
        return null;
    }
    

    if (ctx.message.imageMessage) {
        return await writeImageMessage(ctx);
    } else if (ctx.message.videoMessage) {
        return await writeVideoMessage(ctx);
    }
}


async function readMediaFromContext(ctx) {
    if (ctx.message.imageMessage) {
        return await readImageFromContext(ctx);
    } else if (ctx.message.videoMessage) {
        return await readVideoFromContext(ctx);
    }
    console.error('No media message found in the context.');
    return null;
}

async function writeImageMessage(ctx) {
    if (!ctx.message.imageMessage) return;

    try {
        const buffer = await downloadMediaMessage(ctx, "buffer");
        const mediaFilePath = `./tmp/${Date.now()}-${ctx.message.imageMessage.id}.jpg`;
        fs.writeFileSync(mediaFilePath, buffer);
        return mediaFilePath; // Return the path of the saved image
    } catch (error) {
        console.error('Error al descargar el mediaBuffer:', error);
        return null; // Return null in case of error
    }
}

async function readImageFromContext(ctx) {
    if (!ctx.message.imageMessage) {
        console.error('No se encontró ninguna imagen en el contexto.');
        return null;
    }

    try {
        const buffer = await downloadMediaMessage(ctx, "buffer");
        return buffer; // Return the buffer of the image
    } catch (error) {
        console.error('Error al leer la imagen del contexto:', error);
        return null; // Return null in case of error
    }
}


async function writeVideoMessage(ctx) {
    if (!ctx.message.videoMessage) return;

    try {
        const buffer = await downloadMediaMessage(ctx, "buffer");
        const mediaFilePath = `./tmp/${Date.now()}-${ctx.message.videoMessage.id}.mp4`;
        fs.writeFileSync(mediaFilePath, buffer);
        return mediaFilePath; // Return the path of the saved video
    } catch (error) {
        console.error('Error downloading the videoBuffer:', error);
        return null; // Return null in case of error
    }
}

async function readVideoFromContext(ctx) {
    if (!ctx.message.videoMessage) {
        console.error('No video found in the context.');
        return null;
    }

    try {
        const buffer = await downloadMediaMessage(ctx, "buffer");
        return buffer; // Return the buffer of the video
    } catch (error) {
        console.error('Error reading the video from context:', error);
        return null; // Return null in case of error
    }
}

module.exports = {
    writeMediaMessage,
    readMediaFromContext
};

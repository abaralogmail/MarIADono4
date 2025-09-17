const { Configuration, OpenAIApi, OpenAI } = require("openai");
const { downloadMediaMessage } = require("@adiwajshing/baileys");

const fs = require('fs');
const path = require('path');

const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const ffmpeg = require("fluent-ffmpeg");
ffmpeg.setFfmpegPath(ffmpegPath);

// Importaciones para manejar funciones básicas de WhatsApp usando Baileys
// Importación para usar el servicio de OpenAI para la transcripción de audio
// Importaciones relacionadas con FFmpeg para convertir formatos de archivo
// Función para convertir audio a texto

const FormData = require('form-data');

const voiceToText = async (path) => {
    if (!fs.existsSync(path)) {
        throw new Error("No se encuentra el archivo");
    }
    try {
        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        });
        
        const transcription = await openai.audio.transcriptions.create({
            file: fs.createReadStream(path),
            model: "whisper-1"
        });
        
        return transcription.text;
    } catch (err) {
        console.log(err.message);
        return "ERROR";
    }
};


const convertOggMp3 = async (inputPath, outputPath) => {
    return new Promise((resolve, reject) => {
        const outputStream = fs.createWriteStream(outputPath);
        ffmpeg(inputPath)
            .audioCodec('libmp3lame')
            .audioBitrate(128)
            .format('mp3')
            .on('end', () => {
                outputStream.end();
                resolve(true);
            })
            .on('error', (err) => {
                outputStream.end();
                reject(err);
            })
            .pipe(outputStream);
    });
};


// Maneja todo el proceso de conversión de voz a texto
const handlerAI = async (ctx) => {
    // Descarga el archivo multimedia usando Baileys y guarda su buffer
    const buffer = await downloadMediaMessage(ctx, "buffer");

    // Crea dos archivos temporales: uno en formato OGG y otro en formato MP3
    const pathTmpOgg = path.join(process.cwd(), 'tmp', `voice-note-${Date.now()}.ogg`);
    const pathTmpMp3 = path.join(process.cwd(), 'tmp', `voice-note-${Date.now()}.mp3`);

    // Escribe el buffer del archivo multimedia en el archivo temporal OGG
    await fs.writeFileSync(pathTmpOgg, buffer);

    // Convierte el archivo OGG a MP3 usando la función convertOggMp3
    await convertOggMp3(pathTmpOgg, pathTmpMp3);

    // Converte el audio MP3 al texto usando OpenAI y devuelve el resultado
    const text = await voiceToText(pathTmpMp3);

    // Borra los archivos temporales luego del proceso
    fs.unlink(pathTmpMp3, (error) => {
        if (error) throw error;
    });
    fs.unlink(pathTmpOgg, (error) => {
        if (error) throw error;
    });

    // Devuelve el texto resultante
    return text;
};

// Exporta la función handlerAI para su uso en otros archivos
module.exports = { handlerAI };